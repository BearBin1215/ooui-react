import { forwardRef } from "react";
import clsx from "clsx";
import {
  flaggedElementClasses,
  getWidgetClassName,
  imageVariantClasses,
  toFlagArray,
} from "../../mixins";
import type { IconElement, IconFlag } from "../../Element";
import type { WidgetProps } from "../Widget";
import { IconBase } from "./Base";

/**
 * Props for the icon.
 *
 * 图标属性。
 */
export interface IconProps extends WidgetProps<HTMLSpanElement>, IconElement {
  /**
   * Extra flags, tinting the icon through `oo-ui-flaggedElement-{flag}` and
   * `oo-ui-image-{flag}`.
   *
   * 附加标志，经 `oo-ui-flaggedElement-{flag}` 与 `oo-ui-image-{flag}` 输出
   */
  flags?: IconFlag | IconFlag[];
}

// 实现说明：对齐原版OO.ui.IconWidget，基于IconBase附加Widget类名与flag变体
/**
 * The basic icon component.
 *
 * 基础图标组件。
 *
 * @see https://bearbin1215.github.io/ooui-react/components/icon/index.html
 */
export const Icon = forwardRef<HTMLSpanElement, IconProps>(
  ({ icon, className, disabled, flags = [], ...rest }, ref) => {
    const classes = clsx(
      className,
      getWidgetClassName({ disabled, icon }, "icon"),
      // 单元素组件：根元素即label元素（原版IconWidget混入LabelElement时$label指向根），
      // invisibleLabel的裁剪类按原版落在label（根）上
      "oo-ui-labelElement-invisible",
      flaggedElementClasses(flags),
      // 主题按image-{flag}给图标着色（FlaggedElement之外Icon的专属类）
      imageVariantClasses(toFlagArray(flags)),
    );

    return (
      <IconBase
        {...rest}
        className={classes}
        icon={icon}
        aria-disabled={disabled || undefined}
        ref={ref}
      />
    );
  },
);

Icon.displayName = "Icon";
