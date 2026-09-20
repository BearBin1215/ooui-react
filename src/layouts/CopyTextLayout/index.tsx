import { forwardRef, useRef, type FocusEvent } from "react";
import clsx from "clsx";
import { FieldLayout, type FieldLayoutProps } from "../FieldLayout";
import { Button, type ButtonProps } from "../../widgets/Button";
import { TextInput, type TextInputProps } from "../../widgets/TextInput";
import {
  MultilineTextInput,
  type MultilineTextInputProps,
} from "../../widgets/MultilineTextInput";
import { useMessage } from "../../config";

/**
 * Text-input configuration for `CopyTextLayoutProps.textInputProps`: shared by
 * the single-line and multiline forms (the input element type is a union of
 * input and textarea, and the multiline-only `rows` / `maxRows` / `autosize` are
 * allowed). `inputRef` is excluded because the layout uses it internally for copy
 * and select-all, so passing it is a compile error.
 *
 * CopyTextLayout 的文本框配置：单行与多行通用（输入元素类型为 input 与
 * textarea 的联合，并放行多行专属的 `rows` / `maxRows` / `autosize`）。
 * `inputRef` 由布局自身占用（复制与聚焦全选需要），传入即编译报错。
 */
export type CopyTextLayoutTextInputProps = Omit<
  Partial<TextInputProps<HTMLInputElement | HTMLTextAreaElement>>,
  "inputRef"
> &
  Partial<Pick<MultilineTextInputProps, "rows" | "maxRows" | "autosize">>;

export interface CopyTextLayoutProps extends Omit<FieldLayoutProps, "children"> {
  /**
   * The text to copy (used as the field's initial value; `textInputProps.value`
   * takes precedence when given).
   *
   * 待复制文本，作为文本框初始值；`textInputProps.value` 给定时以后者为准。
   */
  copyText?: string;

  /**
   * Whether the field is multiline (uses MultilineTextInput; the copy button
   * moves below-right).
   *
   * 是否多行：文本框换用 MultilineTextInput，复制按钮移至下方右对齐。
   */
  multiline?: boolean;

  /**
   * Text-input props override: `value` is the controlled value, `readOnly`
   * defaults to `true`, the rest pass through.
   *
   * 文本框 props 覆盖：`value` 为受控值、`readOnly` 缺省 `true`，其余透传。
   */
  textInputProps?: CopyTextLayoutTextInputProps;

  /**
   * Copy-button props override: `children` is the button text, `icon` defaults
   * to `'copy'`.
   *
   * 复制按钮 props 覆盖：`children` 为按钮文本，`icon` 缺省 `'copy'`。
   */
  buttonProps?: Partial<ButtonProps>;

  /**
   * Copy-finished callback, carrying whether the copy succeeded.
   *
   * 复制结束回调，入参为是否复制成功。
   */
  onCopyResult?: (copied: boolean) => void;
}

/**
 * A copy-text layout: a read-only field with a copy button; the text is selected
 * automatically on focus or button click. Suits read-only content the user needs
 * to copy.
 *
 * 复制文本布局：只读文本框 + 复制按钮，聚焦或点击按钮时自动全选文本。
 * 适合用户需要复制的只读内容。
 *
 * @see https://bearbin1215.github.io/ooui-react/components/copy-text-layout/index.html
 */
