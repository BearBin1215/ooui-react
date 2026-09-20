import { forwardRef, Fragment } from "react";
import clsx from "clsx";
import { PopupToolGroupBase, type PopupToolGroupBaseProps } from "../PopupToolGroup";

/**
 * Props of the menu tool group (same as `PopupToolGroupBaseProps`).
 *
 * 菜单工具组参数（与 `PopupToolGroupBaseProps` 一致）。
 */
export type MenuToolGroupProps = PopupToolGroupBaseProps;

/**
 * A menu tool group (OO.ui.MenuToolGroup): tools shown as a horizontal text list in
 * a dropdown panel; the handle label is composed from the active tool's visible
 * text, falling back to `label` when none is active.
 *
 * 菜单工具组（对齐原版 OO.ui.MenuToolGroup）：工具以标签横向排布收进下拉面板，
 * 组把手标签按激活工具的可见文本合成，无激活工具时回落 `label`。
 *
 * @see https://bearbin1215.github.io/ooui-react/components/toolbar/index.html
 */
export const MenuToolGroup = forwardRef<HTMLDivElement, MenuToolGroupProps>(
  ({ tools, label, toolsClassName, className, ...rest }, ref) => {
    // 原版onUpdateState由toolbar的updateState事件驱动，把激活工具的getTitle()以', '拼接；
    // 本工程可见文本已收为label（ReactNode），故以', '分隔符间插而非字符串join
    const activeLabels = tools.filter((tool) => tool.active).map((tool) => tool.label);
    const groupLabel =
      activeLabels.length > 0
        ? activeLabels.map((child, index) => (
            <Fragment key={index}>
              {index > 0 && ", "}
              {child}
            </Fragment>
          ))
        : label;

    return (
      <PopupToolGroupBase
        {...rest}
        ref={ref}
        tools={tools}
        label={groupLabel}
        toolsClassName={clsx("oo-ui-menuToolGroup-tools", toolsClassName)}
        className={clsx(className, "oo-ui-menuToolGroup")}
      />
    );
  },
);

MenuToolGroup.displayName = "MenuToolGroup";
