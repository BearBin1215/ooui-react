import { forwardRef, useMemo } from "react";
import clsx from "clsx";
import {
  CheckboxMultiselect,
  type CheckboxMultiselectProps,
} from "../CheckboxMultiselect";
import type { CheckboxMultioptionProps } from "../CheckboxMultioption";
import { getWidgetClassName } from "../../mixins";

/**
 * Option type of the checkbox group field (same as `CheckboxMultiselect`'s).
 *
 * 表单复选组的选项类型（与 `CheckboxMultiselect` 相同）。
 */
export type CheckboxMultiselectInputOptionProps = CheckboxMultioptionProps;

export interface CheckboxMultiselectInputProps extends Omit<
  CheckboxMultiselectProps,
  "className"
> {
  /**
   * Class names appended to the root.
   *
   * 追加到根元素的类。
   */
  className?: string;
}

/**
 * A checkbox group field (OO.ui.CheckboxMultiselectInputWidget): the form-field
 * variant of CheckboxMultiselect — display and interaction unchanged, with each
 * option's checkbox carrying `name` and its own `value` so checked items submit
 * natively as same-name fields. Note: a `value` passed via `options[].checkboxProps`
 * is overridden; the mapped option set is rebuilt only when the `options` reference
 * changes, so pass a stable reference (module constant or `useMemo`) instead of an
 * inline array literal in hot paths.
 *
 * 表单复选组（对齐原版 OO.ui.CheckboxMultiselectInputWidget）：CheckboxMultiselect
 * 的表单形态——展示与交互不变，各选项 checkbox 写入 `name` 与自身 `value`，
 * 勾选项随表单以多个同名字段原生提交。注意：`options[].checkboxProps.value` 会被覆盖；
 * 映射后的选项集仅在 `options` 引用变化时重算，热点路径请传稳定引用（模块常量或
 * `useMemo`），不要内联数组字面量。
 *
 * @see https://bearbin1215.github.io/ooui-react/components/checkbox-multiselect-input/index.html
 */
export const CheckboxMultiselectInput = forwardRef<
  HTMLDivElement,
  CheckboxMultiselectInputProps
>(
  (
    { options, className, disabled, name, value, defaultValue, onChange, ...rest },
    ref,
  ) => {
    const classes = clsx(
      className,
      getWidgetClassName({ disabled }, "input", "checkboxMultiselectInput"),
    );

    // 为checkbox注入提交value的选项集：仅在options引用变化时重算
    const mappedOptions = useMemo(
      () =>
        options.map((option) => ({
          ...option,
          // 对齐原版setOptionsData：checkbox写入value供表单提交（name由CheckboxMultiselect透传）
          checkboxProps: { ...option.checkboxProps, value: option.value },
        })),
      [options],
    );

    return (
      <div {...rest} className={classes} aria-disabled={disabled || undefined} ref={ref}>
        <CheckboxMultiselect
          options={mappedOptions}
          disabled={disabled}
          name={name}
          value={value}
          defaultValue={defaultValue}
          onChange={onChange}
        />
      </div>
    );
  },
);

CheckboxMultiselectInput.displayName = "CheckboxMultiselectInput";
