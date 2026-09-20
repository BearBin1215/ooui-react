import { forwardRef, useState } from "react";
import { createPortal } from "react-dom";
import clsx from "clsx";
import { PortalHostProvider, useMergedRefs } from "../../hooks";
import type { ElementProps } from "../../Element";

export interface WindowManagerProps extends ElementProps<HTMLDivElement> {
  /** 是否满屏（size='full'或窄屏自动满屏） */
  full?: boolean;
  /** 是否为模态管理器（输出oo-ui-windowManager-modal类） */
  modal?: boolean;
  /** 弹窗大小，输出`oo-ui-windowManager-size-{size}`类（full时输出size-full） */
  size?: "small" | "medium" | "large" | "larger" | "full";
  /** 要渲染的节点 */
  portal?: Element | DocumentFragment;
}

/**
 * 弹窗管理器容器，对齐原版OO.ui.WindowManager：以portal（默认document.body）承载children，
 * 输出管理器尺寸/满屏类供主题CSS定位弹窗；本工程仅承担容器职责，不含原版的开窗队列管理。
 *
 * 另承担浮层portal宿主的职责——把自身根元素下发给子树（见hooks/portal.ts）：弹窗内的浮层
 * portal到此处，从而落在弹窗的同一子树内。根元素是静止/无裁剪的普通div（主题对
 * `.oo-ui-windowManager` 没有任何自身规则），故浮层的页面坐标绝对定位不受影响
 */
export const WindowManager = forwardRef<HTMLDivElement, WindowManagerProps>(
  (
    {
      className,
      children,
      modal = true,
      full,
      size = "medium",
      portal = document.body,
      ...rest
    },
    ref,
  ) => {
    // 经state而非ref承载宿主：portal目标须在渲染期可读（ref在渲染期为null）。首帧为null时
    // 弹窗内的浮层暂落document.body，挂载后由ref回调置入即迁入管理器根
    const [host, setHost] = useState<HTMLDivElement | null>(null);
    const setRootRef = useMergedRefs(ref, setHost);

    const classes = clsx(
      className,
      "oo-ui-windowManager",
      modal && "oo-ui-windowManager-modal",
      // 满屏样式实际由oo-ui-windowManager-size-full承载；-fullscreen/-floating在两主题
      // 均无规则，仅为对齐原版DOM一并输出。
      // 窄屏自动满屏（full=true）同样输出size-full，以命中满屏CSS并豁免非满屏帧的1em边距+边框规则
      `oo-ui-windowManager-size-${full ? "full" : size}`,
      full ? "oo-ui-windowManager-fullscreen" : "oo-ui-windowManager-floating",
    );

    return createPortal(
      <PortalHostProvider value={host}>
        <div {...rest} className={classes} ref={setRootRef}>
          {children}
        </div>
      </PortalHostProvider>,
      portal,
    );
  },
);

WindowManager.displayName = "WindowManager";
