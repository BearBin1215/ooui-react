import { forwardRef, type ReactNode } from "react";
import clsx from "clsx";
import { IconBase } from "../../widgets/Icon/Base";
import { IndicatorBase } from "../../widgets/Indicator/Base";
import type { Indicators } from "../../Element";
import { LabelBase } from "../../widgets/Label/Base";
import { getWidgetClassName } from "../../mixins";
import type { WidgetProps } from "../../widgets/Widget";

export interface LabelToolGroupProps extends Omit<
  WidgetProps<HTMLDivElement>,
  "children"
> {
  /**
   * Handle label.
   *
   * 把手标签。
   */
  label?: ReactNode;

  /**
   * Handle icon.
   *
   * 把手图标。
   */
  icon?: string;

  /**
   * Handle indicator.
   *
   * 把手指示器。
   */
  indicator?: Indicators;

  /**
   * Handle tooltip, rendered on the root element.
   *
   * 把手 tooltip，渲染在根元素上。
   */
  title?: string;

  /**
   * Group alignment: `before` (default) keeps the group on the left, `after`
   * moves it to the right-side actions container.
   *
   * 工具组位置：`before` 排在工具栏左侧（缺省），`after` 排到右侧的动作区。
   *
   * @default 'before'
   */
  align?: "before" | "after";
}

/**
 * A label tool group (OO.ui.LabelToolGroup): shows a static text label (optionally
 * with an icon and indicator) inside the toolbar. Non-interactive; it cannot hold tools.
 *
 * 标签工具组（对齐原版 OO.ui.LabelToolGroup）：在工具栏内展示一段静态文本
 * （可带图标与指示器），不可交互、也不能容纳工具。
 *
 * @see https://bearbin1215.github.io/ooui-react/components/toolbar/index.html
 */
export const LabelToolGroup = forwardRef<HTMLDivElement, LabelToolGroupProps>(
  (
    {
      className,
      disabled,
      label,
      icon,
      indicator,
      title,
      // align由Toolbar读取后决定挂载位置，本体不渲染，解构掉避免落成DOM属性
      align: _align,
      ...rest
    },
    ref,
  ) => {
    const classes = clsx(
      className,
      getWidgetClassName({ disabled, icon, indicator, label }),
      "oo-ui-toolGroup",
      "oo-ui-labelToolGroup",
    );

    return (
      <div
        {...rest}
        className={classes}
        title={title}
        aria-disabled={disabled || undefined}
        ref={ref}
      >
        <span className="oo-ui-toolGroup-handle oo-ui-labelToolGroup-handle">
          <IconBase icon={icon} />
          <LabelBase>{label}</LabelBase>
          <IndicatorBase indicator={indicator} />
        </span>
      </div>
    );
  },
);

LabelToolGroup.displayName = "LabelToolGroup";
