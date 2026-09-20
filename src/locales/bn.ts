import type { MessageKey, MessageValue } from "../i18n";

/**
 * 孟加拉语消息包：译文取自原版OOUI dist/i18n/bn.json（0.54.2，译者见原文件@metadata）。
 * 类型为Partial——缺键由英文默认逐键兜底
 */
export default {
  "ooui-copytextlayout-copy": "অনুলিপি",
  "ooui-outline-control-move-down": "আইটেম নিচে স্থানান্তর",
  "ooui-outline-control-move-up": "আইটেম উপরে স্থানান্তর",
  "ooui-outline-control-remove": "আইটেম সরান",
  "ooui-toolgroup-expand": "আরও",
  "ooui-toolgroup-collapse": "কম দেখাও",
  "ooui-item-remove": "সরান",
  "ooui-dialog-message-accept": "ঠিক আছে",
  "ooui-dialog-message-reject": "বাতিল",
  "ooui-dialog-process-error": "কিছু একটায় ত্রুটি হয়েছে",
  "ooui-dialog-process-back": "পিছনে যান",
  "ooui-dialog-process-dismiss": "বাতিল করুন",
  "ooui-dialog-process-retry": "আবার চেষ্টা করুন",
  "ooui-dialog-process-continue": "অগ্রসর হোন",
  "ooui-combobox-button-label": "ভাসানো বিকল্প",
  "ooui-selectfile-button-select": "একটি ফাইল নির্বাচন করুন",
  "ooui-selectfile-button-select-multiple": "ফাইলসমূহ নির্বাচন করুন",
  "ooui-selectfile-placeholder": "কোনো ফাইল নির্বাচিত হয়নি",
  "ooui-selectfile-dragdrop-placeholder": "এখানে ফাইল দিন",
  "ooui-selectfile-dragdrop-placeholder-multiple": "এখানে ফাইল দিন",
  "ooui-popup-widget-close-button-aria-label": "বন্ধ করুন",
  "ooui-field-help": "সাহায্য",
} satisfies Partial<Record<MessageKey, MessageValue>>;
