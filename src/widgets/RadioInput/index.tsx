import { forwardRef, type ChangeEvent } from "react";
import clsx from "clsx";
import { getWidgetClassName } from "../../mixins";
import { useControlledValue } from "../../hooks";
import { useNativeInputProps } from "../Input/props";
import type { InputProps } from "../Input";

export interface RadioInputProps extends Omit<
  InputProps<boolean, HTMLInputElement, HTMLSpanElement>,
  "placeholder" | "value" | "defaultValue"
> {
  /**
   * Whether the radio is checked (controlled; passing it enables controlled mode).
   *
   * 是否勾选（受控，传入即受控模式）。
   */
  checked?: boolean;

  /**
   * Uncontrolled initial checked state.
   *
   * 非受控初始勾选态。
   */
  defaultChecked?: boolean;

  /**
   * Form submission value (written to the `<input>`'s `value`; does not affect
   * the checked state).
   *
   * 表单提交值（写入 `<input>` 的 `value`，不影响勾选状态）。
   */
  value?: string | number;

  /**
   * The `<input>`'s id (pairs with a label's `htmlFor`).
   *
   * input 元素 id（配合标签的 `htmlFor` 使用）。
   */
  inputId?: string;
}

/**
 * A radio button (OO.ui.RadioInputWidget): a `<span>` root wrapping a native
 * radio and a decorative `<span>` (the dot is drawn by the theme CSS). It has no
 * text label of its own — when you need one, wrap it in FieldLayout.
 *
 * 单选框（对齐原版 OO.ui.RadioInputWidget）：span 根 + 原生 radio + 装饰 span
 * （圆点由主题 CSS 绘制）。不自带文字标签，需要标签时交给 FieldLayout 包裹。
 *
 * @see https://bearbin1215.github.io/ooui-react/components/radio-input/index.html
 */
export const RadioInput = forwardRef<HTMLSpanElement, RadioInputProps>(
  (
    {
      name,
      inputId,
      accessKey,
      className,
      disabled,
      onChange,
      required,
      checked,
      defaultChecked,
      value,
      title,
      dir,
      tabIndex,
      role,
      ...rest
    },
    ref,
  ) => {
    const { value: isChecked, commit } = useControlledValue<
      boolean,
      ChangeEvent<HTMLInputElement>
    >({ value: checked, defaultValue: defaultChecked ?? false }, onChange);
    // 原生input公共落点属性（id/name/键位title/accessKey/tabIndex/dir/禁用态/类名）；
    // 本组件无标签元素，不做invisibleLabel兜底
    const nativeInputProps = useNativeInputProps({
      inputId,
      name,
      accessKey,
      title,
      dir,
      tabIndex,
      disabled,
    });

    const classes = clsx(
      className,
      getWidgetClassName({ disabled }, "input", "radioInput"),
    );

    const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
      commit(event.target.checked, event);
    };

    return (
      <span {...rest} className={classes} aria-disabled={disabled || undefined} ref={ref}>
        <input
          {...nativeInputProps}
          type="radio"
          // 提交值同CheckboxInput：原版InputWidget构造期恒写value（未配置时为空串）；
          // 此处不写会使浏览器隐式值变为"on"，与原版的表单提交值不等
          value={value === undefined ? "" : String(value)}
          checked={isChecked}
          role={role}
          onChange={handleChange}
          required={required}
        />
        {/* 邻接span供主题命中[type='radio'] + span系选择器：圆点由span边框绘制
            （选中态border-width加粗至6px），span::before供焦点/激活环；对齐原版
            RadioInputWidget构造期append('<span>') */}
        <span />
      </span>
    );
  },
);

RadioInput.displayName = "RadioInput";
