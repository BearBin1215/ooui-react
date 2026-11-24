import {
  Children,
  forwardRef,
  isValidElement,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
  type SyntheticEvent,
} from "react";
import { flushSync } from "react-dom";
import clsx from "clsx";
import { useLatestRef, useMergedRefs } from "../../hooks";
import type { ElementProps } from "../../Element";
import type { ToolGroupBaseProps } from "../Tool";
import {
  promotedSelectionsEqual,
  promotionSignature,
  resolvePromotedTools,
  type PromotableGroupPlan,
} from "../promotion";
import {
  ToolbarGroupOrderProvider,
  ToolbarNarrowProvider,
  ToolbarPositionProvider,
  ToolbarPromotionProvider,
  type ToolbarPromotableGroupInfo,
  type ToolbarPromotionContextValue,
} from "./context";

/**
 * 窄栏类名：state派生与测量期临时增删共用同一常量，避免字面量分叉
 */
const NARROW_CLASS = "oo-ui-toolbar-narrow";

/** 无工具提升时的空提升态（模块级常量，避免每次测量新建） */
const EMPTY_PROMOTION: ReadonlyMap<object, ReadonlySet<string>> = new Map();

/** 元素宽（不含外边距），对齐原版getPromotionMeasurements的getWidth */
const getRectWidth = (element: Element | null): number =>
  element?.getBoundingClientRect().width ?? 0;

/**
 * 元素外宽（含左右外边距），对齐原版getPromotionMeasurements的getOuterWidth：
 * 提升容器内工具之间的分隔由外边距承担，逐个累计时须计入
 */
function getOuterWidth(element: Element | null): number {
  if (!element) {
    return 0;
  }
  const style = getComputedStyle(element);
  return (
    getRectWidth(element) +
    (parseFloat(style.marginLeft) || 0) +
    (parseFloat(style.marginRight) || 0)
  );
}

/** 已解析的可提升工具组：键用于回填提升态，getInfo按需读取最新工具集与DOM元素 */
interface ResolvedPromotableGroup {
  key: object;
  getInfo: () => ToolbarPromotableGroupInfo;
}

/**
 * 一次工具提升测量的结果（按可提升工具集的内容签名缓存，对齐原版
 * `Toolbar.getPromotionMeasurements`，oojs-ui.js:21288-21356）
 */
interface PromotionMeasurements {
  /** 测量时的可提升工具组（其键用于回填提升态） */
  groups: readonly ResolvedPromotableGroup[];
  /** 可提升工具集的内容签名，与当前签名一致才可复用 */
  signature: string;
  /** 无提升时的工具栏内容基准宽（工具区 + 右侧工具区 + actions） */
  baseWidth: number;
  /** 各组在提升容器内的工具宽、边距与容器附加宽 */
  plans: PromotableGroupPlan[];
}

/**
 * 收集已登记且确有可提升工具集的工具组，并按声明序号排序（对齐原版按工具栏 items 的
 * 声明顺序处理；`align="after"` 的组在 DOM 中排到右侧容器，提升优先级仍是声明顺序）
 */
function collectPromotableGroups(
  registry: Map<object, () => ToolbarPromotableGroupInfo>,
): ResolvedPromotableGroup[] {
  const groups: ResolvedPromotableGroup[] = [];
  registry.forEach((getInfo, key) => {
    if (getInfo().sets.length > 0) {
      groups.push({ key, getInfo });
    }
  });
  return groups.sort((a, b) => a.getInfo().order - b.getInfo().order);
}

/** 由各组测量信息构造「全部可提升工具都被提升」的临时提升态（测量相） */
function buildFullPromotion(
  groups: readonly ResolvedPromotableGroup[],
): ReadonlyMap<object, ReadonlySet<string>> {
  const map = new Map<object, ReadonlySet<string>>();
  for (const group of groups) {
    map.set(group.key, new Set(group.getInfo().sets.flat()));
  }
  return map;
}

/**
 * 跨组聚合的可提升工具集内容签名：组增减、声明顺序或工具集/组内顺序变化时变化。
 * 栏宽与文本变化不改变签名——测量值按此缓存（对齐原版getPromotionMeasurements的
 * 缓存语义，见measure内注释）。组签名复用promotion.ts，外层再序列化一次以保留组边界
 */
function promotionGroupsSignature(groups: readonly ResolvedPromotableGroup[]): string {
  return JSON.stringify(groups.map((group) => promotionSignature(group.getInfo())));
}

