import type { MessageKey, MessageValue } from "../i18n";

/**
 * 塔利什语消息包：译文取自原版OOUI dist/i18n/tly.json（0.54.2，译者见原文件@metadata）。
 * 类型为Partial——缺键由英文默认逐键兜底
 */
export default {
  "ooui-copytextlayout-copy": "Kopijə karde",
  "ooui-outline-control-move-down": "Elementi bə ži okyrnije",
  "ooui-outline-control-move-up": "Elementi bə pe okyrnije",
  "ooui-outline-control-remove": "Ǧysmi mole",
  "ooui-toolgroup-expand": "Hənijən",
  "ooui-toolgroup-collapse": "Kam",
  "ooui-item-remove": "Mole",
  "ooui-dialog-message-accept": "COK",
  "ooui-dialog-message-reject": "Ohašte",
  "ooui-dialog-process-error": "Xəto beše",
  "ooui-dialog-process-dismiss": "Žəj",
  "ooui-dialog-process-retry": "Sənibəton osə karde",
  "ooui-dialog-process-continue": "Idomə karde",
  "ooui-combobox-button-label": "Parametron ovaxte",
  "ooui-selectfile-button-select": "Fajli byvyžyn",
  "ooui-selectfile-button-select-multiple": "Fajlon byvyžnən",
  "ooui-selectfile-placeholder": "Fajl vyžnijə byəni",
  "ooui-selectfile-dragdrop-placeholder": "Fajli ijo dəǧandən",
  "ooui-selectfile-dragdrop-placeholder-multiple": "Fajlon ijo dəǧandən",
  "ooui-popup-widget-close-button-aria-label": "Žəj",
  "ooui-field-help": "Dastək",
} satisfies Partial<Record<MessageKey, MessageValue>>;
