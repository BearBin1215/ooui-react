import type { MessageKey, MessageValue } from "../i18n";

/**
 * 吉尔吉斯语消息包：译文取自原版OOUI dist/i18n/ky.json（0.54.2，译者见原文件@metadata）。
 * 类型为Partial——缺键由英文默认逐键兜底
 */
export default {
  "ooui-copytextlayout-copy": "Көчүрүү",
  "ooui-outline-control-move-down": "Элементти ылдый жылдыруу",
  "ooui-outline-control-move-up": "Элементти өйдө жылдыруу",
  "ooui-outline-control-remove": "Элементти алып салуу",
  "ooui-toolgroup-expand": "Жаюу",
  "ooui-toolgroup-collapse": "Түрүү",
  "ooui-item-remove": "Алып салуу",
  "ooui-dialog-message-accept": "Макул",
  "ooui-dialog-message-reject": "Жокко чыгаруу",
  "ooui-dialog-process-error": "Бир жерден ката кетти",
  "ooui-dialog-process-dismiss": "Баш тартуу",
  "ooui-dialog-process-retry": "Дагы аракет кылып көрүү",
  "ooui-dialog-process-continue": "Улантуу",
  "ooui-combobox-button-label": "Параметрлерди колдонуу/колдонбоо",
  "ooui-selectfile-button-select": "Файлды тандоо",
  "ooui-selectfile-button-select-multiple": "Файлдарды тандоо",
  "ooui-selectfile-placeholder": "Файл тандалган жок",
  "ooui-selectfile-dragdrop-placeholder": "Файлды бул жерге ташыңыз",
  "ooui-selectfile-dragdrop-placeholder-multiple": "Файлдарды бул жерге ташыңыз",
  "ooui-popup-widget-close-button-aria-label": "Жабуу",
  "ooui-field-help": "Жардам",
} satisfies Partial<Record<MessageKey, MessageValue>>;
