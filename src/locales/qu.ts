import type { MessageKey, MessageValue } from "../i18n";

/**
 * 克丘亚语消息包：译文取自原版OOUI dist/i18n/qu.json（0.54.2，译者见原文件@metadata）。
 * 类型为Partial——缺键由英文默认逐键兜底
 */
export default {
  "ooui-outline-control-move-down": "Qallawata uraykuchiy",
  "ooui-outline-control-move-up": "Qallawata huqariy",
  "ooui-outline-control-remove": "P'anqa sutikunata qichuy",
  "ooui-field-help": "Yanapa",
} satisfies Partial<Record<MessageKey, MessageValue>>;
