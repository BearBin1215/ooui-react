import { forwardRef } from "react";
import {
  TagMultiselect,
  type TagMultiselectProps,
  type TagOptionProps,
} from "../TagMultiselect";

/**
 * Option type of the candidate menu (`TagOptionProps`).
 *
 * 候选菜单的选项类型（即 `TagOptionProps`）。
 */
export type MenuTagMultiselectOptionProps = TagOptionProps;

export interface MenuTagMultiselectProps extends Omit<
  TagMultiselectProps,
  "options" | "clearInputOnChoose"
> {
  /**
   * Candidate menu option set (**required** — the candidate menu is what
   * distinguishes this component from TagMultiselect).
   *
   * 候选菜单选项集（**必填**：带候选菜单即本组件与 TagMultiselect 的区别）
   */
  options: TagOptionProps[];

  /**
   * Whether to clear the filter text after choosing a menu item.
   *
   * 选定菜单项后是否清空输入框的过滤文本
   *
   * @default true
   */
  clearInputOnChoose?: boolean;
}

// 实现说明：对齐原版OO.ui.MenuTagMultiselectWidget——输入即过滤菜单、↑↓移动高亮、Enter选定
// 高亮项、点击切换标签；已添加标签对应的菜单项呈选中态。未开启allowArbitrary时菜单选项构成
// 标签的合法值域。与OutlineSelect之于Select同构：具名组件锁定基础组件的组合通道
/**
 * A tag input with a candidate menu. Props match TagMultiselect, plus the required
 * `options`.
 *
 * 带候选菜单的标签输入，属性与 TagMultiselect 一致，另增必填的 `options`。
 *
 * @see https://bearbin1215.github.io/ooui-react/components/menu-tag-multiselect/index.html
 */
export const MenuTagMultiselect = forwardRef<HTMLDivElement, MenuTagMultiselectProps>(
  (props, ref) => <TagMultiselect {...props} ref={ref} />,
);

MenuTagMultiselect.displayName = "MenuTagMultiselect";
