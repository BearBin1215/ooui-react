import { forwardRef, memo } from "react";
import clsx from "clsx";
import { clamp } from "es-toolkit";
import { DecoratedOption, type DecoratedOptionProps } from "../DecoratedOption";
import { getOptionIconClasses, optionWidgetClasses } from "../../mixins";
import type { OptionFlaggedElement, OptionProps } from "../Option";

export interface OutlineOptionProps
  extends Omit<DecoratedOptionProps, "value">, OptionProps, OptionFlaggedElement {
  /**
   * Indentation level, 0–2; out-of-range values are clamped (the theme defines
   * three levels only).
   *
   * 缩进层级 0–2，越界钳制（主题仅定义三级）。
   */
  level?: number;

  /**
   * Whether the option is mouse-pressed (driven by the parent Select).
   *
   * 是否处于鼠标按压态（由 Select 系父组件拖拽逻辑驱动）。
   */
  pressed?: boolean;
}

/** 大纲选项，对齐原版OO.ui.OutlineOptionWidget：按level输出缩进层级类，供OutlineSelect渲染。
 * memo化缘由同MenuOption——OutlineSelect在大列表上逐项渲染，状态行变化时其余行浅比较跳过 */
export const OutlineOption = memo(
  forwardRef<HTMLDivElement, OutlineOptionProps>(
    (
      { className, level = 0, disabled, selected, highlighted, pressed, flags, ...rest },
      ref,
    ) => {
      // 对齐原版setLevel：钳制到[0, levels-1]（原版static.levels=3，主题CSS仅定义level-0/1/2）
      const clampedLevel = clamp(level, 0, 2);
      // 原版OutlineOptionWidget沿用OptionWidget基类static（三者皆true）
      const classes = clsx(
        className,
        "oo-ui-outlineOptionWidget",
        `oo-ui-outlineOptionWidget-level-${clampedLevel}`,
        optionWidgetClasses({ selected, highlighted, pressed }),
      );

      return (
        <DecoratedOption
          {...rest}
          disabled={disabled}
          className={classes}
          // 图标着色：选中/按压态progressive + flags变体（对齐wikimediaui主题的选项分支）
          variantClasses={getOptionIconClasses({ selected, pressed, disabled, flags })}
          aria-selected={!!selected}
          ref={ref}
        />
      );
    },
  ),
);

OutlineOption.displayName = "OutlineOption";
