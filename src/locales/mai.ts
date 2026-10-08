import type { MessageKey, MessageValue } from "../i18n";

/**
 * 迈蒂利语消息包：译文取自原版OOUI dist/i18n/mai.json（0.54.2，译者见原文件@metadata）。
 * 类型为Partial——缺键由英文默认逐键兜底
 */
export default {
  "ooui-outline-control-move-down": "प्रविष्टि तर लजाबी",
  "ooui-outline-control-remove": "शीर्षक सभकेँ हटाउ",
  "ooui-toolgroup-expand": "आर",
  "ooui-toolgroup-collapse": "कम",
  "ooui-item-remove": "हटाबी",
  "ooui-dialog-message-accept": "ठीक अछि",
  "ooui-dialog-message-reject": "रद्द करु",
  "ooui-dialog-process-dismiss": "खारिज",
  "ooui-dialog-process-retry": "पुनः प्रयास करू",
  "ooui-dialog-process-continue": "आगु चलु",
  "ooui-selectfile-button-select": "फ़ाइल चुरू",
  "ooui-field-help": "सहायता",
} satisfies Partial<Record<MessageKey, MessageValue>>;