export const CopyTextLayout = forwardRef<HTMLDivElement, CopyTextLayoutProps>(
  (
    {
      buttonProps,
      className,
      copyText,
      label,
      multiline,
      onCopyResult,
      textInputProps,
      ...rest
    },
    ref,
  ) => {
    const singleLineRef = useRef<HTMLInputElement>(null);
    const multilineRef = useRef<HTMLTextAreaElement>(null);
    /**
     * 防重入标记（对齐原版CopyTextLayout.selecting）：本实现调DOM `select()`不移焦，
     * 但select()仍会派发select事件，保留该标记以免事件回环再次进入全选
     */
    const selectingRef = useRef(false);
    const defaultButtonLabel = useMessage("ooui-copytextlayout-copy");
    const {
      onFocus: callerInputFocus,
      readOnly = true,
      value: controlledValue,
      ...textInputRest
    } = textInputProps ?? {};
    const {
      children: buttonChildren,
      icon: buttonIcon = "copy",
      onClick: callerButtonClick,
      ...buttonRest
    } = buttonProps ?? {};

    /** 当前实际渲染的输入元素（单行input与多行textarea二选一） */
    const getInput = () => (multiline ? multilineRef.current : singleLineRef.current);

    /** 全选文本并保持滚动位置，对齐原版selectText */
    const selectText = () => {
      const input = getInput();
      if (!input) {
        return;
      }
      const { scrollTop, scrollLeft } = input;
      selectingRef.current = true;
      input.select();
      selectingRef.current = false;
      input.scrollTop = scrollTop;
      input.scrollLeft = scrollLeft;
    };

    /** 写入剪贴板：优先navigator.clipboard，失败或不可用时回落到execCommand（需已选中） */
    const copyToClipboard = async (): Promise<boolean> => {
      const text = getInput()?.value ?? "";
      if (navigator.clipboard?.writeText) {
        try {
          await navigator.clipboard.writeText(text);
          return true;
        } catch {
          // 权限被拒或非安全上下文：继续尝试execCommand
        }
      }
      try {
        return document.execCommand("copy");
      } catch {
        return false;
      }
    };

    /** 点击复制按钮：先全选再复制，结果经onCopyResult上报（对齐原版onButtonClick） */
    const handleCopy = async () => {
      selectText();
      onCopyResult?.(await copyToClipboard());
    };

    /**
     * 文本框聚焦即全选（对齐原版onInputFocus），便于直接Ctrl+C。
     * 原版绑定在输入元素上，此处透传到组件根（React的onFocus按focusin冒泡，
     * 根内唯一可聚焦元素即输入框，效果等同）
     */
    const handleInputFocus = (e: FocusEvent<HTMLDivElement>) => {
      callerInputFocus?.(e);
      if (!selectingRef.current) {
        selectText();
      }
    };

    // 受控value优先，否则以copyText作非受控初始值；两者都缺省时不干预输入框默认值
    const uncontrolledValueProps =
      copyText !== undefined ? { defaultValue: copyText } : {};
    const valueProps =
      controlledValue !== undefined ? { value: controlledValue } : uncontrolledValueProps;

    const inputNode = multiline ? (
      <MultilineTextInput
        {...textInputRest}
        {...valueProps}
        onFocus={handleInputFocus}
        readOnly={readOnly}
        inputRef={multilineRef}
      />
    ) : (
      <TextInput
        {...textInputRest}
        {...valueProps}
        onFocus={handleInputFocus}
        readOnly={readOnly}
        inputRef={singleLineRef}
      />
    );

    return (
      <FieldLayout
        {...rest}
        className={clsx(className, "oo-ui-actionFieldLayout", "oo-ui-copyTextLayout")}
        label={label}
        ref={ref}
      >
        {/* 多行形态不套用单行排布的连接类：此时按钮不与输入区并排，改由下方
            oo-ui-copyTextLayout-multiline-button另起一行右浮 */}
        <div className={multiline ? undefined : "oo-ui-actionFieldLayout-input"}>
          {inputNode}
        </div>
        <span
          className={
            multiline
              ? "oo-ui-copyTextLayout-multiline-button"
              : "oo-ui-actionFieldLayout-button"
          }
        >
          <Button
            {...buttonRest}
            icon={buttonIcon}
            onClick={(e) => {
              callerButtonClick?.(e);
              void handleCopy();
            }}
          >
            {buttonChildren ?? defaultButtonLabel}
          </Button>
        </span>
      </FieldLayout>
    );
  },
);

CopyTextLayout.displayName = "CopyTextLayout";
