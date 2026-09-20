import { createContext, useContext, useMemo, type PropsWithChildren } from "react";
import { formatMessage, msg, type MessageKey, type MessageValue } from "./i18n";
import { VIEWPORT_SPACING } from "./utils";
import { ImperativeDialogHost } from "./dialogs/imperative";

/**
 * Viewport edge spacing in pixels, counted when a floating panel hugs or is
 * clamped against the viewport edge.
 *
 * 视口四周留白（px），浮层贴边 / 钳高时计入。
 */
export interface ViewportSpacing {
  /**
   * Top spacing.
   *
   * 顶部留白。
   */
  top: number;
  /**
   * Right spacing.
   *
   * 右侧留白。
   */
  right: number;
  /**
   * Bottom spacing.
   *
   * 底部留白。
   */
  bottom: number;
  /**
   * Left spacing.
   *
   * 左侧留白。
   */
  left: number;
}

/**
 * Input for `viewportSpacing`: a single number (all sides) or a per-side partial
 * override.
 *
 * `viewportSpacing` 配置入参：数值（四边同值）或逐边覆盖对象。
 */
export type ViewportSpacingInput = number | Partial<ViewportSpacing>;

/**
 * Text direction.
 *
 * 文本方向。
 */
export type Direction = "ltr" | "rtl";

/** 将viewportSpacing配置归一化为四边数值：缺省边取VIEWPORT_SPACING（缺省0，对齐原版） */
export function normalizeViewportSpacing(
  input: ViewportSpacingInput | undefined,
): ViewportSpacing {
  if (typeof input === "number") {
    return { top: input, right: input, bottom: input, left: input };
  }
  return {
    top: input?.top ?? VIEWPORT_SPACING,
    right: input?.right ?? VIEWPORT_SPACING,
    bottom: input?.bottom ?? VIEWPORT_SPACING,
    left: input?.left ?? VIEWPORT_SPACING,
  };
}

/**
 * Global configuration (the React counterpart of the original's overridable
 * OO.ui globals: the message table, isMobile, viewport spacing, portal target,
 * element direction).
 *
 * 全局配置。对齐原版 OOUI 的模块级全局（消息表、isMobile / getViewportSpacing /
 * portal 容器等可覆写全局、Element 的 dir 配置）在 React 语境下的对应物。
 */
export interface OOUIConfig {
  /**
   * Message overrides, on top of the English defaults. Read when declarative
   * components render, so switching updates reactively. Pass a stable reference
   * (e.g. a module-level locale import) — an inline object literal changes the
   * Provider value every render and re-renders the whole subtree.
   *
   * 消息覆盖表，覆盖英文默认。声明式组件渲染时读取，切换即响应式更新。
   * 应传入稳定引用（如模块级的 locale 导入）——内联对象字面量会使 Provider
   * value 每渲染变化并重渲染整棵子树。
   */
  messages?: Partial<Record<MessageKey, MessageValue>>;

  /**
   * Portal container for floating panels (Popup / MenuSelect / PopupToolGroup),
   * receiving the anchor element. **When unset**, a panel inside a dialog portals
   * to that dialog's window-manager root (staying in the dialog's subtree); others
   * fall back to `document.body`. When set, it always wins and even in-dialog
   * panels use it — they then no longer share the dialog's content isolation and
   * z-stacking, which the container must handle itself. The container should not
   * establish a new positioning context (panels are absolutely positioned by page
   * coordinates).
   *
   * 浮层 portal 容器（Popup / MenuSelect / PopupToolGroup 面板），入参为浮层的
   * 锚点元素。**未配置时**弹窗子树内的浮层 portal 到该弹窗的管理器根，其余
   * 回落 `document.body`；配置后恒优先。容器不应建立新的定位上下文（浮层按
   * 页面坐标绝对定位）。
   */
  getPortalContainer?: (trigger: HTMLElement) => HTMLElement;

