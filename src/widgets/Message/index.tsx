import { forwardRef, type ReactNode } from "react";
import clsx from "clsx";
import { IconBase } from "../Icon/Base";
import { LabelBase } from "../Label/Base";
import { Button } from "../Button";
import {
  flaggedElementClasses,
  getWidgetClassName,
  imageVariantClasses,
  resolveTitle,
} from "../../mixins";
import { useMessage } from "../../config";
import type { WidgetProps } from "../Widget";
import type { IconElement } from "../../Element";

/**
 * Message type; an invalid value falls back to `notice`.
 *
 * 消息类型；非法值回退为 `notice`。
 */
export type MessageType = "notice" | "error" | "warning" | "success";

/** 类型→默认图标映射 */
const TYPE_ICONS: Record<MessageType, string> = {
  notice: "infoFilled",
  error: "error",
  warning: "alert",
  success: "success",
};

export interface MessageProps extends WidgetProps<HTMLDivElement>, IconElement {
  /**
   * Message body.
   *
   * 消息正文。
   */
  children?: ReactNode;

  /**
   * Whether the body is visually hidden (kept as the accessible name).
   *
   * 正文是否视觉隐藏（保留可访问名称）。
   */
  invisibleLabel?: boolean;

  /**
   * Message type; decides the default icon and color (error red, warning
   * orange, etc.).
   *
   * 消息类型，决定默认图标与配色（error 红色警示、warning 橙色等）。
   */
  type?: MessageType;

  /**
   * Render inline; when `false`, a bordered block-level message.
   *
   * 内联展示（为 `false` 时渲染为带边框的块级消息）。
   */
  inline?: boolean;

  /**
   * Whether to show the close button (not rendered for inline messages).
   *
   * 是否展示关闭按钮（inline 消息不渲染关闭按钮）。
   */
  showClose?: boolean;

  /**
   * Close-button click callback. The component never hides itself — unmount or
   * hide the message in the callback, otherwise it cannot be dismissed.
   *
   * 点击关闭按钮的回调。**组件不自行隐藏，必须在回调里卸载或隐藏消息**，
   * 否则点击后消息关不掉。
   */
  onClose?: () => void;
}

/**
 * A message banner (OO.ui.MessageWidget): `error` uses `role="alert"`, other
 * types use `aria-live="polite"`.
 *
 * 消息提示条（对齐原版 OO.ui.MessageWidget）：`error` 类型用 `role="alert"`，
 * 其余类型用 `aria-live="polite"`。
 *
 * @see https://bearbin1215.github.io/ooui-react/components/message/index.html
 */
export const Message = forwardRef<HTMLDivElement, MessageProps>(
  (
    {
      children,
      className,
      disabled,
      icon,
      invisibleLabel,
      type = "notice",
      inline = false,
      showClose = false,
      onClose,
      title,
      ...rest
    },
    ref,
  ) => {
    const messageType: MessageType = TYPE_ICONS[type] ? type : "notice";
    const displayIcon = icon ?? TYPE_ICONS[messageType];
    const showCloseButton = showClose && !inline;
    // 关闭按钮的无障碍标签（对齐原版MessageWidget构造期读取的ooui-popup-widget-close-button-aria-label）
    const closeAriaLabel = useMessage("ooui-popup-widget-close-button-aria-label");

    const classes = clsx(
      className,
      // invisibleLabel的裁剪类只落在label元素上（下方LabelBase）；根类按原版setInvisibleLabel
      // 的"视同无标签"语义由labelElementClasses抑制
      getWidgetClassName(
        { disabled, icon: displayIcon, label: children, invisibleLabel },
        "message",
      ),
      !inline && "oo-ui-messageWidget-block",
      showCloseButton && "oo-ui-messageWidget-showClose",
      flaggedElementClasses(messageType),
    );

    return (
      <div
        {...rest}
        className={classes}
        // title解析走resolveTitle（原版MessageWidget混入TitledElement，$titled即根元素）
        title={resolveTitle({ title, label: children, invisibleLabel })}
        aria-disabled={disabled || undefined}
        // 对齐原版setType：error用role=alert打断式播报，其余类型polite播报
        role={messageType === "error" ? "alert" : undefined}
        aria-live={messageType === "error" ? undefined : "polite"}
        ref={ref}
      >
        {/* 图标变体类跟随消息类型（对齐原版oo-ui-image-{type}）；notice无对应变体，经变体表过滤后不出类 */}
        <IconBase icon={displayIcon} className={imageVariantClasses([messageType])} />
        <LabelBase invisible={invisibleLabel}>{children}</LabelBase>
        {showCloseButton && (
          <Button
            className="oo-ui-messageWidget-close"
            framed={false}
            icon="close"
            invisibleLabel
            onClick={onClose}
          >
            {closeAriaLabel}
          </Button>
        )}
      </div>
    );
  },
);

Message.displayName = "Message";
