import {
  useEffect,
  useRef,
  useState,
  type KeyboardEventHandler,
  type MouseEventHandler,
} from "react";
import { isActivationKey } from "../utils";
import { useLatestRef } from "./refs";

/** 按压态与选项拖拽（Button系按压流、Select系拖选、选项DOM双向索引） */

/**
 * 按压态管理（Button/ButtonInput/Tool组共用，对齐原版ButtonElement/ToolGroup的
 * onDocumentMouseUp/onDocumentKeyUp范式）：鼠标左键或Enter/空格按下进入按压态，
 * document级capture监听mouseup/keyup复位（释放可能发生在目标外）；按压流可能在上一流
 * 结束前再次开始（鼠标→键盘混用），以集合管理document监听，卸载时兜底全量移除。
 * 按压目标经`resolveTarget`从事件target解析（组内委托场景如Tool组经data-tool-name反查），
 * 缺省为单元素按压；释放落在发起目标上时经`onTrigger`触发（Tool组的onSelect位，Button系
 * 依赖原生click触发无需传）
 */
export function usePressedState<T = boolean, E extends HTMLElement = HTMLElement>({
  disabled,
  resolveTarget,
  canPress,
  onTrigger,
  preventDefaultOnPress = false,
  onMouseDown: passMouseDown,
  onMouseUp: passMouseUp,
  onKeyDown: passKeyDown,
  onKeyUp: passKeyUp,
}: {
  /** 禁用时按下不进入按压态 */
  disabled?: boolean;
  /** 从事件目标解析按压目标，返回null表示不在任何可按压目标上；缺省单元素按压 */
  resolveTarget?: (node: EventTarget | null) => T | null;
  /** 按下准入校验（如Tool组排除disabled工具）；缺省全部可按 */
  canPress?: (target: T) => boolean;
  /** 释放（mouseup/keyup）落在发起目标上时触发 */
  onTrigger?: (target: T) => void;
  /** 按下被接受时阻止默认行为（Tool组防拖动选中文本/焦点转移；Button不阻止以保留点击聚焦） */
  preventDefaultOnPress?: boolean;
  /**
   * 调用方透传的mousedown回调，**先于**按压逻辑无条件转发：按压逻辑含disabled/非左键
   * 的提前返回，置于其后会导致这些分支下调用方收不到事件
   */
  onMouseDown?: MouseEventHandler<E>;
  /** 调用方透传的mouseup回调，同为先于按压复位无条件转发 */
  onMouseUp?: MouseEventHandler<E>;
  /** 调用方透传的keydown回调，同为先于按压逻辑无条件转发 */
  onKeyDown?: KeyboardEventHandler<E>;
  /** 调用方透传的keyup回调，同为先于按压复位无条件转发 */
  onKeyUp?: KeyboardEventHandler<E>;
}): {
  /** 是否处于按压中 */
  pressed: boolean;
  /** 按压中的目标；null为无按压（单元素按压时恒为真值） */
  pressedTarget: T | null;
  /** 根元素mousedown：进入按压态并挂载document级mouseup监听 */
  onMouseDown: MouseEventHandler<E>;
  /** 根元素mouseup：复位按压态（document监听兜底目标外释放） */
  onMouseUp: MouseEventHandler<E>;
  /** 根元素keydown：Enter/空格进入按压态并挂载document级keyup监听 */
  onKeyDown: KeyboardEventHandler<E>;
  /** 根元素keyup：复位键盘按压态 */
  onKeyUp: KeyboardEventHandler<E>;
} {
  const [pressedTarget, setPressedTarget] = useState<T | null>(null);
  // 活跃document监听的处理器集合（按压后组件卸载的边界场景），卸载时兜底移除；
  // ref惰性初始化，避免每渲染新建Set即丢
  const mouseUpHandlersRef = useRef<Set<(ev: globalThis.MouseEvent) => void> | null>(
    null,
  );
  const keyUpHandlersRef = useRef<Set<(ev: globalThis.KeyboardEvent) => void> | null>(
    null,
  );
  // 处理器闭包经ref读取最新配置：监听挂载期间props更新（disabled/onTrigger等）后仍取新值
  const configRef = useLatestRef({ disabled, resolveTarget, canPress, onTrigger });
  // 调用方透传的事件回调：与configRef同理经ref读取（转发时机见各参数文档）。
  // 对齐原版ButtonElement mixin在同一处处理按压与用户回调，React的单handler模型需手工串联
  const passThroughRef = useLatestRef({
    onMouseDown: passMouseDown,
    onMouseUp: passMouseUp,
    onKeyDown: passKeyDown,
    onKeyUp: passKeyUp,
  });
  useEffect(
    () => () => {
      for (const handler of mouseUpHandlersRef.current ?? []) {
        document.removeEventListener("mouseup", handler, true);
      }
      for (const handler of keyUpHandlersRef.current ?? []) {
        document.removeEventListener("keyup", handler, true);
      }
      mouseUpHandlersRef.current?.clear();
      keyUpHandlersRef.current?.clear();
    },
    [],
  );

  /** 挂载document级capture监听：释放时复位按压态并执行一次性释放逻辑（handler自移除并退出集合） */
  const armDocumentMouseUp = (onRelease: (ev: globalThis.MouseEvent) => void) => {
    const handler = (ev: globalThis.MouseEvent) => {
      document.removeEventListener("mouseup", handler, true);
      mouseUpHandlersRef.current?.delete(handler);
      setPressedTarget(null);
      onRelease(ev);
    };
    (mouseUpHandlersRef.current ??= new Set()).add(handler);
    document.addEventListener("mouseup", handler, true);
  };

  const armDocumentKeyUp = (onRelease: (ev: globalThis.KeyboardEvent) => void) => {
    const handler = (ev: globalThis.KeyboardEvent) => {
      document.removeEventListener("keyup", handler, true);
      keyUpHandlersRef.current?.delete(handler);
      setPressedTarget(null);
      onRelease(ev);
    };
    (keyUpHandlersRef.current ??= new Set()).add(handler);
    document.addEventListener("keyup", handler, true);
  };

  /** 解析按压目标：未提供resolveTarget时为单元素按压（恒定目标）；不可按压时返回null */
  const resolvePressTarget = (node: EventTarget | null): T | null => {
    const { resolveTarget: resolve, canPress: canPressNow } = configRef.current;
    const target = resolve ? resolve(node) : (true as T);
    if (target === null || (canPressNow && !canPressNow(target))) {
      return null;
    }
    return target;
  };

  const onMouseDown: MouseEventHandler<E> = (e) => {
    passThroughRef.current.onMouseDown?.(e);
    if (configRef.current.disabled || e.button !== 0) {
      return;
    }
    const target = resolvePressTarget(e.target);
    if (target === null) {
      return;
    }
    if (preventDefaultOnPress) {
      // 对齐原版onMouseKeyDown返回false：阻止默认（拖动选中文本/焦点转移）
      e.preventDefault();
    }
    setPressedTarget(target);
    armDocumentMouseUp((ev) => {
      const { resolveTarget: resolve, onTrigger: trigger } = configRef.current;
      // 释放落在发起目标上时触发（原版onDocumentMouseKeyUp的目标匹配语义）
      if (trigger && resolve && resolve(ev.target) === target) {
        trigger(target);
      }
    });
  };

  /** 鼠标在元素上释放时复位按压态（document监听兜底目标外释放） */
  const onMouseUp: MouseEventHandler<E> = (e) => {
    passThroughRef.current.onMouseUp?.(e);
    if (!configRef.current.disabled) {
      setPressedTarget(null);
    }
  };

  const onKeyDown: KeyboardEventHandler<E> = (e) => {
    passThroughRef.current.onKeyDown?.(e);
    // 长按自动重复的keydown不重复进入按压流，避免keyup时N个监听齐触发onTrigger
    if (e.repeat || configRef.current.disabled || !isActivationKey(e.key)) {
      return;
    }
    const target = resolvePressTarget(e.target);
    if (target === null) {
      return;
    }
    if (preventDefaultOnPress) {
      e.preventDefault();
    }
    setPressedTarget(target);
    // 记录发起按键：按住Enter再敲空格会建立两个并发流，两流的keyup监听都会触发。
    // 复位按压态重复无害，但onTrigger须匹配发起键，否则一次按压会触发两次
    // （原版经单一pressed态天然串行化）
    const startKey = e.key;
    armDocumentKeyUp((ev) => {
      const { resolveTarget: resolve, onTrigger: trigger } = configRef.current;
      // 对齐原版onMouseKeyUp：keyup目标须仍解析到按压发起的那个目标才触发
      if (trigger && resolve && ev.key === startKey && resolve(ev.target) === target) {
        trigger(target);
      }
    });
  };

  /** 元素上松开Enter/空格时复位键盘按压态 */
  const onKeyUp: KeyboardEventHandler<E> = (e) => {
    passThroughRef.current.onKeyUp?.(e);
    if (!configRef.current.disabled && isActivationKey(e.key)) {
      setPressedTarget(null);
    }
  };

  return {
    pressed: pressedTarget !== null,
    pressedTarget,
    onMouseDown,
    onMouseUp,
    onKeyDown,
    onKeyUp,
  };
}

