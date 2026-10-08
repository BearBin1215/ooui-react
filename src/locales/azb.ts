import type { MessageKey, MessageValue } from "../i18n";

/**
 * 南阿塞拜疆语消息包：译文取自原版OOUI dist/i18n/azb.json（0.54.2，译者见原文件@metadata）。
 * 类型为Partial——缺键由英文默认逐键兜底
 */
export default {
  "ooui-dialog-message-reject": "وازگئچ",
  "ooui-dialog-process-continue": "داوام ائت",
  "ooui-selectfile-button-select": "بیر فایل سئچ",
  "ooui-selectfile-placeholder": "هئچ فایل سئچیلمه‌ییب",
} satisfies Partial<Record<MessageKey, MessageValue>>;
