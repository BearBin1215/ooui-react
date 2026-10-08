import type { MessageKey, MessageValue } from "../i18n";

/**
 * 萨拉基语（阿拉伯文）消息包：译文取自原版OOUI dist/i18n/skr-arab.json（0.54.2，译者见原文件@metadata）。
 * 类型为Partial——缺键由英文默认逐键兜底
 */
export default {
  "ooui-copytextlayout-copy": "نقل کرو",
  "ooui-outline-control-move-down": "آئٹم تلے ٹورو",
  "ooui-outline-control-move-up": "آئٹم اُتے ٹورو",
  "ooui-outline-control-remove": "آئٹم ہٹاؤ",
  "ooui-toolgroup-expand": "ٻئے",
  "ooui-toolgroup-collapse": "گھٹ",
  "ooui-item-remove": "ہٹاؤ",
  "ooui-dialog-message-accept": "ٹھیک ہے",
  "ooui-dialog-message-reject": "منسوخ",
  "ooui-dialog-process-error": "کجھ خراب تھی ڳئے",
  "ooui-dialog-process-back": "پچھوں",
  "ooui-dialog-process-dismiss": "مکاؤ",
  "ooui-dialog-process-retry": "ولدا کوشش کرو",
  "ooui-dialog-process-continue": "جاری رکھو",
  "ooui-combobox-button-label": "ٹوگل اختیارات",
  "ooui-selectfile-button-select": "فائل چݨو",
  "ooui-selectfile-button-select-multiple": "فائلاں چݨو",
  "ooui-selectfile-placeholder": "کوئی فائل کائنی چُݨی",
  "ooui-selectfile-dragdrop-placeholder": "فائلاں اتھ سٹو",
  "ooui-selectfile-dragdrop-placeholder-multiple": "فائلاں اتھ سٹو",
  "ooui-popup-widget-close-button-aria-label": "بند کرو",
  "ooui-field-help": "مدد",
} satisfies Partial<Record<MessageKey, MessageValue>>;
