import { forwardRef, type ReactNode } from "react";
import clsx from "clsx";
import { getWidgetClassName } from "../../mixins";
import type { WidgetProps } from "../Widget";
import type { IconElement, IndicatorElement } from "../../Element";
import { ButtonSlots } from "../Button/slots";

export type DecoratedOptionProps = WidgetProps<HTMLDivElement> &
  IconElement &
  IndicatorElement & {
    /**
     * Label / value carried with the option object; swallowed so they never land
     * as DOM attributes (the render uses `children` / the parent's value).
     *
     * 随选项对象透入的标签 / 值，组件吞掉以避免落成 DOM 属性（渲染用 `children`）。
     */
    label?: ReactNode;
    value?: string | number;

    /**
     * Internal channel: icon / indicator variant classes (`oo-ui-image-*`),
     * computed by each option shape and passed through to ButtonSlots.
     *
     * 内部通道：图标 / 指示器变体类（`oo-ui-image-*`），由各选项形态算出后透传。
     */
    variantClasses?: string;

    /**
     * Internal channel: content before the icon (MenuOption's check icon).
     *
     * 内部通道：图标之前的附加内容（MenuOption 的勾选图标）。
     */
    leading?: ReactNode;
  };

/** 带图标/指示器槽位的选项基类渲染（对齐原版OO.ui.DecoratedOptionWidget）：
 * ButtonSlots按图标→标签→指示器的固定顺序排布，变体类由调用方算出后透传。
 * MenuOption/OutlineOption等选项形态内部复用，不进公共导出面 */
export const DecoratedOption = forwardRef<HTMLDivElement, DecoratedOptionProps>(
  (
    {
      children,
      className,
      disabled,
      icon,
      indicator,
      variantClasses,
      leading,
      label: _label,
      value: _value,
      ...rest
    },
    ref,
  ) => {
    const classes = clsx(
      className,
      getWidgetClassName(
        {
          disabled,
          label: children,
          icon,
          indicator,
        },
        "option",
        "decoratedOption",
      ),
    );

    return (
      <div
        className={classes}
        aria-disabled={disabled || undefined}
        tabIndex={-1}
        role="option"
        {...rest}
        ref={ref}
      >
        <ButtonSlots
          leading={leading}
          icon={icon}
          variantClasses={variantClasses}
          label={children}
          indicator={indicator}
        />
      </div>
    );
  },
);

DecoratedOption.displayName = "DecoratedOption";
