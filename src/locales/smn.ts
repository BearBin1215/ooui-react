import type { MessageKey, MessageValue } from "../i18n";

/**
 * 伊纳里萨米语消息包：译文取自原版OOUI dist/i18n/smn.json（0.54.2，译者见原文件@metadata）。
 * 类型为Partial——缺键由英文默认逐键兜底
 */
export default {
  "ooui-copytextlayout-copy": "Kopijist",
  "ooui-item-remove": "Siho",
  "ooui-dialog-message-accept": "OK",
  "ooui-dialog-message-reject": "Jooskâ",
  "ooui-dialog-process-error": "Miinii moonâi endurân",
  "ooui-dialog-process-retry": "Keččâl uđđâsist",
  "ooui-dialog-process-continue": "Juáđhi",
  "ooui-combobox-button-label": "Čääiti teikkâ čievâ asâttâsâid",
  "ooui-selectfile-button-select": "Valjii tiätuvuárhá",
  "ooui-selectfile-button-select-multiple": "Valjii tiätuvuárháid",
  "ooui-selectfile-placeholder": "Ohtâgin tiätuvuárkká ij lah väljejum",
  "ooui-popup-widget-close-button-aria-label": "Toopâ",
  "ooui-field-help": "Iše",
} satisfies Partial<Record<MessageKey, MessageValue>>;