  /**
   * Mobile-mode toggle (maps the original `OO.ui.isMobile()`, a stub that hosts
   * override). Defaults to `false`; the host can decide via matchMedia and pass
   * the result.
   *
   * 移动端形态开关，对应原版 `OO.ui.isMobile()`（原版为恒 false 的桩，由宿主
   * 环境覆写）。缺省 false；宿主可接 matchMedia 等自行判定后传入。
   */
  isMobile?: boolean;

  /**
   * Text-direction override for floating panels. When unset, each panel resolves
   * direction from its anchor element (aligning with the original's
   * `getDir`); because the anchor stays inside the content area, RTL sites get the
   * right direction automatically without configuring this.
   *
   * 浮层文本方向，覆盖锚点元素的继承方向（缺省按锚点 computed direction
   * 解析）。浮层 portal 出控件子树后不随内容区继承方向，但锚点仍在内容区内，
   * 故 RTL 站点经自动解析即可得到正确方向。
   */
  dir?: Direction;

  /**
   * Viewport edge spacing, counted when a panel hugs or is clamped against the
   * edge (a number or per-side override). Defaults to 0 on each side; a site can
   * set it to clear fixed headers and similar floating elements.
   *
   * 视口留白，浮层贴边 / 钳高时计入（数值或逐边覆盖）。缺省各边 0，
   * 站点可显式配置以避开固定头栏一类悬浮元素。
   */
  viewportSpacing?: ViewportSpacingInput;

  /**
   * Resolver for access-key display text (e.g. producing a localized
   * "Alt+Shift+k"). When absent, the title falls back to appending the raw key
   * (`title [k]`); an empty-string result adds no suffix; an `undefined` result is
   * treated as no match and also falls back to the raw key.
   *
   * 快捷键的显示文案解析（如产出本地化的“Alt+Shift+k”）。未提供时 title
   * 回落为附原键值（`title [k]`）；返回空串不加键位后缀；返回 `undefined`
   * 视为无结果，同样回落原键值。
   */
  getAccessKeyLabel?: (accessKey: string) => string | undefined;
}

const OOUIConfigContext = createContext<OOUIConfig>({});

/**
 * OOUIProvider的嵌套深度（根为0），供命令式弹窗的in-tree宿主判定选主机优先级：
 * 命令式调用（confirm/alert/prompt）无位置信息，恒由**最外层**（最小深度）宿主渲染，
 * 从而映射到应用根部的配置（见dialogs/imperative.tsx的primaryToken）
 */
const ProviderDepthContext = createContext(0);

/**
 * Global configuration provider. Without it, components use the English defaults
 * and a `document.body` portal container (each config item's default). Also hosts
 * the imperative dialogs (`confirm` / `alert` / `prompt`), so a dialog called from
 * anywhere inherits this provider's full context.
 *
 * 全局配置 Provider。未包裹时组件使用英文默认文案与 `document.body` 浮层
 * 容器（各配置项的缺省值）。另承载命令式弹窗（`confirm` / `alert` / `prompt`）
 * 的宿主，任意位置调用的弹窗因此继承本 Provider 的全部 context。
 */
export function OOUIProvider({
  children,
  messages,
  getPortalContainer,
  isMobile,
  dir,
  viewportSpacing,
  getAccessKeyLabel,
}: PropsWithChildren<OOUIConfig>) {
  const parent = useContext(OOUIConfigContext);
  // 嵌套Provider时子级同名字段覆盖父级；value经memo稳定引用避免子树无谓重渲染
  const value = useMemo<OOUIConfig>(
    () => ({
      messages: { ...parent.messages, ...messages },
      getPortalContainer: getPortalContainer ?? parent.getPortalContainer,
      isMobile: isMobile ?? parent.isMobile,
      dir: dir ?? parent.dir,
      viewportSpacing: viewportSpacing ?? parent.viewportSpacing,
      getAccessKeyLabel: getAccessKeyLabel ?? parent.getAccessKeyLabel,
    }),
    [
      parent,
      messages,
      getPortalContainer,
      isMobile,
      dir,
      viewportSpacing,
      getAccessKeyLabel,
    ],
  );

  const depth = useContext(ProviderDepthContext);

  return (
    <OOUIConfigContext.Provider value={value}>
      <ProviderDepthContext.Provider value={depth + 1}>
        {children}
        {/* 命令式弹窗的in-tree宿主（机制见dialogs/imperative.tsx）：置于children之后，
            不影响既有布局 */}
        <ImperativeDialogHost depth={depth} />
      </ProviderDepthContext.Provider>
    </OOUIConfigContext.Provider>
  );
}

