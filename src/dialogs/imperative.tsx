import {
  Component,
  useEffect,
  useLayoutEffect,
  useRef,
  useSyncExternalStore,
  type ReactNode,
} from "react";
import { createRoot, type Root } from "react-dom/client";
import { DIALOG_ANIMATION } from "./animation";

/** 关闭动画结束后到卸载的裕量（ms）：吸收定时器与动画的调度误差，确保淡出播完 */
const CLOSE_UNMOUNT_MARGIN = 50;

/** 命令式弹窗的卸载延时：Dialog关闭动画时长 + 裕量 */
const CLOSE_DURATION = DIALOG_ANIMATION.closeDuration + CLOSE_UNMOUNT_MARGIN;

/** body兜底host的深度哨兵：任一真实OOUIProvider的host（有限深度）都比它更靠外、恒优先 */
const FALLBACK_DEPTH = Number.MAX_SAFE_INTEGER;

/**
 * 命令式弹窗的挂载句柄：交给confirm/alert/prompt的render闭包。
 * open驱动Dialog开合动画，close播完关闭动画后兑现结果并从队列移除
 */
export interface ImperativeDialogHandle<T> {
  /** 是否进入打开态 */
  open: boolean;

  /** 关闭并以result兑现（先播关闭动画，结束后从队列移除） */
  close: (result: T) => void;
}

/** 队列内一条待渲染的命令式弹窗：render来自调用方，resolve/reject为其Promise的兑现口 */
interface DialogEntry {
  /** 自增序号，作React key与移除依据 */
  id: number;

  /** 调用方提供的渲染闭包（confirm/alert/prompt各自构造MessageDialog） */
  render: (handle: ImperativeDialogHandle<unknown>) => ReactNode;

  /** 兑现调用方Promise */
  resolve: (result: unknown) => void;

  /** 拒绝调用方Promise（渲染期崩溃时） */
  reject: (error: unknown) => void;

  /**
   * 弹窗开合态：经openEntry/closeEntry不可变更新。新弹窗首帧关闭、挂载后置true进入
   * 打开动画时序；主机易主重挂载时新实例以当前值续渲染——打开中的弹窗首帧即开（入场
   * 动画因Dialog挂载即开仍会重播）、关闭中的弹窗维持关闭不回弹
   */
  open: boolean;

  /** 兑现守卫：close/crash先到者经settleEntry置位、后到者不再生效 */
  settled: boolean;
}

/** 待渲染的命令式弹窗队列（confirm/alert/prompt入队，host渲染，兑现后出队） */
let entries: readonly DialogEntry[] = [];
let idCounter = 0;

/** store变更的订阅者（各host的useSyncExternalStore），任一变更后逐一通知 */
const listeners = new Set<() => void>();

/**
 * in-tree host注册表：token -> 该host所属OOUIProvider的嵌套深度（根为0）与登记序。
 * 选主机取**最外层**（最小深度，同深取先登记者）——命令式调用无位置信息，以应用根部的
 * 配置渲染最可预期（见dev-docs/comparison-guide.md「命令式弹窗的渲染环境」）
 */
const hosts = new Map<symbol, { depth: number; seq: number }>();
let hostSeq = 0;

/** 空队列常量：非主机host的快照恒返回它，保证引用稳定（useSyncExternalStore要求getSnapshot幂等） */
const NO_ENTRIES: readonly DialogEntry[] = [];

/** body兜底host的挂载点：无OOUIProvider时懒挂，空闲时卸载（见ensureFallbackHost/maybeTeardownFallback） */
let fallbackRoot: Root | null = null;
let fallbackContainer: HTMLElement | null = null;

/** 通知全部订阅者重取快照 */
function emit(): void {
  for (const listener of listeners) {
    listener();
  }
}

/** host订阅store变更（entries增删、主机易主时重取快照） */
function subscribeStore(listener: () => void): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

/** 当前主机token（最外层host：最小深度、同深取先登记者）；无host时null */
function primaryToken(): symbol | null {
  let best: { token: symbol; depth: number; seq: number } | null = null;
  for (const [token, info] of hosts) {
    if (
      best === null ||
      info.depth < best.depth ||
      (info.depth === best.depth && info.seq < best.seq)
    ) {
      best = { token, depth: info.depth, seq: info.seq };
    }
  }
  return best === null ? null : best.token;
}

