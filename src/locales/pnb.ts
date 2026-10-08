import type { MessageKey, MessageValue } from "../i18n";

/**
 * 西旁遮普语消息包：译文取自原版OOUI dist/i18n/pnb.json（0.54.2，译者见原文件@metadata）。
 * 类型为Partial——缺键由英文默认逐键兜底
 */
export default {
  "ooui-copytextlayout-copy": "کاپی",
  "ooui-outline-control-move-down": "شے تھلے کرو",
  "ooui-outline-control-move-up": "شے اتے کرو",
  "ooui-outline-control-remove": "شے مٹاؤ",
  "ooui-toolgroup-expand": "ہور",
  "ooui-toolgroup-collapse": "گھٹ",
  "ooui-item-remove": "ہٹاؤ",
  "ooui-dialog-message-accept": "ٹھیک اے",
  "ooui-dialog-message-reject": "رد کرو",
  "ooui-dialog-process-error": "کوئی رپھڑ پے گیا اے۔",
  "ooui-dialog-process-dismiss": "مکاؤ",
  "ooui-dialog-process-retry": "فیر کرو",
  "ooui-dialog-process-continue": "چلاؤ",
  "ooui-combobox-button-label": "ٹوگل اختیارات",
  "ooui-selectfile-button-select": "فائل چݨو",
  "ooui-selectfile-button-select-multiple": "فائلاں چݨو",
  "ooui-selectfile-placeholder": "کوئی فائل نہیں چݨی ہوئی",
  "ooui-selectfile-dragdrop-placeholder": "فائل اِیتھے پایو",
  "ooui-selectfile-dragdrop-placeholder-multiple": "فائلاں اِیتھے پایو",
  "ooui-popup-widget-close-button-aria-label": "بند کرو",
  "ooui-field-help": "مدد",
} satisfies Partial<Record<MessageKey, MessageValue>>;
