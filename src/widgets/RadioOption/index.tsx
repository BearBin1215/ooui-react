import { forwardRef } from "react";
import clsx from "clsx";
import { LabelBase } from "../Label/Base";
import { RadioInput } from "../RadioInput";
import { getWidgetClassName, optionWidgetClasses } from "../../mixins";
import type { ChangeHandler } from "../../utils";
import type { OptionProps } from "../Option";

// highlighted不适用：radio选项无键盘高亮态（对齐原版RadioOptionWidget.static.highlightable=false），
// Omit避免其随props落入<label>
export interface RadioOptionProps extends Omit<
  OptionProps<HTMLLabelElement>,
  "highlighted"
> {
  /**
   * Form field name, passed through to the inner native radio (radios sharing
   * a name are mutually exclusive).
   *
   * 表单提交字段名，透传给内层原生 radio（同组同名即互斥）。
   */
  name?: string;
  /**
   * Selection-change callback; the first argument is whether this item is checked.
   *
   * 选中态变更回调（第一个参数为本项是否选中）。
   */
  onChange?: ChangeHandler<boolean, HTMLInputElement>;
  /**
   * Whether this item is selected (mapped to the inner radio's checked).
   *
   * 是否选中（同步为内层原生 radio 的勾选态）。
   */
  selected?: boolean;
}

/**
 * 单选组的选项（对齐原版 OO.ui.RadioOptionWidget）：label 根 + 内嵌 RadioInput，
 * 选中态同时映射为内层原生 radio 的 checked（内部中间件，不进公共导出面）。
 */
export const RadioOption = forwardRef<HTMLLabelElement, RadioOptionProps>(
  (
    {
      accessKey,
      className,
      disabled,
      children,
      name,
      onChange,
      selected,
      value,
      ...rest
    },
    ref,
  ) => {
    const classes = clsx(
      className,
      getWidgetClassName({ disabled, label: children }, "option", "radioOption"),
      // 原版RadioOptionWidget.static.highlightable/pressable=false（单选选项无高亮与按压态）
      optionWidgetClasses({ selected, highlightable: false, pressable: false }),
    );

    return (
      <label
        {...rest}
        className={classes}
        aria-disabled={disabled || undefined}
        tabIndex={-1}
        role="radio"
        aria-checked={!!selected}
        ref={ref}
      >
        <RadioInput
          accessKey={accessKey}
          disabled={disabled}
          name={name}
          onChange={onChange}
          checked={selected}
          value={value}
          // 对齐原版RadioOptionWidget：内层radio以tabIndex:-1+role:presentation屏蔽
          // 原生语义，由外层label（role=radio）承担可聚焦与读屏语义，避免radio套radio
          // 重复播报与多余的tab停靠点；value承接选项值（原版构造期
          // new OO.ui.RadioInputWidget({ value: config.data, tabIndex: -1 })，oojs-ui.js:9270，
          // radio的value是表单提交通道）
          tabIndex={-1}
          role="presentation"
        />
        <LabelBase>{children}</LabelBase>
      </label>
    );
  },
);

RadioOption.displayName = "RadioOption";
