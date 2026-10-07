import { forwardRef, memo, type Ref } from "react";
import clsx from "clsx";
import { LabelBase } from "../Label/Base";
import { CheckboxInput, type CheckboxInputProps } from "../CheckboxInput";
import { getWidgetClassName } from "../../mixins";
import type { ChangeHandler } from "../../utils";
import type { OptionProps } from "../Option";

export interface CheckboxMultioptionProps extends Omit<
  OptionProps<HTMLLabelElement>,
  "highlighted"
> {
  /**
   * Form field name, passed through to the inner native checkbox.
   *
   * 表单提交字段名，透传给内层原生 checkbox。
   */
  name?: string;

  /**
   * Check-state change callback; the first argument is the new checked state.
   *
   * 勾选态变更回调（第一个参数为新的勾选态）。
   */
  onChange?: ChangeHandler<boolean, HTMLInputElement>;

  /**
   * Ref to the inner native checkbox input.
   *
   * 内层原生 checkbox 的引用。
   */
  inputRef?: Ref<HTMLInputElement>;

  /**
   * Extra props for the inner native checkbox (e.g. `inputId`).
   *
   * 透传给内层 checkbox 的其余属性（如 `inputId`）。
   */
  checkboxProps?: Omit<CheckboxInputProps, "checked" | "onChange" | "disabled">;
}

/**
 * Checkbox item of a checkbox group (OO.ui.CheckboxMultioptionWidget): a `<label>`
 * root wrapping a native checkbox; the root also declares `role="checkbox"`.
 *
 * 复选组的选项（对齐原版 OO.ui.CheckboxMultioptionWidget）：label 根 + 内嵌
 * CheckboxInput，根显式声明 `role="checkbox"`。
 * memo化缘由同MenuOption——CheckboxMultiselect逐项渲染，勾选态行变化时其余行浅比较跳过
 */
export const CheckboxMultioption = memo(
  forwardRef<HTMLLabelElement, CheckboxMultioptionProps>(
    (
      {
        accessKey,
        className,
        disabled,
        children,
        name,
        selected,
        onChange,
        inputRef,
        checkboxProps,
        value: _value,
        ...rest
      },
      ref,
    ) => {
      const classes = clsx(
        className,
        // 对齐原版CheckboxMultioptionWidget继承的MultioptionWidget（根基类oo-ui-multioptionWidget、
        // 选中态为oo-ui-multioptionWidget-selected，与OptionWidget系不同）
        getWidgetClassName(
          { disabled, label: children },
          "multioption",
          "checkboxMultioption",
        ),
        selected && "oo-ui-multioptionWidget-selected",
      );

      return (
        <label
          {...rest}
          className={classes}
          aria-disabled={disabled || undefined}
          tabIndex={-1}
          role="checkbox"
          aria-checked={!!selected}
          ref={ref}
        >
          <CheckboxInput
            {...checkboxProps}
            accessKey={accessKey}
            disabled={disabled}
            name={name}
            checked={selected}
            onChange={onChange}
            inputRef={inputRef}
          />
          <LabelBase>{children}</LabelBase>
        </label>
      );
    },
  ),
);

CheckboxMultioption.displayName = "CheckboxMultioption";
