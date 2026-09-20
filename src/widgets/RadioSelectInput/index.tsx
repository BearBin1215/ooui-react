import { forwardRef, type ChangeEvent } from "react";
import clsx from "clsx";
import { RadioSelect } from "../RadioSelect";
import type { RadioOptionProps } from "../RadioOption";
import { elementHiddenClasses, getWidgetClassName } from "../../mixins";

/**
 * Option type of the radio group field (same as `RadioSelect`'s).
 *
 * 表单单选组的选项类型（与 `RadioSelect` 相同）。
 */
export type RadioSelectInputOptionProps = RadioOptionProps;
import { resolveSelectableValue, type ChangeHandler } from "../../utils";
import {
  useControlledValue,
  useControlledValueNotify,
  useSelectableValues,
} from "../../hooks";
import type { WidgetProps } from "../Widget";

export interface RadioSelectInputProps extends Omit<
  WidgetProps<HTMLDivElement>,
  "children"
> {
  /**
   * The option set; each item has `value` and `children` (the option text).
   *
   * 选项集，每项含 `value` 与 `children`（选项文本）。
   */
  options: RadioOptionProps[];

  /**
   * Current selected value (controlled; passing it enables controlled mode).
   *
   * 当前选中值（受控，传入即受控模式）。
   */
  value?: string | number;

  /**
   * Initial selected value for uncontrolled use.
   *
   * 非受控初始选中值。
   */
  defaultValue?: string | number;

  /**
   * Selected-value change callback. The second argument is the native change
   * event of the radio `<input>`, present when the change is caused by a click;
   * keyboard reselection and the focus auto-select update silently (the original
   * fires no change there) and pass `undefined`.
   *
   * 选中值变更回调。第二参数为 radio 原生 change 事件（点击改选时携带）；键盘改选
   * 与聚焦自动选中对应原版的静默更新，为 `undefined`。
   */
  onChange?: ChangeHandler<string | number, HTMLInputElement>;

  /**
   * Form field name (lands on the hidden `input` only).
   *
   * 表单提交字段名（仅落在隐藏 `input` 上）。
   */
  name?: string;
}

/**
 * A radio group field (OO.ui.RadioSelectInputWidget): a RadioSelect for display and
 * keyboard interaction with an embedded hidden `<input>` carrying the form submission.
 * A value not among the selectable options falls back to the first selectable one, so
 * the field always has a selection (like an HTML radio group).
 *
 * 表单单选组（对齐原版 OO.ui.RadioSelectInputWidget）：RadioSelect 负责展示与
 * 键盘交互，内嵌隐藏 `<input>` 承载表单提交。值不在可选项内时回退为首个可选
 * 值，故组件始终存在选中项（与 HTML radio 表单语义一致）。
 *
 * @see https://bearbin1215.github.io/ooui-react/components/radio-select-input/index.html
 */
export const RadioSelectInput = forwardRef<HTMLDivElement, RadioSelectInputProps>(
  (
    {
      options,
      className,
      disabled,
      name,
      value,
      defaultValue,
      onChange,
      // 转发给内部RadioSelect的根（对齐原版RadioSelectInputWidget把$tabIndexed重定向到内部组的根元素）
      tabIndex,
      ...rest
    },
    ref,
  ) => {
    const { value: currentValue, commit } = useControlledValue<
      string | number,
      ChangeEvent<HTMLInputElement>
    >({ value, defaultValue }, onChange);

    // 可选值集合；当前值不在其中时回退首个可选值（无可选值则undefined）
    const { values: selectableValues } = useSelectableValues(options);
    const effectiveValue = resolveSelectableValue(currentValue, selectableValues);
    // 受控值为非法值时回写生效值，避免父级state与显示值漂移（对齐原版setValue的回退写入）
    useControlledValueNotify(value, effectiveValue, onChange);

    const classes = clsx(
      className,
      getWidgetClassName({ disabled }, "input", "radioSelectInput"),
    );

    return (
      <div {...rest} className={classes} aria-disabled={disabled || undefined} ref={ref}>
        {/* 承载表单提交的隐藏input，显示交互由RadioSelect承担。
          不用type="hidden"：原版getInputElement明确注明隐藏input无法分离value/defaultValue
          （InputWidget依赖defaultValue），故以oo-ui-element-hidden类隐藏；
          禁用时对input设disabled（原版setDisabled作用于$input，禁用字段不参与提交）；
          readOnly屏蔽React受控告警（值由state驱动），readonly字段照常参与表单提交 */}
        <input
          className={clsx("oo-ui-inputWidget-input", elementHiddenClasses(true))}
          name={name}
          value={effectiveValue === undefined ? "" : String(effectiveValue)}
          disabled={disabled}
          readOnly
        />
        <RadioSelect
          options={options}
          disabled={disabled}
          value={effectiveValue}
          tabIndex={tabIndex}
          // 点击改选时事件为radio原生change（RadioSelect透传）；键盘改选与聚焦自动选中
          // 对应原版chooseItem→setSelected的静默更新，无事件，第二参数为undefined
          onChange={commit}
        />
      </div>
    );
  },
);

RadioSelectInput.displayName = "RadioSelectInput";
