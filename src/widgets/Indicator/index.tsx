import { forwardRef } from "react";
import clsx from "clsx";
import { getWidgetClassName } from "../../mixins";
import type { IndicatorElement } from "../../Element";
import type { WidgetProps } from "../Widget";
import { IndicatorBase } from "./Base";

/**
 * Props of the indicator; it has no `children` — the glyph is purely decorative.
 *
 * 指示器属性：无 `children`，指示器本身是无文本的装饰性图形。
 */
export type IndicatorProps = Omit<WidgetProps<HTMLSpanElement>, "children"> &
  IndicatorElement;

// 实现说明：对齐原版OO.ui.IndicatorWidget，基于IndicatorBase附加Widget类名
/**
 * An indicator component, usually rendered inside other components to convey a
 * specific meaning.
 *
 * 指示器组件，通常在其他组件内渲染表示特定含义。
 *
 * @see https://bearbin1215.github.io/ooui-react/components/indicator/index.html
 */
export const Indicator = forwardRef<HTMLSpanElement, IndicatorProps>(
  ({ indicator, className, disabled, ...rest }, ref) => {
    const classes = clsx(
      className,
      getWidgetClassName({ disabled, indicator }, "indicator"),
      // 单元素组件：根元素即label元素（原版IndicatorWidget混入LabelElement时$label指向根），
      // invisibleLabel的裁剪类按原版落在label（根）上
      "oo-ui-labelElement-invisible",
    );

    return (
      <IndicatorBase
        {...rest}
        className={classes}
        indicator={indicator}
        aria-disabled={disabled || undefined}
        ref={ref}
      />
    );
  },
);

Indicator.displayName = "Indicator";
