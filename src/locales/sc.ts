import type { MessageKey, MessageValue } from "../i18n";

/**
 * 萨丁语消息包：译文取自原版OOUI dist/i18n/sc.json（0.54.2，译者见原文件@metadata）。
 * 类型为Partial——缺键由英文默认逐键兜底
 */
export default {
  "ooui-outline-control-move-down": "Move s'elementu a suta",
  "ooui-outline-control-move-up": "Move s'elementu a suta",
  "ooui-outline-control-remove": "Boga s'elementu",
  "ooui-toolgroup-collapse": "De mancu",
  "ooui-item-remove": "Boga",
  "ooui-dialog-message-accept": "AB",
  "ooui-dialog-message-reject": "Annulla",
  "ooui-dialog-process-error": "B'at àpidu carchi problema",
  "ooui-dialog-process-retry": "Torra a proare",
  "ooui-dialog-process-continue": "Sighi",
  "ooui-selectfile-button-select": "Ischerta unu documentu",
  "ooui-field-help": "Agiudu",
} satisfies Partial<Record<MessageKey, MessageValue>>;
