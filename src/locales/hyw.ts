import type { MessageKey, MessageValue } from "../i18n";

/**
 * 西亚美尼亚语消息包：译文取自原版OOUI dist/i18n/hyw.json（0.54.2，译者见原文件@metadata）。
 * 类型为Partial——缺键由英文默认逐键兜底
 */
export default {
  "ooui-toolgroup-expand": "Աւելի",
  "ooui-toolgroup-collapse": "Աւելի քիչ",
  "ooui-item-remove": "Հեռացնել",
  "ooui-dialog-message-accept": "Լաւ",
  "ooui-dialog-message-reject": "Չեղարկել",
  "ooui-dialog-process-continue": "Շարունակել",
  "ooui-field-help": "Օգնութիւն",
} satisfies Partial<Record<MessageKey, MessageValue>>;
