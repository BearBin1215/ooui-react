import {
  forwardRef,
  type MouseEvent,
  type MouseEventHandler,
  type KeyboardEventHandler,
  type ReactNode,
} from "react";
import clsx from "clsx";
import {
  buttonElementClasses,
  getButtonIconClasses,
  getWidgetClassName,
  resolveTabIndex,
  resolveTitle,
  toFlagArray,
} from "../../mixins";
import { useAccessKeyLabel } from "../../config";
import { useFieldAccessKey, usePressedState } from "../../hooks";
import type {
  AccessKeyedElement,
  ButtonFlag,
  IconElement,
  IndicatorElement,
} from "../../Element";
import type { WidgetProps } from "../Widget";
import { ButtonSlots } from "../Button/slots";

/**
 * Props for the form button.
 *
 * 表单按钮属性。
 */
export interface ButtonInputProps
  extends
    Omit<
      WidgetProps<HTMLSpanElement>,
      "children" | "onClick" | "onMouseDown" | "onMouseUp" | "onKeyDown" | "onKeyUp"
    >,
    AccessKeyedElement,
    IconElement,
    IndicatorElement {
  /**
   * Button label.
   *
   * 按钮文本。
   */
  children?: ReactNode;

  /**
   * HTML `type` attribute.
   *
   * HTML `type` 属性。
   * @default 'button'
   */
  type?: "button" | "submit" | "reset";

  /**
   * Render as an `<input>` instead of a `<button>`; icons, indicators and
   * `value` are not supported, and the label must be plain text.
   *
   * 渲染为 `<input>` 而非 `<button>`；不支持图标、指示器与 `value`，
   * 标签仅支持纯文本。
   */
  useInputTag?: boolean;

  /**
   * Whether it has a border.
   *
   * 是否带边框。
   */
  framed?: boolean;

  /**
   * Label visually hidden but kept as the accessible name.
   *
   * 标签视觉隐藏（保留可访问名称）。
   */
  invisibleLabel?: boolean;

  /**
   * Extra flags (color and button-specific form).
   *
   * 附加标志（色彩与按钮专属形态）。
   */
  flags?: ButtonFlag | ButtonFlag[];

  /**
   * Whether the button is in the active state.
   *
   * 是否为激活状态。
   */
  active?: boolean;

  /**
   * Form submission value; ignored when `useInputTag` is set (the `<input>`'s
   * value is the label text).
   *
   * 表单提交值（`useInputTag` 时无效，`<input>` 的 value 为标签文本）。
   */
  value?: string;

  /**
   * Skip form validation on submit.
   *
   * 提交时跳过表单校验。
   */
  formNoValidate?: boolean;

  /**
   * Form field name.
   *
   * 表单提交字段名。
   */
  name?: string;

  /**
   * Click callback; Enter / Space on the native button also fire a click.
   *
   * 点击回调（原生 button 上 Enter / 空格同样触发 click）。
   */
  onClick?: (ev: MouseEvent<HTMLButtonElement | HTMLInputElement>) => void;

  /**
   * Mouse-down handler; the component enters its pressed state first (a
   * disabled button skips pressing but still forwards this).
   *
   * 鼠标按下回调；组件先进入按压态（禁用时不进入但仍转发）。
   */
  onMouseDown?: MouseEventHandler<HTMLElement>;
  /**
   * Mouse-up handler; resets the pressed state, otherwise as `onMouseDown`.
   *
   * 鼠标松开回调；复位按压态，其余同 `onMouseDown`。
   */
  onMouseUp?: MouseEventHandler<HTMLElement>;
  /**
   * Key-down handler; Enter / Space enters the pressed state, otherwise as
   * `onMouseDown`.
   *
   * 按键按下回调；Enter / 空格进入按压态，其余同 `onMouseDown`。
   */
  onKeyDown?: KeyboardEventHandler<HTMLElement>;
  /**
   * Key-up handler; Enter / Space release resets the pressed state, otherwise
   * as `onMouseDown`.
   *
   * 按键松开回调；Enter / 空格释放时复位按压态，其余同 `onMouseDown`。
   */
  onKeyUp?: KeyboardEventHandler<HTMLElement>;
}

