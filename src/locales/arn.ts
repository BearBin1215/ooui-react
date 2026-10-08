import type { MessageKey, MessageValue } from "../i18n";

/**
 * 马普切语消息包：译文取自原版OOUI dist/i18n/arn.json（0.54.2，译者见原文件@metadata）。
 * 类型为Partial——缺键由英文默认逐键兜底
 */
export default {
  "ooui-toolgroup-expand": "Zoy",
  "ooui-toolgroup-collapse": "Zoy Püchi",
  "ooui-item-remove": "Entukünun",
  "ooui-dialog-message-accept": "Feley",
  "ooui-dialog-message-reject": "Katrütun",
  "ooui-dialog-process-error": "Welulkaley kiñe zungu",
  "ooui-dialog-process-retry": "Ka kiñe",
  "ooui-dialog-process-continue": "Amulepe",
  "ooui-selectfile-button-select": "Zullin kiñe eltukawün",
  "ooui-selectfile-button-select-multiple": "Zullin eltukawün",
  "ooui-selectfile-placeholder": "Zullingelay eltukawün",
  "ooui-popup-widget-close-button-aria-label": "Nürüfün",
  "ooui-field-help": "Kellun",
} satisfies Partial<Record<MessageKey, MessageValue>>;
