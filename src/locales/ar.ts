import type { MessageKey, MessageValue } from "../i18n";

/**
 * 阿拉伯语消息包：译文取自原版OOUI dist/i18n/ar.json（0.54.2，译者见原文件@metadata）。
 * 类型为Partial——缺键由英文默认逐键兜底
 */
export default {
  "ooui-copytextlayout-copy": "نسخ",
  "ooui-outline-control-move-down": "انقل العنصر للأسفل",
  "ooui-outline-control-move-up": "انقل العنصر للأعلى",
  "ooui-outline-control-remove": "أزل العنصر",
  "ooui-toolgroup-expand": "مزيد",
  "ooui-toolgroup-collapse": "أقل",
  "ooui-item-remove": "إزالة",
  "ooui-dialog-message-accept": "موافق",
  "ooui-dialog-message-reject": "إلغاء",
  "ooui-dialog-process-error": "حدث خطأ",
  "ooui-dialog-process-back": "رجوع",
  "ooui-dialog-process-dismiss": "أغلق",
  "ooui-dialog-process-retry": "حاول مرة أخرى",
  "ooui-dialog-process-continue": "استمر",
  "ooui-combobox-button-label": "خيارات التبديل",
  "ooui-selectfile-button-select": "اختر ملفا",
  "ooui-selectfile-button-select-multiple": "اختر الملفات",
  "ooui-selectfile-placeholder": "لم يتم اختيار أي ملف",
  "ooui-selectfile-dragdrop-placeholder": "اترك الملف هنا",
  "ooui-selectfile-dragdrop-placeholder-multiple": "أسقط الملفات هنا",
  "ooui-popup-widget-close-button-aria-label": "أغلق",
  "ooui-field-help": "مساعدة",
} satisfies Partial<Record<MessageKey, MessageValue>>;
