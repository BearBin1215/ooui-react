import type { MessageKey, MessageValue } from "../i18n";

/**
 * 马拉地语消息包：译文取自原版OOUI dist/i18n/mr.json（0.54.2，译者见原文件@metadata）。
 * 类型为Partial——缺键由英文默认逐键兜底
 */
export default {
  "ooui-outline-control-move-down": "घटक (आयटम) खाली सरकवा",
  "ooui-outline-control-move-up": "घटक (आयटम) वर सरकवा",
  "ooui-outline-control-remove": "बाब हटवा",
  "ooui-toolgroup-expand": "अधिक",
  "ooui-toolgroup-collapse": "कमी",
  "ooui-item-remove": "हटवा",
  "ooui-dialog-message-accept": "ठिक आहे",
  "ooui-dialog-message-reject": "रद्द करा",
  "ooui-dialog-process-error": "काहीतरी गडबड झाली",
  "ooui-dialog-process-dismiss": "रद्द करा",
  "ooui-dialog-process-retry": "पुन्हा प्रयत्न करा",
  "ooui-dialog-process-continue": "चालू ठेवा",
  "ooui-selectfile-button-select": "संचिका निवडा",
  "ooui-selectfile-placeholder": "संचिका निवडल्या गेली नाही",
  "ooui-selectfile-dragdrop-placeholder": "संचिका येथे टाका",
} satisfies Partial<Record<MessageKey, MessageValue>>;
