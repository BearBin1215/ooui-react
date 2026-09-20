import { forwardRef, useEffect, useRef, type ChangeEvent, type Ref } from "react";
import clsx from "clsx";
import { Icon } from "../Icon";
import { getWidgetClassName } from "../../mixins";
import type { AccessKeyedElement } from "../../Element";
import { useControlledValue, useMergedRefs } from "../../hooks";
import { useNativeInputProps } from "../Input/props";
import type { InputProps } from "../Input";

export type CheckboxInputProps = Omit<
  InputProps<boolean, HTMLInputElement, HTMLSpanElement>,
  "value" | "defaultValue"
> &
  AccessKeyedElement & {
    /**
     * Checked state (controlled; passing it enables controlled mode)
     *
     * 勾选状态（受控，传入即受控模式）
     */
    checked?: boolean;

    /**
     * Uncontrolled initial checked state
     *
     * 非受控初始勾选态
     */
    defaultChecked?: boolean;

    /**
     * Form submission value (written to `<input>`'s `value`, does not affect the
     * checked state).
     *
     * 表单提交值（写入 `<input>` 的 `value`，不影响勾选态）
     */
    value?: string | number;

    /**
     * The inner `<input>`'s id (pairs with a label's `htmlFor`)
     *
     * 内部 `<input>` 的 id（配合标签 `htmlFor`）
     */
    inputId?: string;

    /**
     * Half-selected state
     *
     * 半选状态
     */
    indeterminate?: boolean;

    /**
     * Ref to the inner `<input>` (the component ref points to the outer `<span>`)
     *
     * 内部 `<input>` 的引用（组件 ref 指向外层 `<span>`）
     */
    inputRef?: Ref<HTMLInputElement>;
  };

// 实现说明：对齐原版OO.ui.CheckboxInputWidget——span根 + 原生checkbox + 勾图标（图标由主题CSS
// 绘制）；indeterminate无对应的原生属性，经ref手工同步
/**
 * A single checkbox. It has no text label of its own — when you need one, wrap it
 * in FieldLayout.
 *
 * 单个复选框。本组件不自带文字标签，需要标签时交给 FieldLayout 包裹。
 *
 * @see https://bearbin1215.github.io/ooui-react/components/checkbox-input/index.html
 */
export const CheckboxInput = forwardRef<HTMLSpanElement, CheckboxInputProps>(
  (
    {
      name,
      inputId,
      accessKey,
      className,
      disabled,
      indeterminate,
      required,
      onChange,
      checked,
      defaultChecked,
      value,
      title,
      dir,
      tabIndex,
      role,
      inputRef: inputRefProp,
      ...rest
    },
    ref,
  ) => {
    const inputRef = useRef<HTMLInputElement | null>(null);
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

    // indeterminate不是React受控属性，需手动同步到DOM
    useEffect(() => {
      if (inputRef.current) {
        inputRef.current.indeterminate = !!indeterminate;
      }
    }, [indeterminate]);

    const classes = clsx(
      className,
      getWidgetClassName({ disabled }, "input", "checkboxInput"),
    );

    const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
      commit(event.target.checked, event);
    };

    /**
     * 同时服务内部indeterminate同步与外部inputRef
     */
    const setInputRef = useMergedRefs(inputRef, inputRefProp);

    return (
      <span {...rest} className={classes} aria-disabled={disabled || undefined} ref={ref}>
        <input
          ref={setInputRef}
          {...nativeInputProps}
          type="checkbox"
          // role与RadioInput同落内层input：role="presentation"等调用方语义须命中真实input
          // 才生效（rest透传的其余属性仍落外层span）
          role={role}
          // 提交值缺省为空串（原版InputWidget构造期恒写value）：不写该属性会使浏览器
          // 隐式值变为"on"，与原版的表单提交结果不等
          value={value === undefined ? "" : String(value)}
          required={required}
          checked={isChecked}
          onChange={handleChange}
        />
        <Icon
          icon="check"
          className="oo-ui-checkboxInputWidget-checkIcon oo-ui-image-invert"
        />
      </span>
    );
  },
);

CheckboxInput.displayName = "CheckboxInput";
