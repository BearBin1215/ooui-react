import type { MessageKey, MessageValue } from "../i18n";

/**
 * 乌尔都语消息包：译文取自原版OOUI dist/i18n/ur.json（0.54.2，译者见原文件@metadata）。
 * 类型为Partial——缺键由英文默认逐键兜底
 */
export default {
  "ooui-copytextlayout-copy": "نقل کریں",
  "ooui-outline-control-move-down": "نیچے کھسکائیں",
  "ooui-outline-control-move-up": "اوپر کھسکائیں",
  "ooui-outline-control-remove": "حذف کریں",
  "ooui-toolgroup-expand": "مزید",
  "ooui-toolgroup-collapse": "سمیٹیں",
  "ooui-item-remove": "ہٹائیں",
  "ooui-dialog-message-accept": "ٹھیک",
  "ooui-dialog-message-reject": "منسوخ کریں",
  "ooui-dialog-process-error": "کچھ غلط ہو گیا ہے",
  "ooui-dialog-process-dismiss": "بند کریں",
  "ooui-dialog-process-retry": "دوبارہ کوشش کریں",
  "ooui-dialog-process-continue": "جاری رکھیں",
  "ooui-combobox-button-label": "ڈراپ ڈاؤن برائے خانہ ترمیم",
  "ooui-selectfile-button-select": "فائل منتخب کریں",
  "ooui-selectfile-button-select-multiple": "فائلیں منتخب کریں",
  "ooui-selectfile-placeholder": "کوئی فائل منتخب نہیں کی گئی",
  "ooui-selectfile-dragdrop-placeholder": "فائل یہاں چھوڑیں",
  "ooui-selectfile-dragdrop-placeholder-multiple": "فائل یہاں چھوڑیں",
  "ooui-popup-widget-close-button-aria-label": "بند کریں",
  "ooui-field-help": "معاونت",
} satisfies Partial<Record<MessageKey, MessageValue>>;