/**
 * 某host的渲染快照：仅主机返回真实队列，其余返回稳定空常量。
 * 两个分支各自引用稳定（队列未变即同一entries引用，非主机恒NO_ENTRIES），满足
 * useSyncExternalStore对getSnapshot的幂等要求，仅主机易主/队列增删时才触发重渲染
 */
function getHostSnapshot(token: symbol): readonly DialogEntry[] {
  return primaryToken() === token ? entries : NO_ENTRIES;
}

/** host挂载时登记（深度决定选主机优先级）；由ImperativeDialogHost在layout阶段调用 */
function registerHost(token: symbol, depth: number): void {
  hosts.set(token, { depth, seq: hostSeq++ });
  emit();
}

/** host卸载时注销；若仍有未结弹窗但已无host，懒挂body兜底host接管 */
function unregisterHost(token: symbol): void {
  hosts.delete(token);
  emit();
  if (entries.length > 0 && hosts.size === 0) {
    ensureFallbackHost();
  }
}

/**
 * 入队一个命令式弹窗并返回其兑现Promise：供confirm/alert/prompt调用。
 * 无任何in-tree host时懒挂body兜底host（无OOUIProvider也能用，按各配置项缺省值渲染）；
 * 有host时由最外层host在自己的Provider子树内渲染，弹窗因此继承该子树的全部context
 * （文案/isMobile/dir，及应用挂在OOUIProvider之上的路由、状态等Provider）
 */
export function enqueueDialog<T>(
  render: (handle: ImperativeDialogHandle<T>) => ReactNode,
): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    entries = [
      ...entries,
      {
        id: ++idCounter,
        render: render as DialogEntry["render"],
        resolve: resolve as DialogEntry["resolve"],
        reject,
        open: false,
        settled: false,
      },
    ];
    // 无in-tree host时才挂body兜底；有真实Provider的host（layout阶段已登记）则交给它
    if (hosts.size === 0) {
      ensureFallbackHost();
    }
    emit();
  });
}

/** 从队列移除一条弹窗（兑现/崩溃后）；移除后队列空则卸载body兜底host */
function removeDialog(id: number): void {
  entries = entries.filter((entry) => entry.id !== id);
  emit();
  maybeTeardownFallback();
}

/** 幂等置开：新弹窗挂载后进入打开态；已settled或已open的entry不翻转 */
function openEntry(id: number): void {
  const entry = entries.find((e) => e.id === id);
  if (!entry || entry.settled || entry.open) {
    return;
  }
  entries = entries.map((e) => (e.id === id ? { ...e, open: true } : e));
  emit();
}

/**
 * 兑现守卫置位（close/crash先到者胜出）：settled落盘并置open=false，使接管重挂载以关闭态
 * 续渲染；只改写entries不emit，通知时机由调用方决定。返回被置位的entry（其resolve/reject
 * 供调用方兑现），无此entry或已settled时返回undefined
 */
function settleEntry(id: number): DialogEntry | undefined {
  const entry = entries.find((e) => e.id === id);
  if (!entry || entry.settled) {
    return undefined;
  }
  entries = entries.map((e) => (e.id === id ? { ...e, open: false, settled: true } : e));
  return entry;
}

/** 关闭并兑现结果：先播关闭动画，结束后移除队列；settled守卫使重复close不再生效 */
function closeEntry(id: number, result: unknown): void {
  const entry = settleEntry(id);
  if (entry) {
    emit();
    setTimeout(() => {
      entry.resolve(result);
      removeDialog(id);
    }, CLOSE_DURATION);
  }
}

/**
 * 渲染期崩溃出口：向调用方reject（异常不伪装成「取消」），移除延后一拍——不在React错误
 * 处理的同步阶段触发host的队列setState。不emit：崩溃子树已被错误边界渲染为null，重渲染
 * 无意义；entries的落盘由延后一拍的removeDialog一并通知
 */
function crashEntry(id: number, error: unknown): void {
  const entry = settleEntry(id);
  if (entry) {
    entry.reject(error);
    setTimeout(() => removeDialog(id), 0);
  }
}

/** 懒挂body兜底host：无OOUIProvider时承载命令式弹窗（英文缺省）。已挂则幂等返回 */
function ensureFallbackHost(): void {
  if (fallbackRoot) {
    return;
  }
  fallbackContainer = document.createElement("div");
  document.body.appendChild(fallbackContainer);
  fallbackRoot = createRoot(fallbackContainer);
  fallbackRoot.render(<ImperativeDialogHost depth={FALLBACK_DEPTH} />);
}

