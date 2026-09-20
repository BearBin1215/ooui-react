import { forwardRef } from "react";
import clsx from "clsx";
import { getWidgetClassName } from "../../mixins";
import {
  ToolView,
  getToolHoverHandlers,
  isGroupAutoDisabled,
  useToolGroupPressed,
  type ToolGroupBaseProps,
} from "../Tool";

/**
 * Props of the bar tool group (same as `ToolGroupBaseProps`).
 *
 * 平铺工具组参数（与 `ToolGroupBaseProps` 一致）。
 */
export type BarToolGroupProps = ToolGroupBaseProps;

/**
 * A flat tool group (OO.ui.BarToolGroup): tools shown as icon buttons in a row,
 * with title and accelerator shown as a tooltip.
 *
 * 平铺工具组（对齐原版 OO.ui.BarToolGroup）：工具以图标按钮横向平铺，
 * 标题与快捷键文案以 tooltip 展示。
 *
 * @see https://bearbin1215.github.io/ooui-react/components/toolbar/index.html
 */
export const BarToolGroup = forwardRef<HTMLDivElement, BarToolGroupProps>(
  (
    {
      tools,
      className,
      disabled,
      // align由Toolbar读取后决定挂载位置，本体不渲染，解构掉避免落成DOM属性
      align: _align,
      ...rest
    },
    ref,
  ) => {
    const groupDisabled = isGroupAutoDisabled(tools, disabled);
    const { pressedName, onMouseKeyDown, onToolKeyDown, onToolHoverChange } =
      useToolGroupPressed(tools, groupDisabled);

    // 空组加oo-ui-toolGroup-empty整体隐藏（对齐原版populate末尾的toggleClass）
    const classes = clsx(
      className,
      getWidgetClassName({ disabled: groupDisabled }),
      "oo-ui-toolGroup",
      "oo-ui-barToolGroup",
      tools.length === 0 && "oo-ui-toolGroup-empty",
    );

    return (
      <div
        {...rest}
        className={classes}
        aria-disabled={groupDisabled || undefined}
        ref={ref}
      >
        <div
          className={clsx(
            "oo-ui-toolGroup-tools",
            "oo-ui-barToolGroup-tools",
            groupDisabled
              ? "oo-ui-toolGroup-disabled-tools"
              : "oo-ui-toolGroup-enabled-tools",
          )}
          onMouseDown={onMouseKeyDown}
          onKeyDown={onToolKeyDown}
          {...getToolHoverHandlers(onToolHoverChange)}
        >
          {tools.map((tool) => (
            <ToolView
              key={tool.name}
              tool={tool}
              pressed={pressedName === tool.name}
              tooltip
              accelTooltip
              groupDisabled={groupDisabled}
            />
          ))}
        </div>
      </div>
    );
  },
);

BarToolGroup.displayName = "BarToolGroup";
