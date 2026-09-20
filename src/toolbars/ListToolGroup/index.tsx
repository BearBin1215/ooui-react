import { forwardRef } from "react";
import clsx from "clsx";
import { PopupToolGroupBase, type PopupToolGroupBaseProps } from "../PopupToolGroup";
import { useControlledValue } from "../../hooks";
import { useMessage } from "../../config";
import type { ToolProps } from "../Tool";

export interface ListToolGroupProps extends Omit<
  PopupToolGroupBaseProps,
  "tools" | "keepOpenToolNames"
> {
  /**
   * The tools (overrides the base `tools` declaration).
   *
   * 工具集（覆盖基类的 `tools` 声明）。
   */
  tools: ToolProps[];

  /**
   * Tool names that may be collapsed (collapsed tools are visible only when the
   * panel is expanded; a More / Fewer toggle appears at the bottom).
   *
   * 允许折叠的工具符号名（折叠工具仅展开后可见，面板尾部出现 More / Fewer 切换项）。
   */
  allowCollapse?: string[];

  /**
   * Tool names that are always visible (all others become collapsible).
   *
   * 强制展开的工具符号名（未列出的工具均可折叠）。
   */
  forceExpand?: string[];

  /**
   * Whether the collapsible tools are expanded (controlled).
   *
   * 展开态（受控，传入即受控模式，外部可重置）。
   */
  expanded?: boolean;

  /**
   * Initial expanded state for uncontrolled use (effective only when collapsible
   * tools exist).
   *
   * 非受控初始展开态（存在可折叠工具时生效）。
   */
  defaultExpanded?: boolean;
}

/** 面板尾部展开/折叠切换项的符号名 */
const EXPAND_COLLAPSE_TOOL_NAME = "more-fewer";

/**
 * A list tool group (OO.ui.ListToolGroup): tools shown as a vertical text list in a
 * dropdown panel, with an optional More / Fewer toggle at the bottom controlling
 * collapsible tools (choosing the toggle keeps the panel open).
 *
 * 列表工具组（对齐原版 OO.ui.ListToolGroup）：工具以标签文本纵向列表收进下拉
 * 面板，尾部可出现 More / Fewer 切换项控制可折叠工具的显隐（选中该项不收起面板）。
 *
 * @see https://bearbin1215.github.io/ooui-react/components/toolbar/index.html
 */
export const ListToolGroup = forwardRef<HTMLDivElement, ListToolGroupProps>(
  (
    {
      tools,
      allowCollapse,
      forceExpand,
      expanded: expandedProp,
      defaultExpanded = false,
      toolsClassName,
      className,
      ...rest
    },
    ref,
  ) => {
    const { value: expanded, commit: commitExpanded } = useControlledValue<boolean>({
      value: expandedProp,
      defaultValue: defaultExpanded,
    });

    // 可折叠工具集合：优先allowCollapse；给出forceExpand时其余均可折叠。
    // 名单与实际tools取交集（对齐原版populate的collapsibleTools过滤，无效名不产生More/Fewer项）
    const toolNames = tools.map((tool) => tool.name);
    let requestedCollapsible: string[] = [];
    if (allowCollapse !== undefined) {
      requestedCollapsible = allowCollapse;
    } else if (forceExpand !== undefined) {
      requestedCollapsible = toolNames.filter((name) => !forceExpand.includes(name));
    }
    const collapsibleNames = requestedCollapsible.filter((name) =>
      toolNames.includes(name),
    );

    const visibleTools = tools.filter(
      (tool) => !collapsibleNames.includes(tool.name) || expanded,
    );

    // 缺省标题经useMessage读取（对齐原版ooui-toolgroup-expand/collapse消息）
    const expandLabel = useMessage("ooui-toolgroup-expand");
    const collapseLabel = useMessage("ooui-toolgroup-collapse");
    const extraTools: ToolProps[] =
      collapsibleNames.length > 0
        ? [
            {
              name: EXPAND_COLLAPSE_TOOL_NAME,
              label: expanded ? collapseLabel : expandLabel,
              icon: expanded ? "collapse" : "expand",
              onSelect: () => commitExpanded((prev) => !prev),
            },
          ]
        : [];

    return (
      <PopupToolGroupBase
        {...rest}
        ref={ref}
        tools={[...visibleTools, ...extraTools]}
        keepOpenToolNames={[EXPAND_COLLAPSE_TOOL_NAME]}
        toolsClassName={clsx("oo-ui-listToolGroup-tools", toolsClassName)}
        className={clsx(className, "oo-ui-listToolGroup")}
      />
    );
  },
);

ListToolGroup.displayName = "ListToolGroup";
