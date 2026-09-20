import type { ReactNode } from "react";
import type { WidgetProps } from "../Widget";
import type { AccessKeyedElement, IconFlag } from "../../Element";

/**
 * Option data passed in through an `options` prop.
 *
 * 经 `options` prop 传入的选项数据。
 */
export interface OptionData {
  /**
   * Option value; doubles as the selected-match key and the list key.
   * Always a scalar.
   *
   * 选项值，同时作为选中态匹配依据与列表 key；恒为标量。
   */
  value: string | number;

  /**
   * Option text.
   *
   * 选项文本。
   */
  children?: ReactNode;
}

/**
 * Base props of an option item (aligns with the abstract OO.ui.OptionWidget;
 * the concrete render is done by MenuOption / OutlineOption / TabOption and
 * friends). The selected / highlighted state is derived by the parent Select
 * from `value`, not declared in the option data.
 *
 * 基础选项参数（对齐原版抽象基类 OptionWidget，具体渲染由 MenuOption /
 * OutlineOption / TabOption 等实现）。选中 / 高亮态由 Select 系父组件根据
 * `value` 派生后传入，不在选项数据中声明。
 */
export type OptionProps<T = HTMLDivElement> = WidgetProps<T> &
  AccessKeyedElement &
  OptionData & {
    /**
     * Whether this option is selected.
     *
     * 是否为已选中项。
     */
    selected?: boolean;

    /**
     * Whether this option is the keyboard-navigation highlight target.
     *
     * 是否为键盘导航高亮项。
     */
    highlighted?: boolean;
  };

/**
 * Flagged-option props: a flag tints the option's icon / indicator with the
 * matching theme variant (progressive / destructive / error / warning /
 * success / invert). Only offered to option shapes that have an icon / indicator
 * slot (MenuOption / OutlineOption / MenuSectionOption / ButtonOption); plain
 * label options (TabOption / RadioOption / CheckboxMultioption) have nothing to
 * tint, so they do not open it.
 *
 * 选项的标志集（对齐原版 OptionWidget 混入的 FlaggedElement）：标志给选项的
 * 图标 / 指示器上对应主题变体（progressive / destructive / error / warning /
 * success / invert）。只开放给带图标 / 指示器槽位的选项形态（MenuOption /
 * OutlineOption / MenuSectionOption / ButtonOption）；纯标签选项（TabOption /
 * RadioOption / CheckboxMultioption）无着色对象，不开放。
 */
export interface OptionFlaggedElement {
  /**
   * Flags to apply (a single value or an array).
   *
   * 附加给选项的标志（单个或数组）。
   */
  flags?: IconFlag | IconFlag[];
}
