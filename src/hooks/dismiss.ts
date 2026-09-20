import { useEffect } from "react";
import { resolveElement, type ElementOrRef } from "../utils";
import { useLatestRef } from "./refs";

/**
 * 浮层关闭：点击浮层与锚点之外或按Escape时请求关闭。滚动条目标（documentElement）不触发关闭。
 * Escape在捕获阶段处理并`stopPropagation`——先于React根容器上的冒泡处理器（如Dialog的
 * onKeyDown），且使嵌套浮层只关最内层；已`defaultPrevented`的Escape不重复处理。
 * `onEscape`在Escape触发关闭后附加执行（捕获层吞键后组件的onKeyDown收不到该事件，原版经
 * 输入框keydown处理的附带动作须经此回调补齐）。回调与忽略目标经ref读取最新，内联函数不
 * 导致监听反复重挂。键位与外部点击的完整规则见dev-docs/comparison-guide.md「事件与键盘」
 */
export function useDismissablePopover({
  enabled,
  onClose,
  ignore,
  onEscape,
  dismissOnClick = false,
}: {
  /** 是否处于需响应关闭的开启态；关闭时不挂监听，避免吞掉外层浮层的Escape */
  enabled: boolean;
  /** 请求关闭（由调用方负责把open置false） */
  onClose: () => void;
  /** 视为内部的目标：其内部点击不触发关闭（组件根、portal后的浮层等） */
  ignore?: ElementOrRef[];
  /** Escape触发关闭后的附加动作（与onClose同批调用，仅Escape路径触发） */
  onEscape?: () => void;
  /**
   * 是否同时监听`click`。缺省false（只监听`mousedown`）对齐原版**菜单类**浮层；**弹层类**
   * （本工程Popup/PopupToolGroup）应置true。两档各自对应的原版实现与「以先触发者为准」的
   * 去重规则见dev-docs/comparison-guide.md「事件与键盘」
   */
  dismissOnClick?: boolean;
}): void {
  const onCloseRef = useLatestRef(onClose);
  const ignoreRef = useLatestRef(ignore);
  const onEscapeRef = useLatestRef(onEscape);
  useEffect(() => {
    if (!enabled) {
      return;
    }
    // 同一次手势里mousedown与click都会派发（dismissOnClick时）：以mousedown重置标记、
    // click见标记已置位则跳过，避免重复请求关闭
    let requestedInGesture = false;
    const handleMouseEvent = (event: globalThis.MouseEvent, isMouseDown: boolean) => {
      // 滚动条上的按下/点击以documentElement为target，不应关闭浮层（对齐原版onDocumentMouseDown）
      if (event.target === document.documentElement) {
        return;
      }
      if (isMouseDown) {
        requestedInGesture = false;
      } else if (requestedInGesture) {
        return;
      }
      const target = event.target as Node;
      for (const item of ignoreRef.current ?? []) {
        if (resolveElement(item)?.contains(target)) {
          return;
        }
      }
      requestedInGesture = true;
      onCloseRef.current();
    };
    const handleMouseDown = (event: globalThis.MouseEvent) =>
      handleMouseEvent(event, true);
    const handleClick = (event: globalThis.MouseEvent) => handleMouseEvent(event, false);
    const handleKeyDown = (event: globalThis.KeyboardEvent) => {
      if (event.key === "Escape" && !event.defaultPrevented) {
        onCloseRef.current();
        onEscapeRef.current?.();
        event.preventDefault();
        event.stopPropagation();
      }
    };
    document.addEventListener("mousedown", handleMouseDown);
    if (dismissOnClick) {
      document.addEventListener("click", handleClick);
    }
    document.addEventListener("keydown", handleKeyDown, true);
    return () => {
      document.removeEventListener("mousedown", handleMouseDown);
      document.removeEventListener("click", handleClick);
      document.removeEventListener("keydown", handleKeyDown, true);
    };
  }, [enabled, dismissOnClick, onCloseRef, ignoreRef, onEscapeRef]);
}
