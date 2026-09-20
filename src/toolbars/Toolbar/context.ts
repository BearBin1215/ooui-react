import { createContext, useContext } from "react";

/**
 * 工具栏向子树跨层下发的两个通道（对齐原版工具组/工具经`this.toolbar`读取宿主状态）。
 * 独立成文件：Tool与PopupToolGroup是所有工具组共用的底层模块、又消费这两个context，
 * 定义在Toolbar模块内会迫使它们运行时引入整个Toolbar实现（体积敏感）；拆出后共享
 * 模块不回引组件实现（先例同widgets/ButtonGroup/context.ts）。内部实现，不进入公共导出面
 */

/**
 * 工具栏位置上下文：经Toolbar统一下发给工具组（对齐原版工具组经this.toolbar
 * 读取position决定弹出面板展开方向），使用方无需向各工具组显式传position
 */
const ToolbarPositionContext = createContext<"top" | "bottom">("top");

/**
 * 工具栏窄栏状态上下文：portal出工具栏子树的工具组面板无法从Toolbar根继承
 * oo-ui-toolbar-narrow（原版setNarrow同步到$popups容器，面板内工具链接的
 * 窄栏样式均为后代选择器），经此下发到面板的窄栏载体
 */
const ToolbarNarrowContext = createContext(false);

/** Toolbar向工具组子树下发工具栏位置（仅供Toolbar使用） */
export const ToolbarPositionProvider = ToolbarPositionContext.Provider;

/** Toolbar向工具组子树下发窄栏状态（仅供Toolbar使用） */
export const ToolbarNarrowProvider = ToolbarNarrowContext.Provider;

/** 读取所在工具栏的位置（工具组弹出面板的展开方向依据）；不在工具栏内时缺省top */
export function useToolbarPosition(): "top" | "bottom" {
  return useContext(ToolbarPositionContext);
}

/** 读取所在工具栏的窄栏状态（portal面板与工具链接的窄栏样式依据）；不在工具栏内时false */
export function useToolbarNarrow(): boolean {
  return useContext(ToolbarNarrowContext);
}
