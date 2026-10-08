import type { MessageKey, MessageValue } from "../i18n";

/**
 * 梵语消息包：译文取自原版OOUI dist/i18n/sa.json（0.54.2，译者见原文件@metadata）。
 * 类型为Partial——缺键由英文默认逐键兜底
 */
export default {
  "ooui-outline-control-remove": "वस्तु निष्कास्यताम्",
  "ooui-toolgroup-expand": "अधिकम्",
  "ooui-dialog-message-accept": "अस्तु",
  "ooui-dialog-message-reject": "निरस्यताम्",
  "ooui-dialog-process-retry": "पुनः चेष्ट्यताम्",
  "ooui-dialog-process-continue": "निरन्तरम्",
} satisfies Partial<Record<MessageKey, MessageValue>>;