OOUIProvider.displayName = "OOUIProvider";

/**
 * Reads the global configuration; an empty object when no provider wraps the tree.
 *
 * 读取全局配置；未包 Provider 时为空对象。
 */
export function useOOUIConfig(): OOUIConfig {
  return useContext(OOUIConfigContext);
}

/**
 * Reads a localized message (Provider override > module-level registerMessages >
 * English default). Component default text is read through this; use {@link msg}
 * only for imperative / non-React contexts.
 *
 * 读取一条消息（Provider 覆盖 > 模块级 registerMessages > 英文默认）。
 * 组件默认文案统一经此读取；非 React 场景用 {@link msg}。
 */
export function useMessage(key: MessageKey, ...params: unknown[]): string {
  const { messages } = useOOUIConfig();
  const override = messages?.[key];
  if (override !== undefined) {
    return formatMessage(override, params);
  }
  return msg(key, ...params);
}

/**
 * Reads the mobile-mode flag (maps the original `OO.ui.isMobile()`); false when unset.
 *
 * 读取移动端形态开关（对应原版 `OO.ui.isMobile()`），未配置时 false。
 */
export function useIsMobile(): boolean {
  return useOOUIConfig().isMobile ?? false;
}

/**
 * Reads the text-direction override; undefined when unset (panels then resolve it
 * from their anchor element's inherited direction).
 *
 * 读取浮层文本方向覆盖；未配置时返回 undefined，由组件按锚点元素继承方向解析。
 */
export function useDir(): Direction | undefined {
  return useOOUIConfig().dir;
}

/**
 * Reads the display label for an access key (via `getAccessKeyLabel`). Returns
 * undefined when there is no accessKey, no resolver, or the resolver returns
 * undefined (`resolveTitle` then falls back to the raw key); an empty-string
 * result is returned as-is (no suffix). Components must call this unconditionally
 * (hooks can't sit in a condition); an empty accessKey is handled here.
 *
 * 读取一个快捷键的显示文案（经 `getAccessKeyLabel` 解析）：无 accessKey、未配置
 * 解析器或解析器返回 undefined 时返回 undefined（`resolveTitle` 回落原键值）；
 * 解析器返回空串时原样返回。组件须无条件调用本 hook（Hook 不可置于条件中）。
 */
export function useAccessKeyLabel(accessKey?: string): string | undefined {
  const { getAccessKeyLabel } = useOOUIConfig();
  if (!accessKey || !getAccessKeyLabel) {
    return undefined;
  }
  return getAccessKeyLabel(accessKey);
}

/**
 * Reads the normalized viewport spacing (four numeric sides); each side falls back
 * to `VIEWPORT_SPACING` (0) when unset.
 *
 * 读取归一化的视口留白（四边数值），未配置时各边取 `VIEWPORT_SPACING`（0）。
 */
export function useViewportSpacing(): ViewportSpacing {
  const { viewportSpacing } = useOOUIConfig();
  // 经useMemo稳定引用：配置不变时归一化结果同一对象，浮层定位effect不因引用漂移重挂
  return useMemo(() => normalizeViewportSpacing(viewportSpacing), [viewportSpacing]);
}