/**
 * 面板内选项DOM的双向索引：值→元素（前缀匹配/滚动读取）与元素→值（事件target定位选项）。
 * `values`为当前渲染的全部选项值：值的ref回调按值缓存、跨渲染稳定（同值复用同一回调，
 * 避免每渲染detach/attach），值移除后其回调缓存随之淘汰（长期运行下不累积）。
 * 调用方须传入与渲染同一份来源的选项值列表
 */
export function useOptionRegistry<T extends string | number>(values: T[]) {
  const itemRefs = useRef(new Map<T, HTMLElement>());
  const itemEls = useRef(new Map<Element, T>());
  const callbacksRef = useRef(new Map<T, (el: HTMLElement | null) => void>());

  /** 取某选项值对应的ref回调 */
  const registerItem = (value: T) => {
    let callback = callbacksRef.current.get(value);
    if (!callback) {
      callback = (el) => {
        if (el) {
          itemRefs.current.set(value, el);
          itemEls.current.set(el, value);
        } else {
          const registered = itemRefs.current.get(value);
          if (registered) {
            itemEls.current.delete(registered);
          }
          itemRefs.current.delete(value);
        }
      };
      callbacksRef.current.set(value, callback);
    }
    return callback;
  };

  // 淘汰已移除选项的回调缓存（选项集收窄时释放）
  useEffect(() => {
    const active = new Set(values);
    for (const value of callbacksRef.current.keys()) {
      if (!active.has(value)) {
        callbacksRef.current.delete(value);
        itemRefs.current.delete(value);
      }
    }
  }, [values]);

  useEffect(
    () => () => {
      itemRefs.current.clear();
      itemEls.current.clear();
      callbacksRef.current.clear();
    },
    [],
  );

  /** 从事件target沿祖先链定位选项值 */
  const findItemFromNode = (node: EventTarget | null): T | null => {
    let el = node instanceof Element ? node : null;
    while (el) {
      const value = itemEls.current.get(el);
      if (value !== undefined) {
        return value;
      }
      el = el.parentElement;
    }
    return null;
  };

  return { itemRefs, registerItem, findItemFromNode };
}

