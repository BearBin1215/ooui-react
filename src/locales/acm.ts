import type { MessageKey, MessageValue } from "../i18n";

/**
 * 美索不达米亚阿拉伯语消息包：译文取自原版OOUI dist/i18n/acm.json（0.54.2，译者见原文件@metadata）。
 * 类型为Partial——缺键由英文默认逐键兜底
 */
export default {
  "ooui-copytextlayout-copy": "انسخ",
  "ooui-outline-control-move-down": "انقل الشغله جوه",
  "ooui-outline-control-move-up": "انقل الشغله فوك",
  "ooui-outline-control-remove": "شيل الشغله",
  "ooui-toolgroup-expand": "بعد هواي",
  "ooui-toolgroup-collapse": "اقل",
  "ooui-item-remove": "شيل",
  "ooui-dialog-message-accept": "اوك",
  "ooui-dialog-message-reject": "الغي",
  "ooui-dialog-process-error": "صار شي غلط",
  "ooui-dialog-process-dismiss": "عوف",
  "ooui-dialog-process-retry": "حاول مره ثانيه",
  "ooui-dialog-process-continue": "كمل",
  "ooui-combobox-button-label": "اعدادات التبديل",
  "ooui-selectfile-button-select": "اختار ملف",
  "ooui-selectfile-button-select-multiple": "اختار الملفات",
  "ooui-selectfile-placeholder": "ما اختاريت ملف",
  "ooui-selectfile-dragdrop-placeholder": "خلي الملف هنانه",
  "ooui-selectfile-dragdrop-placeholder-multiple": "خلي الملفات هنانه",
  "ooui-popup-widget-close-button-aria-label": "سد",
  "ooui-field-help": "مساعده",
} satisfies Partial<Record<MessageKey, MessageValue>>;
