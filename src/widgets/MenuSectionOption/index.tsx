import { forwardRef } from "react";
import clsx from "clsx";
import { DecoratedOption, type DecoratedOptionProps } from "../DecoratedOption";
import { getOptionIconClasses } from "../../mixins";
import type { OptionFlaggedElement } from "../Option";

/**
 * Props of a group heading — an `options` entry without `value`.
 *
 * 分组标题的参数，即不带 `value` 的选项项。
 */
export type MenuSectionOptionProps = DecoratedOptionProps & OptionFlaggedElement;

/**
 * 分组标题：不可选的菜单项，渲染不带 `value` 的 options 项（内部中间件，不进公共导出面）。
 */
export const MenuSectionOption = forwardRef<HTMLDivElement, MenuSectionOptionProps>(
  ({ className, disabled, flags, ...rest }, ref) => {
    const classes = clsx(className, "oo-ui-menuSectionOptionWidget");

    return (
      <DecoratedOption
        {...rest}
        disabled={disabled}
        className={classes}
        // 分组标题不参与选中/按压着色（原版主题的progressive状态分支只覆盖MenuOption/
        // OutlineOption），仅按flags输出图标变体
        variantClasses={getOptionIconClasses({ disabled, flags })}
        role={undefined}
        ref={ref}
      />
    );
  },
);

MenuSectionOption.displayName = "MenuSectionOption";
