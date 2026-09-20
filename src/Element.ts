import type { HTMLAttributes, ReactNode } from "react";

/**
 * 各元素mixin（Icon/Indicator/Label/AccessKeyed/Flagged等）的契约类型与flag联合类型
 * （IconFlag/ButtonFlag等）集中于此，供组件与mixins.ts共享，避免类型散落在渲染组件目录
 * 造成依赖方向倒置；对应的类名贡献与元素级状态解析见mixins.ts
 */

/**
 * Base props of every element (aligns with the abstract OO.ui.Element; types
 * only, no rendering component). `defaultValue` / `defaultChecked` are dropped:
 * native default semantics are carried by each component's own `defaultValue`
 * props and never fall through to the DOM.
 *
 * 基础元素参数（对齐原版抽象基类 Element，仅类型，无对应渲染组件）。剔除
 * `defaultValue` / `defaultChecked`：原生默认值语义已由各组件自己的
 * `defaultValue` 类 props 承担，不随透传属性落到 DOM。
 */
export type ElementProps<T = HTMLDivElement> = Omit<
  HTMLAttributes<T>,
  "defaultValue" | "defaultChecked"
>;

/**
 * Access-key mixin props (types only).
 *
 * 快捷键元素参数（对齐原版AccessKeyedElement mixin，仅类型）。
 */
export interface AccessKeyedElement {
  /**
   * Access key; written to the element and appended to `title` as `[key]`.
   *
   * 快捷键，写入元素并在 `title` 末尾附 `[键]`
   */
  accessKey?: string;
}

/**
 * FlaggedElement mixin props (types only): each flag contributes an
 * `oo-ui-flaggedElement-{flag}` class. The original's object form of
 * `config.flags` served imperative `setFlags` toggling; declarative props only
 * accept a string or array.
 *
 * FlaggedElement mixin 的 props 类型（对齐原版 OO.ui.mixin.FlaggedElement，仅
 * 类型，无渲染组件）：每个标志输出 `oo-ui-flaggedElement-{flag}` 类。原版
 * `config.flags` 的对象形态为命令式 `setFlags` 所用，声明式 props 仅收字符串 / 数组。
 */
export interface FlaggedElement {
  /**
   * Extra flags; allowed values are listed on each component page.
   *
   * 附加标志，可选值见组件页
   */
  flags?: string | string[];
}

/**
 * Label mixin props (types only).
 *
 * 标签元素参数（对齐原版LabelElement mixin，仅类型）。
 */
export interface LabelElement {
  /**
   * Label content
   *
   * 标签显示内容
   */
  label?: ReactNode;

  /**
   * Label visually hidden but kept as the accessible name.
   *
   * 标签不可见（视觉隐藏但保留可访问名称）
   */
  invisibleLabel?: boolean;
}

/**
 * Icon color variants supported by the theme; {@link IconFlag} is derived from this.
 *
 * 主题支持的图标配色变体集，{@link IconFlag} 由此派生。
 */
export const ICON_FLAGS = [
  "progressive",
  "destructive",
  "invert",
  "error",
  "warning",
  "success",
] as const;

/**
 * Icon color variant, derived from {@link ICON_FLAGS}.
 *
 * 图标配色变体，由 {@link ICON_FLAGS} 派生。
 */
export type IconFlag = (typeof ICON_FLAGS)[number];

/**
 * Icon mixin props (types only).
 *
 * 图标元素参数（对齐原版IconElement mixin，仅类型）。
 */
export interface IconElement {
  /**
   * Icon name; see the icon list of the theme.
   *
   * 图标名称，可选值见主题的图标列表。
   *
   * @see https://doc.wikimedia.org/oojs-ui/master/demos/?page=icons
   */
  icon?: string;
}

/**
 * Indicators supported by the theme
 *
 * 主题支持的指示器集合
 */
export type Indicators = "clear" | "up" | "down" | "required";

/**
 * Indicator mixin props (types only).
 *
 * 指示器元素参数（对齐原版IndicatorElement mixin，仅类型）。
 */
export interface IndicatorElement {
  /**
   * Indicator
   *
   * 组件指示器
   */
  indicator?: Indicators;
}

/**
 * Button flags: the icon variants plus the button-specific primary / safe /
 * back / close.
 *
 * 按钮标志：图标配色变体之外，扩展按钮专属的 primary / safe / back / close。
 */
export type ButtonFlag = IconFlag | "primary" | "safe" | "back" | "close";
