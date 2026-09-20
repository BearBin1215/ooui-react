import { forwardRef } from "react";
import clsx from "clsx";
import { getWidgetClassName, labelElementLabelClasses, resolveTitle } from "../../mixins";
import type { WidgetProps } from "../Widget";

/**
 * Position of the label relative to the control (input components use it via
 * `labelPosition`).
 *
 * 标签相对控件的位置（输入类组件经 `labelPosition` 使用）。
 */
export type LabelPosition = "before" | "after";

/**
 * Props of the standalone form label; undeclared props (incl. `htmlFor`) pass
 * straight to the root `<label>`.
 *
 * 独立表单标签属性：未声明属性（含 `htmlFor`）直传根 `<label>`。
 */
export type LabelProps = WidgetProps<HTMLLabelElement> & {
  // 实现说明：按「视同无标签」语义抑制 oo-ui-labelElement 根类，视觉裁剪由
  // oo-ui-labelElement-invisible 承担
  /**
   * Hide the label visually (kept as accessible name).
   *
   * 视觉隐藏标签（保留可访问名称）
   */
  invisibleLabel?: boolean;
};

// 实现说明：对齐原版OO.ui.LabelWidget，根元素即<label>（原版static.tagName='label'，$label即
// $element）；原版`config.input`的关联通道不映射（有id用`htmlFor`，无id交给FieldLayout），
// 见dev-docs/DEVIATIONS.md「舍弃」
/**
 * A standalone form label, for when you need to place a label on its own.
 *
 * 独立的表单标签，需要单独摆放一个标签时使用。
 *
 * @see https://bearbin1215.github.io/ooui-react/components/label/index.html
 */
export const Label = forwardRef<HTMLLabelElement, LabelProps>(
  ({ className, children, disabled, invisibleLabel, title, ...rest }, ref) => {
    // oo-ui-labelElement由labelElementClasses按"有标签才输出"派生（对齐原版setLabel），
    // 不额外补写——LabelWidget的label元素即根元素，该根类与-label类并存
    const classes = clsx(
      labelElementLabelClasses(invisibleLabel),
      className,
      getWidgetClassName({ disabled, label: children, invisibleLabel }, "label"),
    );

    return (
      <label
        {...rest}
        className={classes}
        // title解析走resolveTitle（原版LabelWidget混入TitledElement，$titled即根元素）
        title={resolveTitle({ title, label: children, invisibleLabel })}
        aria-disabled={disabled || undefined}
        ref={ref}
      >
        {children}
      </label>
    );
  },
);

Label.displayName = "Label";