/** 队列清空后卸载body兜底host（真实Provider的host不在此清理，fallbackRoot为null即跳过） */
function maybeTeardownFallback(): void {
  if (!fallbackRoot || entries.length > 0) {
    return;
  }
  const root = fallbackRoot;
  const container = fallbackContainer;
  fallbackRoot = null;
  fallbackContainer = null;
  // 卸载延后一拍：不在React提交/事件派发的同步栈内unmount自身
  setTimeout(() => {
    root.unmount();
    container?.remove();
  }, 0);
}

/**
 * 命令式弹窗渲染期错误边界：捕获弹窗子树的渲染错误并交给crashEntry（reject + 移除队列），
 * 否则Promise永不兑现（调用方await永久卡死）、entry残留队列。host挂在应用React树内，
 * 未捕获的渲染错误会向上冒垮应用树，故此边界必不可少。捕获后渲染null止血；
 * 原始错误由React默认日志输出，不在此吞掉堆栈
 */
class DialogErrorBoundary extends Component<
  { onError: (error: unknown) => void; children: ReactNode },
  { hasError: boolean }
> {
  override state = { hasError: false };

  // getDerivedStateFromError由React静态调用、基类未声明，不能用override
  static getDerivedStateFromError() {
    return { hasError: true };
  }

  override componentDidCatch(error: unknown) {
    this.props.onError(error);
  }

  override render() {
    return this.state.hasError ? null : this.props.children;
  }
}

/**
 * 单条命令式弹窗的挂载骨架：开合态与兑现守卫记在队列条目上（本组件只读渲染，变更经
 * openEntry/closeEntry/crashEntry不可变更新，通知时机见各函数说明），主机易主重挂载时
 * 以条目当前态续渲染。新弹窗首帧以关闭态渲染、挂载后经openEntry置open进入打开动画
 * 时序；close时播完关闭动画再从队列移除并兑现，渲染期崩溃则交crashEntry reject后移除
 */
function ManagedDialog({ entry }: { entry: DialogEntry }) {
  useEffect(() => {
    openEntry(entry.id);
  }, [entry.id]);

  return (
    <DialogErrorBoundary onError={(error) => crashEntry(entry.id, error)}>
      {entry.render({
        open: entry.open,
        close: (result) => closeEntry(entry.id, result),
      })}
    </DialogErrorBoundary>
  );
}

/**
 * 命令式弹窗的in-tree宿主：由每个OOUIProvider渲染于自己的配置子树内，订阅弹窗队列。
 * 嵌套Provider时仅最外层host为主机、渲染全部弹窗（见getHostSnapshot/primaryToken），
 * 其余host渲染空。弹窗节点经此挂在应用React树内，从而继承所在配置子树的context（弹窗
 * DOM仍由各自的WindowManager portal至document.body，与挂载位置无关）。
 * depth为所属Provider的嵌套深度；body兜底host以FALLBACK_DEPTH登记、永居最内
 */
export function ImperativeDialogHost({ depth }: { depth: number }) {
  // token与本host实例一一对应且跨渲染恒定：作注册表键与快照订阅的身份
  const tokenRef = useRef<symbol | null>(null);
  const token = (tokenRef.current ??= Symbol("ooui-dialog-host"));

  // 用useLayoutEffect登记：同一提交内layout effect全部先于passive effect执行，故同提交
  // 挂载的组件在useEffect中调用命令式API时host已登记（用useEffect则被「子先父后」执行的
  // 调用方抢先、误判无host而挂body兜底）
  useLayoutEffect(() => {
    registerHost(token, depth);
    return () => unregisterHost(token);
  }, [token, depth]);

  // 服务端快照恒为空队列：命令式API只在客户端入队，SSR/SSG 下 host 不渲染任何弹窗
  // （缺省该参数时 React 对服务端渲染直接抛错）
  const activeEntries = useSyncExternalStore(
    subscribeStore,
    () => getHostSnapshot(token),
    () => NO_ENTRIES,
  );

  return (
    <>
      {activeEntries.map((entry) => (
        <ManagedDialog key={entry.id} entry={entry} />
      ))}
    </>
  );
}
