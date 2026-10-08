import type { MessageKey, MessageValue } from "../i18n";

/**
 * 乌兹别克语消息包：译文取自原版OOUI dist/i18n/uz.json（0.54.2，译者见原文件@metadata）。
 * 类型为Partial——缺键由英文默认逐键兜底
 */
export default {
  "ooui-copytextlayout-copy": "Nusxa olish",
  "ooui-outline-control-move-down": "Elementni pastga koʻchirish",
  "ooui-outline-control-move-up": "Elementni yuqoriga koʻchirish",
  "ooui-outline-control-remove": "Elementni olib tashlash",
  "ooui-toolgroup-expand": "Yana",
  "ooui-toolgroup-collapse": "Kamroq",
  "ooui-item-remove": "Olib tashlash",
  "ooui-dialog-message-accept": "OK",
  "ooui-dialog-message-reject": "Bekor qilish",
  "ooui-dialog-process-retry": "Qayta urinib koʻrish",
  "ooui-dialog-process-continue": "Davom ettirish",
  "ooui-selectfile-button-select": "Fayl tanlash",
  "ooui-selectfile-button-select-multiple": "Fayllarni tanlamoq",
  "ooui-selectfile-placeholder": "Hech qanday fayl tanlanmagan",
  "ooui-selectfile-dragdrop-placeholder-multiple": "Fayllarni bu yerga olib keling",
  "ooui-popup-widget-close-button-aria-label": "Yopish",
  "ooui-field-help": "Yordam",
} satisfies Partial<Record<MessageKey, MessageValue>>;
