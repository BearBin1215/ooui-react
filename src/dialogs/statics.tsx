import { type MutableRefObject, type ReactNode } from "react";
import { isComposingKeyEvent } from "../utils";
import { FieldLayout } from "../layouts/FieldLayout";
import { TextInput, type TextInputProps } from "../widgets/TextInput";
import { MessageDialog } from "./MessageDialog";
import { type DialogProps } from "./Dialog";
import { enqueueDialog } from "./imperative";

/**
 * Options for {@link confirm} / {@link alert}.
 *
 * {@link confirm} / {@link alert} 的配置项。
 */
export interface ConfirmAlertOptions {
  /**
   * Dialog title.
   *
   * 弹窗标题。
   */
  title?: ReactNode;

  /**
   * OK button text.
   *
   * 确认按钮文本。
   */
  okLabel?: ReactNode;

  /**
   * Cancel button text (confirm only).
   *
   * 取消按钮文本（仅 confirm）。
   */
  cancelLabel?: ReactNode;

  /**
   * Dialog size.
   *
   * 弹窗大小。
   */
  size?: DialogProps["size"];
}

/**
 * Options for {@link alert} — {@link ConfirmAlertOptions} without `cancelLabel`
 * (the alert has only an OK button).
 *
 * {@link alert} 的配置项——不含 `cancelLabel` 的 {@link ConfirmAlertOptions}（只有确定按钮）。
 */
export type AlertOptions = Omit<ConfirmAlertOptions, "cancelLabel">;

/**
 * Options for {@link prompt}.
 *
 * {@link prompt} 的配置项。
 */
export interface PromptOptions extends ConfirmAlertOptions {
  /**
   * TextInput props for the prompt field. `value` is used only as the initial
   * value; the typed value is maintained internally by prompt.
   *
   * 文本输入框属性。`value` 仅作为初始值，输入值由 prompt 内部维护。
   */
  textInput?: TextInputProps;
}

/**
 * Shows a confirmation dialog, aligning with the original `OO.ui.confirm`:
 * resolves `true` on OK, `false` on Cancel or ESC. A standalone imperative API
 * (as in the original, it is not a MessageDialog static). The dialog is mounted
 * through the in-tree host rendered by `OOUIProvider`, so it inherits that
 * subtree's context; without a provider it lazy-mounts to `body` with defaults.
 *
 * 弹出确认框（对齐原版 `OO.ui.confirm`）：确定时兑现 `true`，取消 / ESC 时兑现
 * `false`。命令式 API，与 MessageDialog 组件单向依赖。弹窗经 `OOUIProvider`
 * 渲染的宿主挂载，继承所在子树的 context；未包 Provider 时懒挂 body。
 *
 * @see https://bearbin1215.github.io/ooui-react/components/imperative-dialogs/index.html
 */
export function confirm(
  message: ReactNode,
  options: ConfirmAlertOptions = {},
): Promise<boolean> {
  return enqueueDialog<boolean>(({ open, close }) => (
    <MessageDialog
      open={open}
      title={options.title}
      size={options.size}
      okLabel={options.okLabel}
      cancelLabel={options.cancelLabel}
      escapable
      onEscape={() => close(false)}
      onOk={() => close(true)}
      onCancel={() => close(false)}
    >
      {message}
    </MessageDialog>
  ));
}

/**
 * Shows an alert dialog with an OK button only, aligning with the original
 * `OO.ui.alert`; resolves `undefined` when closed (OK, ESC, or any dismiss).
 * A standalone imperative API (as in the original, it is not a MessageDialog static).
 *
 * 弹出仅含确定按钮的提示框（对齐原版 `OO.ui.alert`），关闭时兑现 `undefined`。
 * 命令式 API，与 MessageDialog 组件单向依赖。
 *
 * @see https://bearbin1215.github.io/ooui-react/components/imperative-dialogs/index.html
 */
export function alert(message: ReactNode, options: AlertOptions = {}): Promise<void> {
  return enqueueDialog<void>(({ open, close }) => (
    <MessageDialog
      open={open}
      title={options.title}
      size={options.size}
      okLabel={options.okLabel}
      cancelLabel={null}
      escapable
      onEscape={() => close()}
      onOk={() => close()}
    >
      {message}
    </MessageDialog>
  ));
}

/**
 * Shows a prompt dialog with a text input, aligning with the original
 * `OO.ui.prompt`: resolves the input value on OK (or Enter in the field),
 * `null` on Cancel or ESC.
 *
 * 弹出带文本输入框的确认框（对齐原版 `OO.ui.prompt`）：确定（或输入框内按
 * Enter）时兑现输入值，取消 / ESC 时兑现 `null`。
 *
 * @see https://bearbin1215.github.io/ooui-react/components/imperative-dialogs/index.html
 */
export function prompt(
  message: ReactNode,
  options: PromptOptions = {},
): Promise<string | null> {
  const {
    value: initialValue,
    defaultValue,
    onChange: callerOnChange,
    onKeyDown: callerOnKeyDown,
    // inputRef由prompt内部占用（自动聚焦），解构排除避免透传时被覆盖
    inputRef: _callerInputRef,
    ...textInputRest
  } = options.textInput ?? {};

  // 输入期间累积的值与自动聚焦目标：以闭包内ref承载，使每次prompt调用各持一份，
  // 从而复用统一的挂载骨架。初值取initialValue（即textInput.value），缺省再回落defaultValue
  const valueRef: MutableRefObject<string> = {
    current: String(initialValue ?? defaultValue ?? ""),
  };
  const inputRef: MutableRefObject<HTMLInputElement | null> = { current: null };

  return enqueueDialog<string | null>(({ open, close }) => (
    <MessageDialog
      open={open}
      title={options.title}
      size={options.size}
      okLabel={options.okLabel}
      cancelLabel={options.cancelLabel}
      escapable
      onEscape={() => close(null)}
      onOk={() => close(valueRef.current)}
      onCancel={() => close(null)}
      // 对齐原版instance.opened.then内的textInput.focus()：经MessageDialog.onReady在ready时
      // 确定性执行，时序上晚于其内部聚焦OK按钮（原版即为先弹窗聚焦、再输入框聚焦覆盖）
      onReady={() => inputRef.current?.focus()}
    >
      <FieldLayout align="top" label={message}>
        <TextInput
          {...textInputRest}
          defaultValue={initialValue ?? defaultValue}
          inputRef={inputRef}
          onChange={(next, event) => {
            valueRef.current = next;
            callerOnChange?.(next, event);
          }}
          onKeyDown={(event) => {
            // callerOnKeyDown先行，允许调用方preventDefault否决提交
            callerOnKeyDown?.(event);
            // 对齐原版textInput.on('enter')：输入框内按Enter等同点击确定，但排除IME合成期
            // （中文/日文用户回车上屏时不提交、不关窗，判据见isComposingKeyEvent）
            if (
              event.key === "Enter" &&
              !isComposingKeyEvent(event) &&
              !event.defaultPrevented
            ) {
              event.preventDefault();
              close(valueRef.current);
            }
          }}
        />
      </FieldLayout>
    </MessageDialog>
  ));
}
