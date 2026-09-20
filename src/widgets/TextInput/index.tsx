import { useRef, forwardRef, type ChangeEvent, type Ref } from "react";
import clsx from "clsx";
import { IconBase } from "../Icon/Base";
import { IndicatorBase, type IndicatorBaseProps } from "../Indicator/Base";
import { LabelBase } from "../Label/Base";
import { getTextInputClassName, hasLabel } from "../../mixins";
import { useControlledValue, useMergedRefs } from "../../hooks";
import { useInputProps, type UserInputProps } from "../Input/props";
import type { InputProps } from "../Input";
import type { LabelPosition } from "../Label";
import type {
  FlaggedElement,
  IconElement,
  IndicatorElement,
  Indicators,
  LabelElement,
} from "../../Element";

/**
 * type prop的合法值：原版getValidType白名单并入'search'——原版该类型经SearchInputWidget子类
 * 覆写getValidType绕过白名单实现，React版为免组合层另开口子而统一放行
 */
const VALID_INPUT_TYPES = ["text", "password", "email", "url", "number", "search"];

/**
 * Soft-validation input: a RegExp (tested with `test`), a function (returning a
 * boolean or `Promise<boolean>`), or the symbolic names `'non-empty'` / `'integer'`.
 *
 * 合法性校验入参：正则（test 判定）、函数（返回布尔或 `Promise<boolean>`）、
 * 或符号名 `'non-empty'`（非空）/'integer'（纯数字）
 */
export type TextInputValidate =
  | RegExp
  | ((value: string) => boolean | Promise<boolean>)
  | "non-empty"
  | "integer";

/**
 * Props for the single-line text input.
 *
 * 单行文本输入框属性。
 */
export interface TextInputProps<
  T extends EventTarget = HTMLInputElement,
  P = HTMLDivElement,
>
  extends
    InputProps<string, T, P>,
    LabelElement,
    IconElement,
    IndicatorElement,
    FlaggedElement {
  /**
   * Maximum length
   *
   * 最大长度
   */
  maxLength?: number;

  /**
   * Input type, limited to the theme-styled whitelist (`text` / `password` /
   * `email` / `url` / `number` / `search`); invalid values fall back to `text`.
   *
   * 输入类型：限定主题有样式的白名单（`text` / `password` / `email` / `url` /
   * `number` / `search`），非法值回退 `text`
   *
   * @default 'text'
   */
  type?: string;

  /**
   * Extra props for the indicator element. An `onMouseDown` passed here is chained
   * after the built-in behavior (indicator mousedown focuses the input, aligning
   * with the original's event bindings on `$indicator`).
   *
   * 指示器元素的附加属性；传入的 `onMouseDown` 在内置行为（指示器 mousedown 聚焦
   * 输入框，对齐原版 `$indicator` 上的事件绑定）之后补充调用
   */
  indicatorProps?: Omit<IndicatorBaseProps, "indicator">;

  /**
   * Label position.
   *
   * 标签位置
   *
   * @default 'after'
   */
  labelPosition?: LabelPosition;

  /**
   * Read-only
   *
   * 只读
   */
  readOnly?: boolean;

  /**
   * Soft validation: when the value fails, the input element gets `aria-invalid`
   * and the root gets an invalid flag class, without rewriting the value; by
   * default only native browser constraints (e.g. `required`) apply. Fires on
   * value change (debounced), on blur, and clears on focus.
   *
   * 软校验（软反馈）：值不满足时输入元素输出 `aria-invalid`、根元素叠加 invalid 标志类，
   * 不改写值；缺省仅浏览器原生约束（required 等）。触发时机：值变更（防抖）、失焦、聚焦清除
   */
  validate?: TextInputValidate;

  /**
   * Ref to the inner `<input>` (the component ref points to the root div).
   *
   * 内部 `<input>` 的引用（组件 ref 指向外层 div）
   */
  inputRef?: Ref<T>;

  /**
   * Extra-props channel for the native `<input>`: undeclared props land on the root
   * div, so attributes for the input itself (e.g. `role`, `aria-*`, `autoComplete`)
   * go here; `onChange` / `onBlur` / `onFocus` are chained after the component logic.
   *
   * 原生 `<input>` 的附加属性通道：`...rest` 落在根 div，需写到原生 input 上的属性
   * （如 `role`/`aria-*`/`autoComplete`）经此通道；`onChange`/`onBlur`/`onFocus`
   * 串联在组件自身逻辑之后（值管线与软校验不会被截断）
   */
  inputProps?: UserInputProps<T>;
}

/**
 * TextInput的内部组合形态参数（SearchInput等库内组合经相对路径使用，不进公开导出面）：
 * indicatorOverride为指示器槽位的覆写通道——非undefined时完全接管指示器槽位，null=明确无
 * （抑制required缺省回退），对齐原版SearchInputWidget构造后经updateSearchIndicator调
 * setIndicator(null)盖掉RequiredElement缺省的覆写能力
 */
