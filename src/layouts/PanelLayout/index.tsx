import { forwardRef } from "react";
import clsx from "clsx";
import { Layout, type LayoutProps } from "../Layout";

/**
 * 面板专属 props 剥离名单：IndexLayout/BookletLayout 的大纲选项共用，新增面板级 prop 时
 * 在此同步（不透传给大纲选项，避免落成DOM未知属性）
 */
export const PANEL_ONLY_PROPS = [
  "active",
  "hidden",
  "scrollable",
  "padded",
  "framed",
  "expanded",
  "label",
] as const;

export interface PanelLayoutProps extends LayoutProps {
  /**
   * Whether the panel is scrollable.
   *
   * 是否可滚动。
   */
  scrollable?: boolean;
  /**
   * Whether to leave padding inside the panel.
   *
   * 是否留出内边距。
   */
  padded?: boolean;
  /**
   * Whether the panel fills its parent element.
   *
   * 是否铺满父元素。
   */
  expanded?: boolean;
  /**
   * Whether the panel has a border.
   *
   * 是否有边框。
   */
  framed?: boolean;
}

/**
 * A content panel with padding / scrolling / expansion / border switches; also
 * the base container for layouts such as StackLayout.
 *
 * 面板：带内边距、滚动、铺满、边框开关的内容容器，也是 StackLayout 等布局
 * 的基础容器。
 *
 * @see https://bearbin1215.github.io/ooui-react/components/panel-layout/index.html
 */
export const PanelLayout = forwardRef<HTMLDivElement, PanelLayoutProps>(
  (
    { className, children, scrollable, padded, expanded = true, framed, ...rest },
    ref,
  ) => {
    const classes = clsx(
      className,
      "oo-ui-panelLayout",
      scrollable && "oo-ui-panelLayout-scrollable",
      padded && "oo-ui-panelLayout-padded",
      expanded && "oo-ui-panelLayout-expanded",
      framed && "oo-ui-panelLayout-framed",
    );

    return (
      <Layout {...rest} className={classes} ref={ref}>
        {children}
      </Layout>
    );
  },
);

PanelLayout.displayName = "PanelLayout";
