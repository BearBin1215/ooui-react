import {
  useEffect,
  useRef,
  forwardRef,
  type ChangeEvent,
  type KeyboardEventHandler,
  type Ref,
} from "react";
import clsx from "clsx";
import { clamp } from "es-toolkit";
import { Button } from "../Button";
import { IconBase } from "../Icon/Base";
import { IndicatorBase } from "../Indicator/Base";
import { LabelBase } from "../Label/Base";
import { getTextInputClassName, hasLabel } from "../../mixins";
import { useControlledValue, useLatestRef, useMergedRefs } from "../../hooks";
import { warnOnceInDev } from "../../utils";
import { useInputProps, type UserInputProps } from "../Input/props";
import type { InputProps } from "../Input";
import type { LabelPosition } from "../Label";
import type {
  AccessKeyedElement,
  FlaggedElement,
  IconElement,
  IndicatorElement,
  LabelElement,
} from "../../Element";

/**
 * allowInteger的强制步长与buttonStep的缺省步长（对齐原版setStep的`step || 1`）
 */
const DEFAULT_STEP = 1;

/**
 * PageUp/PageDown步长相对buttonStep的倍数（对齐原版`pageStep = 10 * buttonStep`）
 */
const PAGE_STEP_MULTIPLIER = 10;

/**
 * Props of the number input: the value is a `number`, and empty (cleared or
 * non-numeric input) is `''`.
 *
 * 数字输入框属性：值为 `number`，空值（清空或键入非数字）为 `''`。
 */
export interface NumberInputProps
  extends
    InputProps<number | "", HTMLInputElement, HTMLDivElement>,
    AccessKeyedElement,
    IconElement,
    IndicatorElement,
    LabelElement,
    FlaggedElement {
  /**
   * Whether to show the stepping buttons on both sides
   *
   * 是否显示两侧步进按钮
   */
  showButtons?: boolean;

  /**
   * Minimum (stepping clamp + soft-validation bound).
   *
   * 最小值（步进钳制 + 软校验边界）
   */
  min?: number;

  /**
   * Maximum (stepping clamp + soft-validation bound).
   *
   * 最大值（步进钳制 + 软校验边界）
   */
  max?: number;

  /**
   * Validity step (the value must be a multiple); decimals unrestricted by default.
   *
   * 合法性步距（值需为其倍数），缺省不限制小数
   */
  step?: number;

  /**
   * Deprecated compatibility option: integers only (forces `step={1}`); a
   * development warning fires when set. `isInteger` is its alias.
   *
   * 废弃兼容配置：仅允许整数（强制 `step={1}`），置位有开发期告警；`isInteger` 为其别名
   */
  allowInteger?: boolean;

  /**
   * Alias of `allowInteger`.
   *
   * `allowInteger` 的别名
   */
  isInteger?: boolean;

  /**
   * Step for buttons / ↑↓ / wheel.
   *
   * 按钮 / ↑↓ / 滚轮的步距
   *
   * @default step ?? 1
   */
  buttonStep?: number;

  /**
   * Step for PgUp/PgDn.
   *
   * PgUp/PgDn 的步距
   *
   * @default buttonStep × 10
   */
  pageStep?: number;

  /**
   * Label position
   *
   * 标签位置
   */
  labelPosition?: LabelPosition;

  /**
   * Read-only (keeps focus; forbids edits and stepping)
   *
   * 只读（保留聚焦，禁止修改与步进）
   */
  readOnly?: boolean;

  /**
   * Ref to the inner `<input>` (the component ref points to the root div)
   *
   * 内部 `<input>` 的引用（组件 ref 指向外层 div）
   */
  inputRef?: Ref<HTMLInputElement>;

  /**
   * Extra-props channel for the native `<input>`; `onChange` / `onBlur` / `onFocus`
   * are chained after the component logic.
   *
   * 原生 `<input>` 的附加属性通道（`...rest` 落在根 div）；`onChange`/`onBlur`/`onFocus`
   * 串联在组件自身逻辑之后（数值解析管线不会被截断）
   */
  inputProps?: UserInputProps<HTMLInputElement>;
}

// 实现说明：对齐原版OO.ui.NumberInputWidget——步进按钮/方向键（±step）与滚轮步进，值按min/max
// 钳制但保留键入中的原文（失焦才收敛），空串视作无值，非法值经软校验标记
/**
 * A number input; input capabilities match TextInput.
 *
 * 数字输入框，输入能力与 TextInput 一致。
 *
 * @see https://bearbin1215.github.io/ooui-react/components/number-input/index.html
 */
