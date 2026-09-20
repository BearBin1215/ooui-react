import { useRef, forwardRef, type ReactNode } from "react";
import clsx from "clsx";
import { Button, type ButtonProps } from "../Button";
import { Popup, type PopupProps } from "../Popup";
import { useCleanId, useControlledValue, useMergedRefs } from "../../hooks";

/**
 * Props of the popup button: the button's appearance props, the open channels, and
 * the popup-side props that are forwarded to the inner Popup.
 *
 * 弹出按钮属性：按钮侧外观属性、浮层开合通道，以及透传给内部 Popup 的浮层侧属性。
 */
export type PopupButtonProps = Omit<ButtonProps, "onClick" | "active"> &
  Omit<
    PopupProps,
    "open" | "defaultOpen" | "onOpenChange" | "autoClose" | "autoCloseIgnore" | "children"
  > & {
    /**
     * Button click callback; fires before the open state is toggled.
     *
     * 按钮点击回调（在切换开合前触发）
     */
    onClick?: ButtonProps["onClick"];

    /**
     * Whether the popup is open (controlled)
     *
     * 浮层是否打开（受控）
     */
    open?: boolean;

    /**
     * Initial open state for uncontrolled use
     *
     * 非受控初始打开态
     */
    defaultOpen?: boolean;

    /**
     * Open-state change callback (button click / outside click / close button / Escape).
     *
     * 开合变化回调（点按钮 / 点外部 / 关闭按钮 / Escape）
     */
    onOpenChange?: (open: boolean) => void;

    /**
     * Popup body; `children` is the button label and the two are separate.
     *
     * 浮层内容（`children` 为按钮内容，二者分离）
     */
    popupContent?: ReactNode;

    /**
     * Label of the popup head, rendered with `head`; `children` remains the button
     * label. The original `PopupButtonWidget` puts `label` on the button and
     * configures the popup independently — this library routes it to the popup head.
     *
     * 浮层头部标签（经 `head` 渲染）；`children` 仍是按钮标签。原版
     * `PopupButtonWidget` 的 `label` 属于按钮、popup 经独立配置传入，本工程将其
     * 路由到浮层头部。
     */
    label?: ReactNode;

    /**
     * Whether the button's label is visually hidden but kept as the accessible name;
     * button-side only — the popup head is shown/hidden via `head` / `hideCloseButton`.
     * In the original `PopupButtonWidget` `label` / `invisibleLabel` belong to the
     * button, with the popup configured independently.
     *
     * 按钮标签视觉隐藏（保留可访问名称）；仅按钮侧——浮层头部的显隐由 `head` /
     * `hideCloseButton` 控制。原版 `PopupButtonWidget` 中 `label` / `invisibleLabel`
     * 属于按钮、popup 配置独立。
     */
    invisibleLabel?: boolean;
  };

// 实现说明：对齐原版OO.ui.PopupButtonWidget，浮层默认autoClose并忽略按钮自身；framed除按钮
// 边框外还切换浮层的带框/无框外观（对齐原版isFramed()）
/**
 * A popup button: clicking the button toggles a Popup anchored to it, with built-in
 * close on clicking outside the button and popup.
 *
 * 弹出按钮：点击按钮开合一个锚定到它的浮层，并内建“点按钮与浮层之外自动关闭”。
 *
 * @see https://bearbin1215.github.io/ooui-react/components/popup-button/index.html
 */
export const PopupButton = forwardRef<HTMLSpanElement, PopupButtonProps>(
  (
    {
      children,
      popupContent,
      open: openProp,
      defaultOpen = false,
      onOpenChange,
      onClick,
      // framed在本组件内消费：它决定弹层的-framed-popup/-frameless-popup类（对齐原版isFramed()）
      framed = true,
      // Popup专属参数经单次解构归组后整体转发（而非逐个手抄），
      // 避免新增Popup prop时遗漏其落入buttonRest被误传给Button
      position,
      align,
      anchor,
      autoFlip,
      head,
      hideCloseButton,
      padded,
      width,
      height,
      footer,
      container,
      hideWhenOutOfView,
      containerPadding,
      label,
      icon,
      invisibleLabel,
      ...buttonRest
    },
    ref,
  ) => {
    const buttonRef = useRef<HTMLSpanElement | null>(null);
    const mergedRef = useMergedRefs(buttonRef, ref);
    // 触发按钮与弹层的互相引用id（对齐原版PopupButtonWidget构造期的getElementId与popup.getElementId）
    const buttonId = useCleanId();
    const popupId = useCleanId();
    const popupProps: Omit<
      PopupProps,
      | "open"
      | "defaultOpen"
      | "onOpenChange"
      | "autoClose"
      | "autoCloseIgnore"
      | "children"
    > = {
      position,
      align,
      anchor,
      autoFlip,
      head,
      hideCloseButton,
      padded,
      width,
      height,
      footer,
      container,
      hideWhenOutOfView,
      containerPadding,
      // label路由到浮层头部（经head渲染，见PopupButtonProps.label）；invisibleLabel仅按钮侧，
      // 不进popupProps——浮层头部的显隐由head/hideCloseButton控制（对齐原版PopupButtonWidget
      // 中label/invisibleLabel属按钮、popup配置独立的归属）
      label,
    };
    const { value: open, commit: setOpen } = useControlledValue<boolean>(
      { value: openProp, defaultValue: defaultOpen },
      onOpenChange,
    );

    return (
      <>
        <Button
          {...buttonRest}
          id={buttonId}
          framed={framed}
          icon={icon}
          invisibleLabel={invisibleLabel}
          className={clsx(buttonRest.className, "oo-ui-popupButtonWidget")}
          // 触发按钮的aria写在锚点上：haspopup=dialog并owns弹层
          // （对齐原版PopupButtonWidget构造期对$button的写入）
          anchorProps={{
            ...buttonRest.anchorProps,
            "aria-haspopup": "dialog",
            "aria-owns": popupId,
          }}
          ref={mergedRef}
          onClick={(ev) => {
            onClick?.(ev);
            setOpen((prev) => !prev);
          }}
        >
          {children}
        </Button>
        <Popup
          {...popupProps}
          id={popupId}
          className={clsx(
            "oo-ui-popupButtonWidget-popup",
            framed
              ? "oo-ui-popupButtonWidget-framed-popup"
              : "oo-ui-popupButtonWidget-frameless-popup",
          )}
          // 弹层为对话框语义并反向关联触发按钮（对齐原版PopupButtonWidget构造期对popup.$element的写入）
          role="dialog"
          aria-describedby={buttonId}
          open={open}
          autoClose
          autoCloseIgnore={buttonRef}
          container={container ?? buttonRef}
          onOpenChange={setOpen}
        >
          {popupContent}
        </Popup>
      </>
    );
  },
);

PopupButton.displayName = "PopupButton";
