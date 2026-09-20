import { forwardRef, type ReactNode } from "react";
import clsx from "clsx";
import { omit } from "es-toolkit";
import { PanelLayout, type PanelLayoutProps } from "../PanelLayout";

export type PageLayoutProps = PanelLayoutProps & {
  /**
   * Whether this is the active page. When omitted, derived from `hidden` (not
   * hidden = active); in continuous mode all pages are visible, so pass it
   * explicitly to mark the active one.
   *
   * 是否为激活页。缺省时由 `hidden` 派生（非 hidden 即激活）；continuous 模式下
   * 所有页均可见，需显式传入以区分激活态。
   */
  active?: boolean;

  /**
   * Label / value carried with the page-set object; swallowed so they never land
   * as DOM attributes.
   *
   * 随页集对象透入的标签 / 页值，组件吞掉以避免落成 DOM 属性。
   */
  label?: ReactNode;
  value?: string | number;
};

/**
 * A page panel: an item of StackLayout's `options`, shown when active. You rarely
 * render it directly.
 *
 * 页面板：StackLayout `options` 的项，激活时显示。通常不直接渲染。
 *
 * @see https://bearbin1215.github.io/ooui-react/components/page-layout/index.html
 */
export const PageLayout = forwardRef<HTMLDivElement, PageLayoutProps>(
  (
    { className, children, hidden, active, expanded = true, scrollable = true, ...rest },
    ref,
  ) => {
    const isActive = active ?? !hidden;
    const classes = clsx(
      className,
      "oo-ui-pageLayout",
      isActive && "oo-ui-pageLayout-active",
    );

    return (
      <PanelLayout
        {...omit(rest, ["label", "value"])}
        expanded={expanded}
        scrollable={scrollable}
        className={classes}
        hidden={hidden}
        ref={ref}
      >
        {children}
      </PanelLayout>
    );
  },
);

PageLayout.displayName = "PageLayout";
