import { useRef, forwardRef, type ChangeEvent } from "react";
import clsx from "clsx";
import { IconBase } from "../Icon/Base";
import { IndicatorBase } from "../Indicator/Base";
import { LabelBase } from "../Label/Base";
import { elementHiddenClasses, getTextInputClassName, hasLabel } from "../../mixins";
import { useControlledValue, useMergedRefs } from "../../hooks";
import { useAutosize, useScrollbarOffset } from "../Input/autosize";
import { useInputProps } from "../Input/props";
import { resolveValidate, type TextInputProps } from "../TextInput";

/**
 * Props of the multi-line text input; extends TextInput with `rows`, `maxRows`
 * and `autosize`.
 *
 * 多行文本输入框属性；在 TextInput 基础上增加 `rows`、`maxRows` 与 `autosize`。
 */
export interface MultilineTextInputProps extends TextInputProps<HTMLTextAreaElement> {
  /**
   * Minimum number of rows
   *
   * 最小行数
   */
  rows?: number;

  /**
   * Height cap for autosize, in rows.
   *
   * autosize 的高度上限（行）
   *
   * @default max(2 × rows, 10)
   */
  maxRows?: number;

  /**
   * Whether the height follows the content
   *
   * 是否随内容自动调高
   */
  autosize?: boolean;
}

/**
 * 缺省maxRows：2×rows与10取大（对齐原版autosize缺省规则）
 */
const getDefaultMaxRows = (rows?: number) => Math.max(2 * (rows || 0), 10);

// 实现说明：对齐原版OO.ui.MultilineTextInputWidget（继承TextInputWidget，标签/图标/指示器/
// 软校验等能力经useInputProps共享派生）。autosize经一份不可见的同源克隆textarea测量内容高度
// 与maxRows高度并回写真实输入框（见useAutosize）；出现垂直滚动条时按滚动条宽度给指示器与
// 后置标签让位，并把该宽度计入输入框标签同侧的内边距（见useScrollbarOffset）
/**
 * A multi-line text input; input capabilities match TextInput.
 *
 * 多行文本输入框，输入能力与 TextInput 一致。
 *
 * @see https://bearbin1215.github.io/ooui-react/components/multiline-text-input/index.html
 */
export const MultilineTextInput = forwardRef<HTMLDivElement, MultilineTextInputProps>(
  (
    {
      accessKey,
      name,
      className,
      disabled,
      onChange,
      placeholder,
      maxLength,
      icon,
      indicator,
      indicatorProps,
      label,
      invisibleLabel,
      labelPosition = "after",
      readOnly,
      required,
      // tabIndex落在textarea上（组件根为不可聚焦的div）
      tabIndex,
      validate,
      flags,
      autosize,
      rows,
      maxRows: maxRowsProp,
      // title/dir对齐原版InputWidget的落点（TitledElement的$titled与setDir均为$input），不放外层div
      title,
      dir,
      value,
      defaultValue,
      // inputRef透传到内部textarea，inputProps为原生textarea的附加属性通道
      inputRef: inputRefProp,
      inputProps,
      ...rest
    }: MultilineTextInputProps,
    ref,
  ) => {
    const maxRows = maxRowsProp ?? getDefaultMaxRows(rows);
    const labelRef = useRef<HTMLSpanElement>(null);
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const hiddenInputRef = useRef<HTMLTextAreaElement>(null);
    const setTextareaRef = useMergedRefs(textareaRef, inputRefProp);
    // 根元素引用：标签让位的内边距落侧按根元素（样式表）方向解析（见useInputProps的rootRef）
    const internalRootRef = useRef<HTMLDivElement>(null);
    const setRootRef = useMergedRefs(ref, internalRootRef);
    // 与其余输入类组件统一受控/非受控语义：非受控时由内部state承接，defaultValue缺省''
    const { value: currentValue, commit } = useControlledValue<
      string,
      ChangeEvent<HTMLTextAreaElement>
    >({ value, defaultValue: defaultValue ?? "" }, onChange);
    // autosize高度：经state回到渲染流程，与标签让位的内边距共用同一处style
    const autosizeStyle = useAutosize({
      enabled: !!autosize,
      textareaRef,
      cloneRef: hiddenInputRef,
      rows,
      maxRows,
      value: currentValue,
    });
    // 滚动条让位：垂直滚动条出现时，指示器与后置标签按滚动条宽度偏移；滚动条宽度同时计入
    // 输入框标签同侧的内边距（对齐原版positionLabel，经useInputProps的scrollbarWidth并入）。
    // 多行恒启用——固定行数（非autosize）时同样会出现滚动条，原版该分支也在autosize判断之外。
    // 传入根ref：让位只在滚动条所在侧与主题CSS锚定侧（根方向）一致时生效（见useScrollbarOffset）。
    // 该测量同时给出根方向（rootRtl）并回传给useInputProps：标签让位取侧与撤回判定取同一份
    // 方向、在同一测量周期更新（方向解析的单一来源，见DEVIATIONS「标签让位的内边距落侧」条）
    const { scrollbarWidth, indicatorStyle, labelStyle, rootRtl } = useScrollbarOffset({
      inputRef: textareaRef,
      rootRef: internalRootRef,
      labelPosition,
    });
    // 输入元素的公共属性派生：属性落点、字段id、标签让位、指示器回退、装饰聚焦、软校验
    const {
      inputProps: commonInputProps,
      invalid,
      decorationProps,
      indicator: resolvedIndicator,
      indicatorProps: indicatorSlotProps,
    } = useInputProps<HTMLTextAreaElement, string>({
      inputRef: textareaRef,
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
      indicatorProps,
      onCommitValue: (next, event) => commit(next, event),
      inputStyle: autosizeStyle,
      scrollbarWidth,
      rootRtl,
    });

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
          type: "text",
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
        <textarea
          ref={setTextareaRef}
          // 形态专属属性（rows/autosized类）与调用方的inputProps通道经useInputProps的合并规则并入
          {...commonInputProps(
            {
              rows,
              className: autosize ? "oo-ui-textInputWidget-autosized" : undefined,
            },
            inputProps,
          )}
        />
        {autosize && (
          // 测量用隐藏节点：不挂可聚焦属性（accessKey/tabIndex）与表单语义，避免主题CSS未就绪时进入tab序。
          // 盒模型与字体由 useAutosize 在每次测量前从真实输入框同步；调用方inputProps的类与行内样式
          // 可能携带影响排版的声明（如字体/字距），一并镜像保持测量同源（height由测量流程管理）
          <textarea
            className={clsx(
              "oo-ui-inputWidget-input",
              elementHiddenClasses(true),
              inputProps?.className,
            )}
            style={{ height: "auto", ...inputProps?.style }}
            aria-hidden="true"
            rows={maxRows}
            ref={hiddenInputRef}
          />
        )}
        <IconBase icon={icon} {...decorationProps} />
        {/* 滚动条让位样式叠在槽位属性（含调用方indicatorProps.style）之后：让位是布局校正值 */}
        <IndicatorBase
          {...indicatorSlotProps}
          style={{ ...indicatorSlotProps.style, ...indicatorStyle }}
        />
        {hasLabel(label) && (
          <LabelBase ref={labelRef} invisible={invisibleLabel} style={labelStyle}>
            {label}
          </LabelBase>
        )}
      </div>
    );
  },
);

MultilineTextInput.displayName = "MultilineTextInput";
