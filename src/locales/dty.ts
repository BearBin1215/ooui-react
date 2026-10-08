import type { MessageKey, MessageValue } from "../i18n";

/**
 * 多特利语消息包：译文取自原版OOUI dist/i18n/dty.json（0.54.2，译者见原文件@metadata）。
 * 类型为Partial——缺键由英文默认逐键兜底
 */
export default {
  "ooui-outline-control-move-down": "वस्तुलाई तल साददे",
  "ooui-outline-control-move-up": "वस्तुलाई मथि साददे",
  "ooui-outline-control-remove": "वस्तुलाई हटुन्या",
  "ooui-toolgroup-expand": "झिक्क",
  "ooui-toolgroup-collapse": "थोका",
  "ooui-dialog-message-accept": "हुन्छ",
  "ooui-dialog-message-reject": "रद्द",
  "ooui-dialog-process-dismiss": "खारेज गद्दे",
  "ooui-dialog-process-retry": "दोसरया प्रयास गर",
  "ooui-dialog-process-continue": "जारी राख्या",
} satisfies Partial<Record<MessageKey, MessageValue>>;
