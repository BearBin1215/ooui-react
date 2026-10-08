import type { MessageKey, MessageValue } from "../i18n";

/**
 * 奥罗莫语消息包：译文取自原版OOUI dist/i18n/om.json（0.54.2，译者见原文件@metadata）。
 * 类型为Partial——缺键由英文默认逐键兜底
 */
export default {
  "ooui-outline-control-move-down": "Gad buusi",
  "ooui-outline-control-move-up": "Ol baasi",
  "ooui-outline-control-remove": "Maalimaa balleessi",
  "ooui-toolgroup-expand": "Dabalata",
  "ooui-toolgroup-collapse": "Xiqqaa",
  "ooui-dialog-message-accept": "Tole",
  "ooui-dialog-message-reject": "Haqi",
  "ooui-dialog-process-error": "Dogoggorri wayii ummameera",
  "ooui-dialog-process-dismiss": "Didi",
  "ooui-dialog-process-retry": "Itti deebi'ii yaali",
  "ooui-dialog-process-continue": "Itti fufi",
  "ooui-selectfile-button-select": "Faayilii filadhu",
  "ooui-selectfile-placeholder": "Faayiliin wayiiyyuu hin filatamne",
  "ooui-selectfile-dragdrop-placeholder": "Faayilii as kaa'i",
} satisfies Partial<Record<MessageKey, MessageValue>>;
