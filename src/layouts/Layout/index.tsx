import { forwardRef, useEffect, useRef } from "react";
import clsx from "clsx";
import { elementHiddenClasses } from "../../mixins";
import { useMergedRefs } from "../../hooks";
import type { ElementProps } from "../../Element";

export interface LayoutProps extends Omit<ElementProps, "hidden"> {
  /**
   * Whether the layout is hidden. `true` hides it fully; `'until-found'` hides
   * it visually while keeping it reachable by the browser's in-page search
   * (Ctrl+F fires `beforematch` on a match).
   *
   * 是否隐藏。`true` 完全隐藏；`'until-found'` 视觉隐藏但可被浏览器页内查找
   * （Ctrl+F）定位，命中时触发 `beforematch`。
   */
  hidden?: boolean | "until-found";
}

/**
 * The layout base: the shared root class and unified `hidden` three-state
 * handling (`true` / `'until-found'` / visible) for layout components.
 *
 * 布局基类：为各布局组件统一处理 `hidden` 三态（`true` / `'until-found'` /
 * 可见）与随之的 `aria-hidden` 落点。
 *
 * @see https://bearbin1215.github.io/ooui-react/components/layout/index.html
 */
export const Layout = forwardRef<HTMLDivElement, LayoutProps>(
  ({ className, children, hidden, ...rest }, ref) => {
    const innerRef = useRef<HTMLDivElement | null>(null);
    const mergedRef = useMergedRefs(innerRef, ref);
    const classes = clsx(
      className,
      "oo-ui-layout",
      elementHiddenClasses(hidden === true),
    );

    // React 18将hidden归入BOOLEAN属性：任何真值（含'until-found'字符串）都被写成hidden=""，
    // 故until-found需在commit后手动写入才能生效（React 19起hidden类型已支持'until-found'，届时可移除）
    useEffect(() => {
      if (hidden === "until-found" && innerRef.current) {
        innerRef.current.setAttribute("hidden", "until-found");
      }
    }, [hidden]);

    return (
      <div
        {...rest}
        className={classes}
        // 保留原始值（而非归一化为布尔）传入：React需感知true↔'until-found'切换才会重写DOM属性；
        // 断言仅为绕过React 18类型定义（hidden仅声明为boolean）
        hidden={(hidden || undefined) as boolean | undefined}
        // aria-hidden仅在完全隐藏时输出：'until-found'的语义是对查找可见，持续向辅助技术
        // 声明不可见会与openMatchedPanels（查找命中后激活面板）的意图冲突
        aria-hidden={hidden === true ? "true" : undefined}
        ref={mergedRef}
      >
        {children}
      </div>
    );
  },
);

Layout.displayName = "Layout";
