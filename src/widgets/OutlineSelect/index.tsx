import { forwardRef } from "react";
import clsx from "clsx";
import { Select, type SelectProps } from "../Select";
import type { OutlineOptionProps } from "../OutlineOption";
import type { MenuSectionOptionProps } from "../MenuSectionOption";

/**
 * Option type of the outline select (an `OutlineOption`, or a section header).
 *
 * 大纲选择的选项类型（`OutlineOption`，或分组标题）。
 */
export type OutlineSelectOptionProps =
  | OutlineOptionProps
  | (MenuSectionOptionProps & { value?: undefined });

export interface OutlineSelectProps extends Omit<SelectProps, "outline" | "options"> {
  /**
   * The option set, rendered as outline options (with `level` indentation).
   *
   * 选项集，渲染为大纲形态的 OutlineOption（支持 level 缩进）
   */
  options: OutlineSelectOptionProps[];
}

// 实现说明：对齐原版OO.ui.OutlineSelectWidget——委托Select输出outline类，经其渲染OutlineOption
/**
 * An outline select: `level` (0–2) expresses hierarchical indentation, suited to
 * tables of contents and similar hierarchical lists.
 *
 * 大纲样式的选择列表：用 `level`（0–2）表达层级缩进，适合目录这类有从属关系的列表。
 *
 * @see https://bearbin1215.github.io/ooui-react/components/outline-select/index.html
 */
export const OutlineSelect = forwardRef<HTMLDivElement, OutlineSelectProps>(
  ({ className, tabIndex, ...rest }, ref) => {
    const classes = clsx(className, "oo-ui-outlineSelectWidget");

    return (
      <Select
        ref={ref}
        className={classes}
        // 原版OutlineSelectWidget在SelectWidget之上额外混入TabIndexedElement（根tabindex=0、
        // 可聚焦），与不混入该mixin的SelectWidget相反；故补回0缺省（Select缺省不写tabindex）
        tabIndex={tabIndex ?? 0}
        {...rest}
        // outline置于spread之后：OutlineSelect恒为大纲样式，调用方不可覆盖
        outline
      />
    );
  },
);

OutlineSelect.displayName = "OutlineSelect";