export const NumberInput = forwardRef<HTMLDivElement, NumberInputProps>(
  (
    {
      name,
      accessKey,
      className,
      disabled,
      onChange,
      icon,
      indicator,
      label,
      invisibleLabel,
      labelPosition = "after",
      min,
      max,
      placeholder,
      readOnly,
      required,
      // tabIndex落在input上（组件根为不可聚焦的div）
      tabIndex,
      showButtons = true,
      step: stepProp,
      allowInteger,
      isInteger,
      buttonStep: buttonStepProp,
      pageStep: pageStepProp,
      flags,
      // title落在input上（对齐原版InputWidget的TitledElement落点$input），不放外层div
      title,
      // dir同落input（对齐原版setDir的落点）
      dir,
      inputRef,
      inputProps: inputPropsProp,
      value: controlledValue,
      defaultValue,
      ...rest
    },
    ref,
  ) => {
    // 对齐原版构造逻辑：allowInteger/isInteger为废弃兼容配置，置位时强制step=1（覆盖显式传入值）；
    // buttonStep与pageStep缺省值见DEFAULT_STEP与PAGE_STEP_MULTIPLIER
    const step = allowInteger || isInteger ? DEFAULT_STEP : stepProp;
    const buttonStep = buttonStepProp ?? step ?? DEFAULT_STEP;
    const pageStep = pageStepProp ?? buttonStep * PAGE_STEP_MULTIPLIER;
    // 废弃别名置位时开发期告警一次（原版静默采纳，见DEVIATIONS「等效替代」的NumberInput条）；
    // step/buttonStep/pageStep非正数同告警（原版构造期抛错，本工程收为告警，
    // 见DEVIATIONS「舍弃」的非正 step 校验条）。告警按值变化触发（同key只告警一次），
    // 收在effect里以保持渲染期无副作用
    useEffect(() => {
      if (allowInteger || isInteger) {
        warnOnceInDev(
          "number-input:allowInteger",
          isInteger
            ? "NumberInput: isInteger 是 allowInteger 的废弃别名，请改用 allowInteger（强制 step=1）。"
            : "NumberInput: allowInteger 是废弃的兼容配置（强制 step=1），将在后续版本移除。",
        );
      }
      for (const [stepName, stepValue] of [
        ["step", step],
        ["buttonStep", buttonStep],
        ["pageStep", pageStep],
      ] as const) {
        if (stepValue !== undefined && stepValue <= 0) {
          warnOnceInDev(
            `number-input:${stepName}`,
            `NumberInput: ${stepName} 必须为正数，当前为 ${stepValue}（原版对非正 step 抛错）。`,
          );
        }
      }
    }, [allowInteger, isInteger, step, buttonStep, pageStep]);
    const { value: currentValue, commit } = useControlledValue<
      number | "",
      ChangeEvent<HTMLInputElement>
    >({ value: controlledValue, defaultValue: defaultValue ?? "" }, onChange);
    // 内部input引用与调用方ref合并（组件ref指向外层div，聚焦/选区等操作经inputRef）
    const internalInputRef = useRef<HTMLInputElement>(null);
    const setInputRef = useMergedRefs(inputRef, internalInputRef);
    // 标签元素引用（原版TextInputWidget的LabelElement：input按标签宽度预留内边距）
    const labelRef = useRef<HTMLSpanElement>(null);
    // 根元素引用：标签让位的内边距落侧按根元素（样式表）方向解析（见useInputProps的rootRef）
    const internalRootRef = useRef<HTMLDivElement>(null);
    const setRootRef = useMergedRefs(ref, internalRootRef);
    /**
     * 展示值：空值/非数字时显示为空
     */
    const displayValue =
      typeof currentValue === "number" && !Number.isNaN(currentValue) ? currentValue : "";

    /**
     * 当前值的数值形态，空值为NaN
     */
    const getNumericValue = () => (currentValue === "" ? NaN : currentValue);

    /**
     * 数值合法性判定（对齐原版validateNumber）：空值看required，非有限值/非step倍数/超出
     * [min,max]均非法。作为软校验的判定函数，不改写值
     */
    const validateNumber = (value: number | "") => {
      if (value === "") {
        return !required;
      }
      if (!Number.isFinite(value)) {
        return false;
      }
      if (step !== undefined && Math.floor(value / step) !== value / step) {
        return false;
      }
      return (min === undefined || value >= min) && (max === undefined || value <= max);
    };

    // 输入元素的公共属性派生：原版NumberInputWidget继承TextInputWidget，这些能力与TextInput同源
    const {
      inputProps: commonInputProps,
      invalid,
      decorationProps,
      indicator: resolvedIndicator,
      indicatorProps: indicatorSlotProps,
      revalidate,
    } = useInputProps<HTMLInputElement, number | "">({
      inputRef: internalInputRef,
      rootRef: internalRootRef,
      value: currentValue,
      validate: validateNumber,
      // 挂载期即校验：复现原版构造期行为（空值+required在加载时即输出非法标记）
      validateOnMount: true,
      disabled,
      tabIndex,
      accessKey,
      name,
      readOnly,
      required,
      placeholder,
      title,
      invisibleLabel,
      dir,
      labelRef,
      label,
      labelPosition,
      indicator,
      // 数值解析挂入值管线（对齐原版语义：保留输入不做钳制，空串保持为空），
      // 调用方经inputProps传入的onChange会串联在其后而非替换
      onCommitValue: (next, event) => {
        const parsed = +next;
        commit(next === "" || Number.isNaN(parsed) ? "" : parsed, event);
      },
    });
    // 约束配置变化立即重校验（对齐原版setRange/setStep的setValidityFlag）；
    // 挂载期校验已由validateOnMount承担，跳过首轮避免重复检查
    const constraintMountedRef = useRef(false);
    useEffect(() => {
      if (!constraintMountedRef.current) {
        constraintMountedRef.current = true;
        return;
      }
      revalidate();
    }, [min, max, step, required, revalidate]);

    /**
     * 调整数值，对齐原版adjustValue：空值从0起步，非空钳制到[min,max]并按step取整
     */
    const adjustValue = (delta: number) => {
      const v = getNumericValue();
      let n: number;
      if (isNaN(v)) {
        n = 0;
      } else {
        n = clamp(v + delta, min ?? -Infinity, max ?? Infinity);
        n = step ? Math.round(n / step) * step : n;
      }
      if (n !== v) {
        commit(n);
      }
    };

    // 滚轮步进，对齐原版onWheel：聚焦时按buttonStep调整并阻止页面滚动。
    // React合成wheel事件是passive的无法preventDefault，需挂原生监听；disabled/readOnly/
    // 步进与调整逻辑经ref读取最新闭包，监听只随挂载挂卸一次（不设依赖的每渲染重挂会使
    // 每次键入都remove/addEventListener）
    const wheelStateRef = useLatestRef({ disabled, readOnly, buttonStep, adjustValue });
    useEffect(() => {
      const input = internalInputRef.current;
      if (!input) {
        return;
      }
      const handleWheel = (ev: WheelEvent) => {
        const {
          disabled: disabledNow,
          readOnly: readOnlyNow,
          buttonStep: buttonStepNow,
          adjustValue: adjustNow,
        } = wheelStateRef.current;
        if (disabledNow || readOnlyNow) {
          return;
        }
        // 对齐原版onWheel：deltaY为0时回退取deltaX（横向滚轮/触摸板横滑）
        const delta = ev.deltaY ? -ev.deltaY : ev.deltaX;
        if (!delta) {
          return;
        }
        // 对齐原版onWheel前置条件（$input.is(':focus')）：仅聚焦时步进并阻止页面滚动，
        // 悬停未聚焦时不拦截，避免滚动页面误改数值
        if (document.activeElement !== input) {
          return;
        }
        ev.preventDefault();
        adjustNow(delta < 0 ? -buttonStepNow : buttonStepNow);
      };
      input.addEventListener("wheel", handleWheel, { passive: false });
      return () => {
        input.removeEventListener("wheel", handleWheel);
      };
    }, [wheelStateRef]);

    const classes = clsx(
      className,
      // 指示器类按解析后的取值判定（required 且未显式给 indicator 时回退为 required 指示器）
      getTextInputClassName(
        {
          disabled,
          icon,
          indicator: resolvedIndicator ?? undefined,
          label,
          invisibleLabel,
          labelPosition,
          type: "number",
          flags,
          invalid,
        },
        [showButtons && "oo-ui-numberInputWidget-buttoned"],
        "input",
        "textInput",
        "numberInput",
      ),
    );

    /**
     * 方向键/PageUp/Down步进
     */
    const handleKeyDown: KeyboardEventHandler<HTMLInputElement> = (ev) => {
      if (disabled || readOnly) {
        return;
      }
      switch (ev.key) {
        case "ArrowUp":
          ev.preventDefault();
          adjustValue(buttonStep);
          break;
        case "ArrowDown":
          ev.preventDefault();
          adjustValue(-buttonStep);
          break;
        case "PageUp":
          ev.preventDefault();
          adjustValue(pageStep);
          break;
        case "PageDown":
          ev.preventDefault();
          adjustValue(-pageStep);
          break;
      }
    };

    return (
      <div
        {...rest}
        className={classes}
        aria-disabled={disabled || undefined}
        ref={setRootRef}
      >
        <IconBase icon={icon} {...decorationProps} />
        <IndicatorBase {...indicatorSlotProps} />
        <div className="oo-ui-numberInputWidget-field">
          {showButtons && (
            <Button
              className="oo-ui-numberInputWidget-minusButton"
              icon="subtract"
              aria-hidden
              tabIndex={-1}
              disabled={disabled || readOnly}
              onClick={() => adjustValue(-buttonStep)}
            />
          )}
          <input
            ref={setInputRef}
            // 形态专属属性（type/min/max/step/按键步进）与调用方的inputProps通道经useInputProps的合并规则并入
            {...commonInputProps(
              {
                type: "number",
                value: displayValue,
                onKeyDown: handleKeyDown,
                min,
                max,
                // step缺省'any'（不限制小数），对齐原版setStep的attr输出
                step: step ?? "any",
              },
              inputPropsProp,
            )}
          />
          {showButtons && (
            <Button
              className="oo-ui-numberInputWidget-plusButton"
              icon="add"
              aria-hidden
              tabIndex={-1}
              disabled={disabled || readOnly}
              onClick={() => adjustValue(buttonStep)}
            />
          )}
        </div>
        {hasLabel(label) && (
          <LabelBase ref={labelRef} invisible={invisibleLabel}>
            {label}
          </LabelBase>
        )}
      </div>
    );
  },
);

NumberInput.displayName = "NumberInput";
