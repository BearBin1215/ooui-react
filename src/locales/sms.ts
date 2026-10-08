import type { MessageKey, MessageValue } from "../i18n";

/**
 * 斯科尔特萨米语消息包：译文取自原版OOUI dist/i18n/sms.json（0.54.2，译者见原文件@metadata）。
 * 类型为Partial——缺键由英文默认逐键兜底
 */
export default {
  "ooui-item-remove": "Jaukkâd",
  "ooui-dialog-message-reject": "Jõõsk",
  "ooui-dialog-process-continue": "Jueʹtǩ",
  "ooui-selectfile-button-select": "Vaʹlljed teâttõõzz",
  "ooui-selectfile-button-select-multiple": "Vaʹlljed teâttõõzzid",
  "ooui-field-help": "Vuäʹppõõzz",
} satisfies Partial<Record<MessageKey, MessageValue>>;
