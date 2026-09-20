import { forwardRef } from "react";
import clsx from "clsx";
import { getWidgetClassName } from "../../mixins";
import type { ElementProps } from "../../Element";

/**
 * Props of the hidden input.
 *
 * 隐藏输入属性。
 */
export interface HiddenInputWidgetProps extends ElementProps<HTMLInputElement> {
  /**
   * The hidden input's value (controlled; defaults to `''`).
   *
   * 隐藏输入的值（受控；缺省空串）。
   */
  value?: string;

  /**
   * Field name for submission.
   *
   * 提交时的字段名。
   */
  name?: string;

  /**
   * Whether the field is disabled (a disabled field is excluded from submission).
   *
   * 是否禁用（禁用时不参与表单提交）。
   */
  disabled?: boolean;
}

/**
 * A hidden input (OO.ui.HiddenInputWidget): an `<input type="hidden">` root
 * carrying a value that submits with the form but is never shown (e.g. array
 * fields, values paired with a multi-value control). Unlike the original,
 * `disabled` falls through to the native attribute (so the value drops out of
 * submission) and `value` is fully controlled.
 *
 * 隐藏输入组件（对齐原版 OO.ui.HiddenInputWidget）：以 `<input type="hidden">`
 * 为根元素，承载不展示但需随表单提交的值（如数组字段、与多值控件配对的值）。
 * 与原版不同：`disabled` 落到原生属性（禁用时不再提交）、`value` 为受控值。
 *
 * @see https://bearbin1215.github.io/ooui-react/components/hidden-input-widget/index.html
 */
export const HiddenInputWidget = forwardRef<HTMLInputElement, HiddenInputWidgetProps>(
  ({ className, disabled, value = "", ...rest }, ref) => (
    <input
      {...rest}
      className={clsx(className, getWidgetClassName({ disabled }))}
      type="hidden"
      value={value}
      disabled={disabled}
      ref={ref}
    />
  ),
);

HiddenInputWidget.displayName = "HiddenInputWidget";
