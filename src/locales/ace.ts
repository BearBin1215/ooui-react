import type { MessageKey, MessageValue } from "../i18n";

/**
 * 亚齐语消息包：译文取自原版OOUI dist/i18n/ace.json（0.54.2，译者见原文件@metadata）。
 * 类型为Partial——缺键由英文默认逐键兜底
 */
export default {
  "ooui-outline-control-move-down": "Pinah item u yup",
  "ooui-outline-control-move-up": "Pinah item u ateuëh",
  "ooui-toolgroup-expand": "Lom",
  "ooui-toolgroup-collapse": "Leubèh dit",
  "ooui-item-remove": "Sampôh",
  "ooui-dialog-message-accept": "Ka göt",
  "ooui-dialog-message-reject": "Pubateuë",
  "ooui-dialog-process-error": "Na nyang hana paih",
  "ooui-dialog-process-dismiss": "Tôp",
  "ooui-dialog-process-retry": "Ci lom",
  "ooui-dialog-process-continue": "Lanjut",
  "ooui-selectfile-button-select": "Piléh beureukaih",
  "ooui-field-help": "Beunantu",
} satisfies Partial<Record<MessageKey, MessageValue>>;