export interface ToolbarProps extends ElementProps<HTMLDivElement> {
  /**
   * Tool groups (`BarToolGroup`, `ListToolGroup`, `MenuToolGroup`, etc.).
   *
   * 工具组集合
   */
  children?: ReactNode;

  /**
   * Toolbar position; affects popup direction and class names.
   *
   * 工具栏位置，影响弹出面板的展开方向与类名
   *
   * @default 'top'
   */
  position?: "top" | "bottom";

  /**
   * Content of the separate actions area on the right.
   *
   * 右侧独立动作区内容
   */
  actions?: ReactNode;
}

// 实现说明：对齐原版OO.ui.Toolbar——窄栏模式下按narrowConfig切换handle与工具的图标/文本
// （对齐setNarrow/onToolbarResize），并随栏宽容纳度自动提升/收回弹层工具组声明的工具
// （对齐updatePromotedTools/getPromotedToolCount，见dev-docs/comparison-guide.md「共享抽象」）。
// 工具组经声明式props传入，不经原版的ToolFactory/ToolGroupFactory注册，
// 见dev-docs/DEVIATIONS.md「舍弃」
/**
 * A toolbar: a horizontal bar arranging several tool groups, with tools living
 * inside the groups.
 *
 * 工具栏：一条横栏容器，内部排列若干工具组，工具由工具组承载。
 *
 * @see https://ooui-react.pages.dev/components/toolbar/
 */
