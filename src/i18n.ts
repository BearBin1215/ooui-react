import en from "./locales/en";

/**
 * Message key: the names follow the original OOUI i18n keys (`ooui-*`) so a
 * MediaWiki host can map them to the same-named `mw.msg` messages directly.
 * Only covers the system-level default text of components implemented here.
 *
 * 消息键：键名对齐原版 OOUI 的 i18n 键（`ooui-*`），便于 MediaWiki 场景直接
 * 映射 `mw.msg` 的同名消息。仅收录本工程已实现组件涉及的系统级默认文案。
 */
export type MessageKey =
  | "ooui-copytextlayout-copy"
  | "ooui-outline-control-move-down"
  | "ooui-outline-control-move-up"
  | "ooui-outline-control-remove"
  | "ooui-toolgroup-expand"
  | "ooui-toolgroup-collapse"
  | "ooui-item-remove"
  | "ooui-dialog-message-accept"
  | "ooui-dialog-message-reject"
  | "ooui-dialog-process-error"
  | "ooui-dialog-process-back"
  | "ooui-dialog-process-dismiss"
  | "ooui-dialog-process-retry"
  | "ooui-dialog-process-continue"
  | "ooui-combobox-button-label"
  | "ooui-selectfile-button-select"
  | "ooui-selectfile-button-select-multiple"
  | "ooui-selectfile-placeholder"
  | "ooui-selectfile-dragdrop-placeholder"
  | "ooui-selectfile-dragdrop-placeholder-multiple"
  | "ooui-popup-widget-close-button-aria-label"
  | "ooui-field-help";

/**
 * Message value: a plain string, or a deferred resolver function (e.g. a site's
 * `() => mw.msg(key)` hooking into the MediaWiki language system, mirroring the
 * original's `deferMsg`).
 *
 * 消息值：字符串或延迟解析函数（如站点侧 `() => mw.msg(key)` 接入 MediaWiki
 * 语言体系，对齐原版 `deferMsg` 语义）。
 */
export type MessageValue = string | (() => string);

// 模块级覆盖表：registerMessages写入，msg读取。命令式API（confirm/alert/prompt）在
// React树外经createRoot渲染、拿不到OOUIProvider，其文案只能走本表
const overrides: Partial<Record<MessageKey, MessageValue>> = {};

/** $1/$2参数替换，对齐原版OO.ui.msg */
function substitute(message: string, params: unknown[]): string {
  return message.replace(/\$(\d+)/g, (_match, n) => {
    const index = parseInt(n, 10) - 1;
    return params[index] !== undefined ? String(params[index]) : `$${n}`;
  });
}

/**
 * Resolve a single message value: call the function, or return the string as-is
 * (aligning with the original's `OO.ui.resolveMsg`).
 *
 * 解析单条消息值：函数求值、字符串直出（对齐原版 `OO.ui.resolveMsg`）。
 */
export function resolveMsg(value: MessageValue): string {
  return typeof value === "function" ? value() : value;
}

/** 格式化一条消息值并做参数替换，供msg与Provider侧useMessage共用 */
export function formatMessage(value: MessageValue, params: unknown[]): string {
  return substitute(resolveMsg(value), params);
}

/**
 * Read a message (English default + module-level overrides), aligning with the
 * original's `OO.ui.msg`. Inside a declarative component prefer `useMessage` (it
 * honors `OOUIProvider`'s `messages` overrides); this function is for the
 * imperative API and non-React contexts.
 *
 * 读取消息（英文默认 + 模块级覆盖），对齐原版 `OO.ui.msg`。声明式组件内请
 * 优先使用 `useMessage`（可被 OOUIProvider 的 messages 覆盖）；本函数供命令式
 * API 与非 React 场景使用。
 */
export function msg(key: MessageKey, ...params: unknown[]): string {
  const override = overrides[key];
  return formatMessage(override ?? en[key], params);
}

/**
 * Defer a message: return a function that resolves it only when called, aligning
 * with the original's `OO.ui.deferMsg`. For integration where the message table
 * isn't ready at module-init time (e.g. a site's `() => mw.msg(key)`).
 *
 * 延迟解析消息：返回调用时才取值的函数，对齐原版 `OO.ui.deferMsg`。用于
 * 消息表晚于模块初始化就绪的接入场景（如站点侧 `() => mw.msg(key)`）。
 */
export function deferMsg(key: MessageKey, ...params: unknown[]): () => string {
  return () => msg(key, ...params);
}

/**
 * Register module-level message overrides (merged into the existing table; a later
 * registration of the same key wins).
 *
 * 模块级注册消息覆盖（并入现有覆盖表，后注册的同键覆盖先注册的）。
 */
export function registerMessages(map: Partial<Record<MessageKey, MessageValue>>): void {
  Object.assign(overrides, map);
}
