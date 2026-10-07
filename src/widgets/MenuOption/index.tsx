import { forwardRef, memo } from "react";
import clsx from "clsx";
import { Icon } from "../Icon";
import { DecoratedOption, type DecoratedOptionProps } from "../DecoratedOption";
import { getOptionIconClasses, optionWidgetClasses } from "../../mixins";
import type { OptionFlaggedElement, OptionProps } from "../Option";

export type MenuOptionProps = DecoratedOptionProps &
  OptionProps &
  OptionFlaggedElement & {
    /**
     * Whether the option is mouse-pressed (driven by the parent Select).
     *
     * 是否处于鼠标按压态（由 Select 系父组件拖拽逻辑驱动）。
     */
    pressed?: boolean;
  };

/**
 * 菜单选项：下拉类菜单 `options` 项的渲染形态（内部中间件，不进公共导出面）。
 * memo化：Select系在大列表上逐项渲染本组件，悬停高亮/键盘导航/过滤键入每次仅变1-2行的
 * 状态，浅比较后其余行跳过重渲染（父级传入的id/选中态均为原始值、ref回调经useOptionRegistry
 * 按值缓存，浅比较可命中）
 */
export const MenuOption = memo(
  forwardRef<HTMLDivElement, MenuOptionProps>(
    ({ className, disabled, selected, highlighted, pressed, flags, ...rest }, ref) => {
      // 原版MenuOptionWidget沿用OptionWidget基类static（selectable/highlightable/pressable皆true）
      const classes = clsx(
        className,
        "oo-ui-menuOptionWidget",
        optionWidgetClasses({ selected, highlighted, pressed }),
      );

      return (
        <DecoratedOption
          {...rest}
          disabled={disabled}
          className={classes}
          // 原版MenuOptionWidget构造期prepend的勾选图标（apex主题选中时显示并隐藏普通图标；
          // wikimediaui主题恒display:none），落点为ButtonSlots的leading（在图标之前）
          leading={<Icon icon="check" className="oo-ui-menuOptionWidget-checkIcon" />}
          // 图标着色：选中/按压态progressive + flags变体（对齐wikimediaui主题的选项分支）
          variantClasses={getOptionIconClasses({ selected, pressed, disabled, flags })}
          aria-selected={!!selected}
          ref={ref}
        />
      );
    },
  ),
);

MenuOption.displayName = "MenuOption";
