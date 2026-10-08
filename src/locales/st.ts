import type { MessageKey, MessageValue } from "../i18n";

/**
 * 南索托语消息包：译文取自原版OOUI dist/i18n/st.json（0.54.2，译者见原文件@metadata）。
 * 类型为Partial——缺键由英文默认逐键兜底
 */
export default {
  "ooui-toolgroup-expand": "Tse ling",
  "ooui-toolgroup-collapse": "Tse fokolang",
  "ooui-item-remove": "Tlosa",
  "ooui-dialog-message-reject": "Timetsa",
  "ooui-dialog-process-dismiss": "Kwala",
  "ooui-popup-widget-close-button-aria-label": "Kwala",
  "ooui-field-help": "Thuso",
} satisfies Partial<Record<MessageKey, MessageValue>>;
