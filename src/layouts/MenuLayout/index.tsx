import { forwardRef, type ReactNode } from "react";
import clsx from "clsx";
import { Layout, type LayoutProps } from "../Layout";

export interface MenuLayoutProps extends Omit<LayoutProps, "onSelect"> {
  /**
   * Whether the layout fills its parent element.
   *
   * 是否铺满父元素。
   */
  expanded?: boolean;
  /**
   * Whether the menu is shown (the menu subtree is not rendered when collapsed).
   *
   * 是否显示菜单（收起时不渲染菜单子树）。
   */
  showMenu?: boolean;
  /**
   * Menu position (invalid values fall back to `before`).
   *
   * 菜单位置（非法值回退为 `before`）。
   */
  menuPosition?: "top" | "after" | "bottom" | "before";
  /**
   * The menu-area content.
   *
   * 菜单区域内容。
   */
  menu: ReactNode;
}

/**
 * A menu layout: a `menu` area and a content area (`children`), ordered and placed
 * by `menuPosition`. When the menu is collapsed its subtree is not rendered, avoiding
 * invisible focus traps.
 *
 * 菜单布局：`menu` 区域与内容区域（`children`）按 `menuPosition` 排列；菜单收起时
 * 不渲染子树，避免隐形焦点陷阱。
 *
 * @see https://bearbin1215.github.io/ooui-react/components/menu-layout/index.html
 */
export const MenuLayout = forwardRef<HTMLDivElement, MenuLayoutProps>(
  (
    {
      className,
      children,
      expanded = true,
      showMenu = true,
      menuPosition = "before",
      menu,
      ...rest
    },
    ref,
  ) => {
    // 与原版一致：非法位置回退为 before
    const position = ["top", "after", "bottom", "before"].includes(menuPosition)
      ? menuPosition
      : "before";
    const classes = clsx(
      className,
      "oo-ui-menuLayout",
      expanded ? "oo-ui-menuLayout-expanded" : "oo-ui-menuLayout-static",
      showMenu ? "oo-ui-menuLayout-showMenu" : "oo-ui-menuLayout-hideMenu",
      `oo-ui-menuLayout-${position}`,
    );

    const elements = [
      // 隐藏菜单时不下挂子树：主题CSS以width/height:0 + overflow:hidden收起菜单（并非display:none），
      // 保留子树会让其中可聚焦元素仍留在tab序（隐形焦点陷阱）
      <div key="menu" className="oo-ui-menuLayout-menu" aria-hidden={!showMenu}>
        {showMenu ? menu : null}
      </div>,
      <div key="content" className="oo-ui-menuLayout-content">
        {children}
      </div>,
    ];

    return (
      <Layout {...rest} className={classes} ref={ref}>
        {["bottom", "after"].includes(position) ? [...elements].reverse() : elements}
      </Layout>
    );
  },
);

MenuLayout.displayName = "MenuLayout";
