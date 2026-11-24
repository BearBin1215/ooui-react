import { createContext, useContext } from "react";

/**
 * 工具栏向子树跨层下发的通道（对齐原版工具组/工具经`this.toolbar`读取宿主状态）。
 * 独立成文件：Tool与PopupToolGroup是所有工具组共用的底层模块、又消费这些context，
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

/**
 * 可提升工具组（声明了`promoteToBar`的弹层工具组）向Toolbar登记的测量信息。
 * 由组在需要时即时读取（DOM元素在渲染后才存在，故经getter而非快照下发）
 */
export interface ToolbarPromotableGroupInfo {
  /** 组在工具栏 children 中的声明序号（提升优先级依据） */
  order: number;
  /** 可提升工具集（按声明顺序，已按组内工具过滤去重） */
  sets: string[][];
  /** 组内全部工具名（按展示顺序；判断「全部工具被提升」与组内排位用） */
  itemNames: string[];
  /** 组根元素（量组自身宽度） */
  rootElement: HTMLElement | null;
  /** 提升容器根元素（量容器附加宽） */
  promotedElement: HTMLElement | null;
  /** 取提升容器内指定工具的根元素（量工具外宽） */
  getToolElement: (name: string) => HTMLElement | null;
}

/**
 * 工具提升的注册与状态通道（对齐原版工具组与Toolbar之间经实例属性/事件的双向协作）：
 * Toolbar下发当前提升态并在测量期强制覆盖，工具组登记测量信息
 */
export interface ToolbarPromotionContextValue {
  /** 当前提升态：组注册键 → 被提升的工具名（测量期由Toolbar写入全量或空集） */
  promoted: ReadonlyMap<object, ReadonlySet<string>>;
  /** 登记一个可提升工具组，返回注销函数 */
  register: (key: object, getInfo: () => ToolbarPromotableGroupInfo) => () => void;
  /** 请求工具栏重新测量提升（工具集或提升配置变化时调用） */
  requestUpdate: () => void;
}

const ToolbarPromotionContext = createContext<ToolbarPromotionContextValue | null>(null);

/**
 * 工具组在工具栏 children 中的声明序号：提升优先级按该序号排列（对齐原版按工具栏
 * items 的声明顺序处理；`align="after"` 的组在 DOM 中排到右侧容器，但优先级不变）
 */
const ToolbarGroupOrderContext = createContext(0);

/** 空工具名集合（无提升或不在工具栏内时的稳定缺省值） */
const EMPTY_TOOL_NAMES: ReadonlySet<string> = new Set();

/** Toolbar向工具组子树下发工具栏位置（仅供Toolbar使用） */
export const ToolbarPositionProvider = ToolbarPositionContext.Provider;

/** Toolbar向工具组子树下发窄栏状态（仅供Toolbar使用） */
export const ToolbarNarrowProvider = ToolbarNarrowContext.Provider;

/** Toolbar向工具组子树下发工具提升的注册与状态通道（仅供Toolbar使用） */
export const ToolbarPromotionProvider = ToolbarPromotionContext.Provider;

/** Toolbar向工具组子树下发其在 children 中的声明序号（仅供Toolbar使用） */
export const ToolbarGroupOrderProvider = ToolbarGroupOrderContext.Provider;

/** 读取工具组在工具栏中的声明序号（提升优先级依据）；不在工具栏内时为0 */
export function useToolbarGroupOrder(): number {
  return useContext(ToolbarGroupOrderContext);
}

/** 读取所在工具栏的位置（工具组弹出面板的展开方向依据）；不在工具栏内时缺省top */
export function useToolbarPosition(): "top" | "bottom" {
  return useContext(ToolbarPositionContext);
}

/** 读取所在工具栏的窄栏状态（portal面板与工具链接的窄栏样式依据）；不在工具栏内时false */
export function useToolbarNarrow(): boolean {
  return useContext(ToolbarNarrowContext);
}

/** 读取工具提升通道（无工具栏时为null，调用方按「不提升」处理） */
export function useToolbarPromotion(): ToolbarPromotionContextValue | null {
  return useContext(ToolbarPromotionContext);
}

/** 读取指定组当前被提升的工具名（无工具栏或未被提升时为空集） */
export function usePromotedToolNames(key: object): ReadonlySet<string> {
  return useContext(ToolbarPromotionContext)?.promoted.get(key) ?? EMPTY_TOOL_NAMES;
}
