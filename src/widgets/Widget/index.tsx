import { forwardRef } from "react";
import clsx from "clsx";
import { getWidgetClassName } from "../../mixins";
import type { ElementProps } from "../../Element";

/**
 * Base props of every widget (aligns with the abstract OO.ui.Widget; types
 * only). Adds `disabled` on top of {@link ElementProps}; the concrete render is
 * reused internally by each widget by shape.
 *
 * 控件基类参数（对齐原版抽象基类 Widget，仅类型）。在 {@link ElementProps}
 * 之上补充 `disabled`；具体渲染由各控件按形态内部复用。
 */
export interface WidgetProps<T = HTMLDivElement> extends Omit<
  ElementProps<T>,
  "onChange"
> {
  /**
   * Whether the component is disabled
   *
   * 是否禁用
   */
  disabled?: boolean;
}

/**
 * Widget基类渲染（对齐原版OO.ui.Widget）：输出widget类链（含启用/禁用）与aria-disabled。
 * 组件内部按形态复用，不进公共导出面
 */
export const Widget = forwardRef<HTMLDivElement, WidgetProps<HTMLDivElement>>(
  ({ children, className, disabled, ...rest }, ref) => {
    const classes = clsx(className, getWidgetClassName({ disabled }));

    return (
      <div {...rest} className={classes} aria-disabled={disabled || undefined} ref={ref}>
        {children}
      </div>
    );
  },
);

Widget.displayName = "Widget";