export interface TextInputInternalProps extends TextInputProps {
  /**
   * 指示器槽位覆写（内部通道）
   */
  indicatorOverride?: Indicators | null;
}

/**
 * 将validate入参归一化为校验函数（符号名对齐原版static.validationPatterns）
 */
export const resolveValidate = (validate: TextInputValidate | undefined) => {
  if (validate instanceof RegExp) {
    return (value: string) => validate.test(value);
  }
  if (typeof validate === "function") {
    return validate;
  }
  if (validate === "non-empty") {
    return (value: string) => /^./.test(value);
  }
  if (validate === "integer") {
    return (value: string) => /^\d+$/.test(value);
  }
  return undefined;
};

// 实现说明：对齐原版OO.ui.TextInputWidget，type限定在主题有样式的几种（text/search/password等），
// title/dir/tabIndex/aria-disabled按原版落点写在input上，软校验标记经validate给出
/**
 * A single-line text input, and also the base for input components such as
 * MultilineTextInput, NumberInput and SearchInput.
 *
 * 单行文本输入框，同时也是 MultilineTextInput、NumberInput、SearchInput 等输入组件的基础。
 *
 * @see https://bearbin1215.github.io/ooui-react/components/text-input/index.html
 */
export const TextInput = forwardRef<HTMLDivElement, TextInputInternalProps>(
  (
    {
      accessKey,
      name,
      className,
      disabled,
      onChange,
      placeholder,
      maxLength,
      type = "text",
      indicatorProps,
      indicatorOverride,
      icon,
      indicator,
      label,
      invisibleLabel,
      labelPosition = "after",
      readOnly,
      validate,
      flags,
      inputRef,
      inputProps,
      required,
      // tabIndex落在input上（组件根为不可聚焦的div）；title/dir对齐原版InputWidget的落点
      // （TitledElement的$titled与setDir均为$input），同样不放外层div
      tabIndex,
      title,
      dir,
      value,
      defaultValue,
      ...rest
    },
    ref,
  ) => {
    const labelRef = useRef<HTMLSpanElement>(null);
    // 根元素引用：标签让位的内边距落侧按根元素（样式表）方向解析（见useInputProps的rootRef）
    const internalRootRef = useRef<HTMLDivElement>(null);
    const setRootRef = useMergedRefs(ref, internalRootRef);
    // 与其余输入类组件统一受控/非受控语义：非受控时由内部state承接，defaultValue缺省''
    const { value: currentValue, commit } = useControlledValue<
      string,
      ChangeEvent<HTMLInputElement>
    >({ value, defaultValue: defaultValue ?? "" }, onChange);
    const internalInputRef = useRef<HTMLInputElement>(null);
    const setInputRef = useMergedRefs(inputRef, internalInputRef);
    // 输入元素的公共属性派生：属性落点、字段id、标签让位、指示器回退、装饰聚焦、软校验
    const {
      inputProps: commonInputProps,
      invalid,
      decorationProps,
      indicator: resolvedIndicator,
      indicatorProps: indicatorSlotProps,
    } = useInputProps<HTMLInputElement, string>({
      inputRef: internalInputRef,
      rootRef: internalRootRef,
      value: currentValue,
      validate: resolveValidate(validate),
      disabled,
      tabIndex,
      accessKey,
      name,
      readOnly,
      required,
      placeholder,
      maxLength,
      title,
      invisibleLabel,
      dir,
      labelRef,
      label,
      labelPosition,
      indicator,
      indicatorOverride,
      indicatorProps,
      onCommitValue: (next, event) => commit(next, event),
    });
    const validType = VALID_INPUT_TYPES.includes(type) ? type : "text";

    const classes = clsx(
      className,
      // 指示器类按解析后的取值判定：required 且未显式给 indicator 时回退为 required 指示器
      getTextInputClassName(
        {
          disabled,
          icon,
          indicator: resolvedIndicator ?? undefined,
          label,
          invisibleLabel,
          labelPosition,
          type: validType,
          flags,
          invalid,
        },
        [],
        "input",
        "textInput",
      ),
    );

    return (
      <div
        {...rest}
        className={classes}
        aria-disabled={disabled || undefined}
        ref={setRootRef}
      >
        <input
          ref={setInputRef}
          // 形态专属属性（type）与调用方的inputProps通道经useInputProps的合并规则并入
          {...commonInputProps({ type: validType }, inputProps)}
        />
        <IconBase icon={icon} {...decorationProps} />
        <IndicatorBase {...indicatorSlotProps} />
        {hasLabel(label) && (
          <LabelBase ref={labelRef} invisible={invisibleLabel}>
            {label}
          </LabelBase>
        )}
      </div>
    );
  },
);

TextInput.displayName = "TextInput";