/**
 * Select系组件的拖拽选择，对齐原版SelectWidget.onMouseDown/onDocumentMouseMove/
 * onDocumentMouseUp（TabSelectWidget继承SelectWidget）：左键在可选项上按下进入拖拽态，
 * 拖动跨项时按压项随之移动，mouseup时选中目标项（拖拽未落在选项上时，mouseup落在的
 * 可选项也参与选择）；pointercancel仅清理不提交
 */
export function useOptionDrag<T extends string | number>({
  disabled,
  isValueSelectable,
  findItemFromNode,
  onCommit,
}: {
  /** 组禁用：禁用时不进入拖拽 */
  disabled?: boolean;
  /** 值是否可选（带value且未禁用）；拖拽只在可选项间移动 */
  isValueSelectable: (value: T) => boolean;
  /** 从事件target定位选项值（见useOptionRegistry） */
  findItemFromNode: (node: EventTarget | null) => T | null;
  /** mouseup落在可选项上时提交选择 */
  onCommit: (value: T) => void;
}) {
  const [pressed, setPressed] = useState(false);
  // 拖拽过程中被按压的选项值，驱动选项的pressed类（对齐原版pressItem）
  const [pressedValue, setPressedValue] = useState<T>();
  // 拖拽选择态：mousedown起点的可选项，拖动跨项时更新，mouseup时选中（对齐原版selecting）
  const selectingRef = useRef<T | null>(null);
  const cleanupDragRef = useRef<(() => void) | null>(null);

  useEffect(() => () => cleanupDragRef.current?.(), []);

  const handleMouseDown: MouseEventHandler<HTMLDivElement> = (e) => {
    // 原版onMouseDown恒返回false：阻止拖动过程中选中文本
    e.preventDefault();
    if (disabled || e.button !== 0) {
      return;
    }
    setPressed(true);
    // 重置上一次拖拽的残留状态（原版selecting同样存在丢失mouseup后的残留缺陷，此处有意改良）
    selectingRef.current = null;
    setPressedValue(undefined);
    const start = findItemFromNode(e.target);
    if (start !== null && isValueSelectable(start)) {
      selectingRef.current = start;
      setPressedValue(start);
    }
    const onMove = (ev: MouseEvent) => {
      const optionValue = findItemFromNode(ev.target);
      if (
        optionValue !== null &&
        optionValue !== selectingRef.current &&
        isValueSelectable(optionValue)
      ) {
        selectingRef.current = optionValue;
        setPressedValue(optionValue);
      }
    };
    const onUp = (ev: MouseEvent) => {
      cleanupDragRef.current?.();
      setPressed(false);
      setPressedValue(undefined);
      let optionValue = selectingRef.current;
      selectingRef.current = null;
      if (optionValue === null) {
        const target = findItemFromNode(ev.target);
        optionValue = target !== null && isValueSelectable(target) ? target : null;
      }
      if (optionValue !== null) {
        onCommit(optionValue);
      }
    };
    // 拖拽被系统中断（如触屏滚动接管）：清理拖拽态
    const onPointercancel = () => {
      cleanupDragRef.current?.();
      setPressed(false);
      setPressedValue(undefined);
      selectingRef.current = null;
    };
    const cleanupDrag = () => {
      document.removeEventListener("mousemove", onMove, true);
      document.removeEventListener("mouseup", onUp, true);
      document.removeEventListener("pointercancel", onPointercancel, true);
      cleanupDragRef.current = null;
    };
    cleanupDragRef.current = cleanupDrag;
    document.addEventListener("mousemove", onMove, true);
    document.addEventListener("mouseup", onUp, true);
    document.addEventListener("pointercancel", onPointercancel, true);
  };

  const handleUnpress = () => {
    setPressed(false);
  };

  return { pressed, pressedValue, handleMouseDown, handleUnpress };
}
