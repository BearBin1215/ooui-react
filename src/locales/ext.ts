import type { MessageKey, MessageValue } from "../i18n";

/**
 * 埃斯特雷马杜拉语消息包：译文取自原版OOUI dist/i18n/ext.json（0.54.2，译者见原文件@metadata）。
 * 类型为Partial——缺键由英文默认逐键兜底
 */
export default {
  "ooui-copytextlayout-copy": "Copia",
  "ooui-toolgroup-expand": "Más",
  "ooui-dialog-message-accept": "D'acuerdu",
  "ooui-dialog-message-reject": "Suspendel",
  "ooui-dialog-process-retry": "Tental de nueu",
  "ooui-dialog-process-continue": "Acontinal",
  "ooui-selectfile-button-select": "Descoja un archivu",
  "ooui-selectfile-button-select-multiple": "Descoja archivus",
  "ooui-selectfile-placeholder": "Dengún archivu descogíu",
  "ooui-popup-widget-close-button-aria-label": "Fechal",
  "ooui-field-help": "Ayúa",
} satisfies Partial<Record<MessageKey, MessageValue>>;