/**
 * A form button (OO.ui.ButtonInputWidget): a real `<button>` / `<input>` for
 * native submission with FormLayout. Use Button when you have no form to submit.
 *
 * 表单按钮（对齐原版 OO.ui.ButtonInputWidget）：真实 `<button>` / `<input>`
 * 元素，配合 FormLayout 做原生提交；无表单提交需求时请使用 Button。
 *
 * @see https://bearbin1215.github.io/ooui-react/components/button-input/index.html
 */
export const ButtonInput = forwardRef<HTMLSpanElement, ButtonInputProps>(
  (
    {
      active,
      accessKey,
      children,
      className,
      disabled,
      framed = true,
      formNoValidate,
      icon,
      indicator,
      invisibleLabel,
      name,
      type = "button",
      useInputTag = false,
      value,
      flags = [],
      tabIndex,
      title,
      onClick,
      onMouseDown,
      onMouseUp,
      onKeyDown,
      onKeyUp,
      ...rest
    },
    ref,
  ) => {
    /**
     * 按压态，由JS维护并输出`oo-ui-buttonElement-pressed`类，对齐原版ButtonElement：
     * 键盘为Enter/空格按下与抬起；鼠标为左键按下加类，mouseup可能发生在按钮外，
     * 通过document级capture监听复位（原版onDocumentMouseUp同款）
     */
    const {
      pressed,
      onMouseDown: pressedMouseDown,
      onMouseUp: pressedMouseUp,
      onKeyDown: pressedKeyDown,
      onKeyUp: pressedKeyUp,
    } = usePressedState({
      disabled,
      onMouseDown,
      onMouseUp,
      onKeyDown,
      onKeyUp,
    });
    const flagList = toFlagArray(flags);
    const iconClasses = getButtonIconClasses({
      framed,
      active,
      disabled,
      flags: flagList,
    });
    // title的键位后缀：快捷键文案由宿主解析（未提供时title附原键值）
    const accessKeyLabel = useAccessKeyLabel(accessKey);
    // 快捷键登记给FieldLayout（原版FieldLayout的label tooltip委托字段控件的accessKey；
    // 原版formatTitleWithAccessKey对ButtonInputWidget同样生效，见hooks/field.ts的
    // useFieldAccessKey契约）。组件ref落在外层span（不可聚焦），不做标签点击聚焦通道
    useFieldAccessKey(accessKey);

    const classes = clsx(
      className,
      getWidgetClassName(
        {
          disabled,
          // useInputTag的<input>不支持图标/指示器展示
          icon: useInputTag ? undefined : icon,
          indicator: useInputTag ? undefined : indicator,
          label: children,
          invisibleLabel,
        },
        "input",
        "buttonInput",
      ),
      buttonElementClasses({ framed, active, disabled, pressed, flags: flagList }),
    );

    const handleClick: ButtonInputProps["onClick"] = (ev) => {
      if (!disabled) {
        onClick?.(ev);
      }
    };

    const inputProps = {
      type,
      name,
      className: "oo-ui-inputWidget-input oo-ui-buttonElement-button",
      disabled,
      tabIndex: resolveTabIndex(tabIndex, disabled),
      "aria-disabled": disabled || undefined,
      // title落真实button/input并做invisibleLabel兜底：对齐原版ButtonInputWidget经InputWidget
      // 混入TitledElement（$titled即$input，oojs-ui.js:10026-10028/10357）的落点，属等效替代
      // （见dev-docs/DEVIATIONS.md等效替代的ButtonInput条）
      title: resolveTitle({
        title,
        label: children,
        invisibleLabel,
        accessKey,
        accessKeyLabel,
      }),
      accessKey,
      formNoValidate: formNoValidate || undefined,
      onClick: handleClick,
      onMouseDown: pressedMouseDown,
      onMouseUp: pressedMouseUp,
      onKeyDown: pressedKeyDown,
      onKeyUp: pressedKeyUp,
    } as const;

    return (
      <span {...rest} className={classes} aria-disabled={disabled || undefined} ref={ref}>
        {useInputTag ? (
          <input
            {...inputProps}
            value={typeof children === "string" ? children : ""}
            readOnly
          />
        ) : (
          <button {...inputProps} value={value}>
            <ButtonSlots
              icon={icon}
              variantClasses={iconClasses}
              label={children}
              labelInvisible={invisibleLabel}
              indicator={indicator}
            />
          </button>
        )}
      </span>
    );
  },
);

ButtonInput.displayName = "ButtonInput";
