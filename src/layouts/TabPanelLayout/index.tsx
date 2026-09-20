import { forwardRef, type ReactNode } from "react";
import clsx from "clsx";
import { omit } from "es-toolkit";
import { PanelLayout, type PanelLayoutProps } from "../PanelLayout";

export interface TabPanelLayoutProps extends PanelLayoutProps {
  /**
   * Whether this is the currently active panel.
   *
   * 是否为当前激活面板。
   */
  active?: boolean;

  /**
   * The following three props are carried with the tab-set object; the component
   * swallows them so they never land as DOM attributes.
   *
   * 以下三个属性随页签集对象透入，组件吞掉以避免落成 DOM 属性。
   */
  label?: ReactNode;
  value?: string | number;
  disabled?: boolean;
}

/**
 * A tab panel: an item of IndexLayout's `options` with `role="tabpanel"` on the
 * root. You rarely render it directly.
 *
 * 页签面板：IndexLayout `options` 的项，根元素带 `role="tabpanel"`，通常不直接渲染。
 *
 * @see https://bearbin1215.github.io/ooui-react/components/tab-panel-layout/index.html
 */
export const TabPanelLayout = forwardRef<HTMLDivElement, TabPanelLayoutProps>(
  ({ className, children, active, expanded = true, scrollable = true, ...rest }, ref) => {
    const classes = clsx(
      className,
      "oo-ui-tabPanelLayout",
      active && "oo-ui-tabPanelLayout-active",
    );

    return (
      <PanelLayout
        {...omit(rest, ["label", "value", "disabled"])}
        expanded={expanded}
        scrollable={scrollable}
        className={classes}
        role="tabpanel"
        ref={ref}
      >
        {children}
      </PanelLayout>
    );
  },
);

TabPanelLayout.displayName = "TabPanelLayout";
