import { createContext, useCallback, useContext } from "react";
import { useOOUIConfig } from "../config";

/** 浮层的 portal 容器解析（宿主配置与弹窗子树宿主的两级回落） */

/**
 * 弹窗子树内的浮层 portal 宿主。`WindowManager` 把自身根元素经此下发，弹窗内的浮层
 * （Popup / MenuSelect / PopupToolGroupBase）因此 portal 到该元素、而非 `document.body`：
 * 既对齐原版 `$overlay` 未配置时回落到 `this.$element` 的浮层去向（浮层留在窗口的层叠
 * 上下文里），也使内容隔离无需豁免名单（浮层是管理器根的子节点，逐个标记兄弟碰不到它）。
 * 不在弹窗内时为空，浮层回落宿主配置的 `getPortalContainer` 或 `document.body`
 */
const PortalHostContext = createContext<HTMLElement | null>(null);

/** 下发浮层 portal 宿主（仅供 WindowManager 使用） */
export const PortalHostProvider = PortalHostContext.Provider;

/**
 * 弹窗子树内浮层与所属弹窗同层的 z-index：主题给 `.oo-ui-windowManager-modal > .oo-ui-dialog`
 * 的层值是 4（两主题同名规则，由 theme-contract 守卫锁定），而 `.oo-ui-popupWidget` 只有 1。
 * 本工程浮层是弹窗的兄弟节点、与窗口层值直接比较，故须显式声明同一层值（相等 + portal 恒
 * 追加在弹窗之后即在其上）。推导、叠加场景与层值选择理由见dev-docs/DEVIATIONS.md「等效替代」
 */
export const DIALOG_FLOAT_Z_INDEX = 4;

/**
 * 解析浮层该用的 portal 容器与层值：
 * 宿主配置的 `getPortalContainer` 优先 → 弹窗子树内的 portal 宿主 → `document.body`。
 *
 * `dialogZIndex` 只在真正落到弹窗宿主上时给出：宿主自行配置了容器时浮层去向由宿主决定，
 * 层值也交回其容器与主题 CSS 处理（本库不猜测宿主的层叠安排）
 */
export function useFloatPortal(): {
  /** 解析 portal 容器，入参为浮层锚点元素（未挂载时为 null，回落 body） */
  getContainer: (trigger: HTMLElement | null) => HTMLElement;
  /** 弹窗子树内须写入浮层根（定位元素）的 z-index；其余情形为 undefined */
  dialogZIndex: number | undefined;
} {
  const { getPortalContainer } = useOOUIConfig();
  const host = useContext(PortalHostContext);
  // 经useCallback缓存：容器身份漂移会让portal重挂载浮层
  const getContainer = useCallback(
    (trigger: HTMLElement | null) =>
      (trigger && getPortalContainer ? getPortalContainer(trigger) : null) ??
      host ??
      document.body,
    [getPortalContainer, host],
  );
  return {
    getContainer,
    dialogZIndex: getPortalContainer || !host ? undefined : DIALOG_FLOAT_Z_INDEX,
  };
}