export const Toolbar = forwardRef<HTMLDivElement, ToolbarProps>(
  ({ children, position = "top", actions, className, ...rest }, ref) => {
    const rootRef = useRef<HTMLDivElement>(null);
    const mergedRef = useMergedRefs(rootRef, ref);
    const barRef = useRef<HTMLDivElement>(null);
    const toolsRef = useRef<HTMLDivElement>(null);
    const afterRef = useRef<HTMLDivElement>(null);
    const actionsRef = useRef<HTMLDivElement>(null);
    // 窄栏判定经state参与className（对齐原版onWindowResize加/移除oo-ui-toolbar-narrow）：
    // classList单改会被下一次受控className覆盖（className/position变化而children引用稳定时丢失），
    // state才是权威源；measure()内临时remove/add与setNarrow同源，仅用于取未压缩宽度
    const [narrow, setNarrow] = useState(false);
    // 工具提升态：组注册键 → 被提升的工具名集合（对齐原版PopupToolGroup.promotedTools，
    // 提升决策由Toolbar统一持有并下发）
    const [promoted, setPromoted] =
      useState<ReadonlyMap<object, ReadonlySet<string>>>(EMPTY_PROMOTION);
    const promotedRef = useLatestRef(promoted);
    // 可提升工具组的注册表：值为读取最新测量信息的getter
    const promotionGroupsRef = useRef(
      new Map<object, () => ToolbarPromotableGroupInfo>(),
    );
    const rafRef = useRef(0);
    // measure可能在React提交前再次触发，故以narrowRef读写最新窄栏态；
    // 渲染期同步赋值用于兜底StrictMode重挂载（state存续而ref重建）
    const narrowRef = useRef(narrow);
    narrowRef.current = narrow;
    // 窄栏判定基准（宽栏、无提升时的内容总宽）与过期标记：effect 重跑（actions 容器挂卸/
    // position/className 变化）时标脏。窄栏态下不能就地重测（narrowConfig 已替换 handle 与
    // 工具文本，量出的基准偏小），measure 内先切回宽栏形态再量（对齐原版
    // getNarrowThreshold 的惰性语义，oojs-ui.js:21135-21148）
    const thresholdRef = useRef<number | null>(null);
    const thresholdDirtyRef = useRef(true);
    // 工具提升的宽度测量缓存：按可提升工具集的内容签名缓存，栏宽变化只按缓存宽度
    // 重算可容纳数量（对齐原版getPromotionMeasurements的缓存语义——原版以工具实例
    // 身份为键，内容集不变即复用；工具集或组增减时本工程重测）
    const promotionMeasurementsRef = useRef<PromotionMeasurements | null>(null);
    // 内容观察器：测量自身会搬动工具（触发childList记录），测量结束经takeRecords丢弃，
    // 避免观察器把自己的搬动当成新变化而帧帧重测
    const contentObserverRef = useRef<MutationObserver | null>(null);

    /**
     * 对齐原版onPointerDown（原版mousedown/keydown共用同一handler）：事件目标不在任何子
     * .oo-ui-widget内（点在工具栏空白处）或与工具栏自身同属一个widget时，返回false等效的
     * preventDefault+stopPropagation
     */
    const handlePointerDown = (ev: SyntheticEvent) => {
      const target = ev.target;
      if (!(target instanceof Element)) {
        return;
      }
      const closestWidget = target.closest(".oo-ui-widget");
      const ownWidget = rootRef.current?.closest(".oo-ui-widget") ?? null;
      if (!closestWidget || closestWidget === ownWidget) {
        ev.preventDefault();
        ev.stopPropagation();
      }
    };

    /**
     * 测量窄栏与工具提升（对齐原版onWindowResize：setNarrow后updatePromotedTools）。
     * 仅经rAF排队调用：提升测量要在同一任务内同步翻转两相DOM（收回全部→全部提升）
     * 再量宽，经flushSync提交；React生命周期内调用flushSync会告警且无法同步刷新。
     *
     * DOM 搬动按触发源收敛：提升工具的父节点在「平铺容器 ↔ 弹层面板」之间变化即重挂
     * （自持的浮层开合态重置、焦点丢失），故只有基准或测量值过期时才收回提升；
     * 栏宽变化命中缓存时只按缓存宽度重算可容纳数量，结果不变即不动DOM
     * （对齐原版getPromotionMeasurements命中即返回、setPromotedTools对同集早退的行为）。
     */
    const measure = useCallback(() => {
      const bar = barRef.current;
      const root = rootRef.current;
      if (!bar || !root) {
        return;
      }

      const groups = collectPromotableGroups(promotionGroupsRef.current);
      const dropMutations = () => contentObserverRef.current?.takeRecords();
      const commitPromotion = (next: ReadonlyMap<object, ReadonlySet<string>>) => {
        if (promotedSelectionsEqual(promotedRef.current, next)) {
          return;
        }
        flushSync(() => setPromoted(next));
      };
      /** 应用窄栏态：类名先同步写回（免去等待React提交的闪烁），state经flushSync立即生效 */
      const applyNarrow = (next: boolean) => {
        root.classList.toggle(NARROW_CLASS, next);
        if (narrowRef.current === next) {
          return;
        }
        narrowRef.current = next;
        flushSync(() => setNarrow(next));
      };
      /**
       * 量取窄栏判定基准（阈值）。调用方须已收回全部提升并切到宽栏形态：
       * narrow 类会压缩工具组宽度（主题CSS有多处 .narrow 规则），narrowConfig 又会替换
       * handle 与工具的可见文本，以窄栏形态量为基准会偏小、导致工具栏提前退出窄栏
       */
      const measureThreshold = () => {
        thresholdRef.current =
          (toolsRef.current?.offsetWidth ?? 0) +
          (afterRef.current?.offsetWidth ?? 0) +
          (actionsRef.current?.offsetWidth ?? 0);
        thresholdDirtyRef.current = false;
      };
      /**
       * 「无提升 → 全提升」两相测量（对齐原版getPromotionMeasurements的前后半段）：
       * 调用方须已收回全部提升且处于宽栏形态，结果写入缓存
       */
      const measurePromotion = (signature: string): PromotionMeasurements => {
        // 无提升相：量工具栏基准宽与各组宽
        const baseWidth =
          getRectWidth(toolsRef.current) +
          getRectWidth(afterRef.current) +
          getRectWidth(actionsRef.current);
        const groupWidths = groups.map((group) =>
          getOuterWidth(group.getInfo().rootElement),
        );

        // 全提升相：量工具在提升容器内的平铺外宽、边距与容器附加宽
        commitPromotion(buildFullPromotion(groups));
        const plans: PromotableGroupPlan[] = groups.map((group, index) => {
          const info = group.getInfo();
          const names = info.sets.flat();
          const elements = names.map((name) => info.getToolElement(name));
          const toolWidths = elements.map((element) => getOuterWidth(element));
          return {
            itemNames: info.itemNames,
            sets: info.sets,
            toolWidths,
            toolMargins: toolWidths.map(
              (width, toolIndex) => width - getRectWidth(elements[toolIndex]),
            ),
            containerWidth:
              getOuterWidth(info.promotedElement) -
              toolWidths.reduce((sum, width) => sum + width, 0),
            groupWidth: groupWidths[index],
          };
        });
        const measurements: PromotionMeasurements = {
          groups,
          signature,
          baseWidth,
          plans,
        };
        promotionMeasurementsRef.current = measurements;
        return measurements;
      };

      // 窄栏判定基准：effect重跑后标脏（重置时机与原版的差异见dev-docs/DEVIATIONS.md「增强」），
      // 初始即为脏、从未量过时同样会测。重测须先切到宽栏形态，故窄栏态下会同步翻到宽栏
      // 量完再改判——两步都在同一任务内完成、中间不绘制，不产生可见闪烁
      const remeasureThreshold = thresholdDirtyRef.current;

      // 宽度测量按可提升工具集的内容签名缓存：栏宽变化只按缓存的工具/容器宽与当前栏宽
      // 重算可容纳数量（对齐原版getPromotionMeasurements的缓存；工具集或组增减才重测）
      const signature = promotionGroupsSignature(groups);
      const cached = promotionMeasurementsRef.current;
      const cacheHit =
        !!cached &&
        cached.signature === signature &&
        cached.groups.length === groups.length &&
        cached.groups.every((group, index) => group.key === groups[index].key);

      // 基准与两相测量都要求「无提升」相：仅在确实要重测时收回全部提升
      if (remeasureThreshold || !cacheHit) {
        commitPromotion(EMPTY_PROMOTION);
      }

      if (remeasureThreshold) {
        applyNarrow(false);
        measureThreshold();
      }
      const nextNarrow = bar.clientWidth <= (thresholdRef.current ?? 0);
      applyNarrow(nextNarrow);

      if (!groups.length || nextNarrow) {
        // 窄栏下不提升（对齐原版getPromotedToolCount的isNarrow分支）
        commitPromotion(EMPTY_PROMOTION);
        dropMutations();
        return;
      }

      // 命中缓存时复用测量值、按当前栏宽就地重算提升名单；名单未变则 commitPromotion
      // 早退，不搬动DOM，已提升工具的焦点与浮层保持
      const measurements = cacheHit && cached ? cached : measurePromotion(signature);

      // 按当前栏宽选提升集并提交（同一组的多个集合合并进该组的工具名列表）；
      // 测量期的DOM搬动记录一并丢弃（见contentObserverRef注释）
      const selections = resolvePromotedTools(
        measurements.plans,
        measurements.baseWidth,
        bar.clientWidth,
      );
      const finalPromotion = new Map<object, Set<string>>();
      for (const selection of selections) {
        const key = measurements.groups[selection.groupIndex].key;
        const names = finalPromotion.get(key);
        if (names) {
          selection.names.forEach((name) => names.add(name));
        } else {
          finalPromotion.set(key, new Set(selection.names));
        }
      }
      commitPromotion(finalPromotion);
      dropMutations();
    }, [promotedRef]);

    /** 经rAF排队测量：RO回调内同步改布局会触发"ResizeObserver loop"错误通知 */
    const scheduleMeasure = useCallback(() => {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = requestAnimationFrame(measure);
    }, [measure]);

    /** 可提升工具组登记（Toolbar经getInfo读取最新工具集与元素，不在注册时做快照） */
    const registerPromotableGroup = useCallback(
      (key: object, getInfo: () => ToolbarPromotableGroupInfo) => {
        promotionGroupsRef.current.set(key, getInfo);
        scheduleMeasure();
        return () => {
          promotionGroupsRef.current.delete(key);
          scheduleMeasure();
        };
      },
      [scheduleMeasure],
    );

    const promotionContextValue = useMemo<ToolbarPromotionContextValue>(
      () => ({
        promoted,
        register: registerPromotableGroup,
        requestUpdate: scheduleMeasure,
      }),
      [promoted, registerPromotableGroup, scheduleMeasure],
    );

    // actions容器的在位状态（内容变化由MutationObserver承接，见下方effect注释）
    const hasActions = !!actions;

    useEffect(() => {
      // 窄栏判定基准与提升测量同批失效：effect重跑（actions容器挂卸/position/className
      // 变化）会改变工具栏内容宽，沿用旧基准会误判。基准只标脏不就地丢弃——当前可能处于
      // 窄栏形态，窄栏文本量不出正确基准（见measureThreshold注释），由下一次measure
      // 切回宽栏形态后重测
      thresholdDirtyRef.current = true;
      promotionMeasurementsRef.current = null;
      scheduleMeasure();

      // 栏宽变化由RO(bar)承接；内容宽度变化（工具组/动作区增减、文本更新）由
      // MutationObserver承接——tools容器为display:inline不可被RO观察，而childList/
      // characterData变化正是窄栏判定与提升测量内容项的真实变化源，也免去children引用
      // 入deps导致的每渲染强制布局。attribute变化不观察，测量期工具搬动产生的
      // childList记录由measure末尾的takeRecords丢弃，无观察循环
      const observer = new ResizeObserver(scheduleMeasure);
      const contentObserver = new MutationObserver((records) => {
        // 工具组/工具增减改变宽栏内容基准，标脏后由下一次measure重测阈值；
        // characterData（文本更新）不标脏，避免每次改文案都触发收回提升再重测的两相测量
        if (records.some((record) => record.type === "childList")) {
          thresholdDirtyRef.current = true;
        }
        scheduleMeasure();
      });
      contentObserverRef.current = contentObserver;
      if (barRef.current) {
        observer.observe(barRef.current);
      }
      for (const el of [toolsRef.current, afterRef.current, actionsRef.current]) {
        if (el) {
          contentObserver.observe(el, {
            childList: true,
            characterData: true,
            subtree: true,
          });
        }
      }
      return () => {
        cancelAnimationFrame(rafRef.current);
        observer.disconnect();
        contentObserver.disconnect();
        if (contentObserverRef.current === contentObserver) {
          contentObserverRef.current = null;
        }
      };
      // children每渲染新引用故不入deps（内容变化由MutationObserver承接）；
      // actions同为ReactNode、内联JSX时每渲染都是新引用，入deps会让每次父渲染都标脏
      // 基准并重建双观察器，故以hasActions布尔承载容器挂卸（条件渲染）；
      // position/className变化亦重测，避免引用稳定时narrow判定过期
    }, [hasActions, position, className, scheduleMeasure]);

    // 按工具组的align分发到左侧工具区或右侧after容器（对齐原版insertItemElements对
    // align:'after'的处理）。工具组为React元素，仅按其props.align分组，不改变组内顺序；
    // 每个组的声明序号经context下发（提升优先级按声明顺序，与align分发无关）
    const beforeGroups: { node: ReactNode; order: number }[] = [];
    const afterGroups: { node: ReactNode; order: number }[] = [];
    Children.forEach(children, (child, order) => {
      const entry = { node: child, order };
      if (isValidElement<ToolGroupBaseProps>(child) && child.props.align === "after") {
        afterGroups.push(entry);
      } else {
        beforeGroups.push(entry);
      }
    });

    /** 渲染一组工具组：各自包一层声明序号Provider（不产生DOM） */
    const renderGroups = (groups: { node: ReactNode; order: number }[]) =>
      groups.map((group) => (
        <ToolbarGroupOrderProvider
          // 用户key优先；无key时用带前缀的序号，避免与用户key="1"撞成重复key
          key={
            isValidElement(group.node)
              ? (group.node.key ?? `order-${group.order}`)
              : `order-${group.order}`
          }
          value={group.order}
        >
          {group.node}
        </ToolbarGroupOrderProvider>
      ));

    return (
      <div
        {...rest}
        className={clsx(
          className,
          "oo-ui-toolbar",
          `oo-ui-toolbar-position-${position}`,
          narrow && NARROW_CLASS,
        )}
        onMouseDown={handlePointerDown}
        onKeyDown={handlePointerDown}
        ref={mergedRef}
      >
        <ToolbarPromotionProvider value={promotionContextValue}>
          <ToolbarPositionProvider value={position}>
            <ToolbarNarrowProvider value={narrow}>
              <div ref={barRef} className="oo-ui-toolbar-bar">
                <div ref={toolsRef} className="oo-ui-toolbar-tools">
                  {renderGroups(beforeGroups)}
                </div>
                <div ref={afterRef} className="oo-ui-toolbar-tools oo-ui-toolbar-after">
                  {renderGroups(afterGroups)}
                </div>
                {actions && (
                  <div ref={actionsRef} className="oo-ui-toolbar-actions">
                    {actions}
                  </div>
                )}
                <div style={{ clear: "both" }} />
              </div>
            </ToolbarNarrowProvider>
          </ToolbarPositionProvider>
        </ToolbarPromotionProvider>
      </div>
    );
  },
);

Toolbar.displayName = "Toolbar";
