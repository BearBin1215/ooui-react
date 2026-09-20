import type { MessageKey, MessageValue } from "../i18n";

/**
 * 希伯来语消息包：译文取自原版OOUI dist/i18n/he.json（0.54.2，译者见原文件@metadata）。
 * 类型为Partial——缺键由英文默认逐键兜底
 */
export default {
  "ooui-copytextlayout-copy": "העתקה",
  "ooui-outline-control-move-down": "להזיז את הפריט מטה",
  "ooui-outline-control-move-up": "להזיז את הפריט מעלה",
  "ooui-outline-control-remove": "להסיר את הפריט",
  "ooui-toolgroup-expand": "יותר",
  "ooui-toolgroup-collapse": "פחות",
  "ooui-item-remove": "הסרה",
  "ooui-dialog-message-accept": "אישור",
  "ooui-dialog-message-reject": "ביטול",
  "ooui-dialog-process-error": "משהו השתבש",
  "ooui-dialog-process-back": "חזרה",
  "ooui-dialog-process-dismiss": "לוותר",
  "ooui-dialog-process-retry": "לנסות שוב",
  "ooui-dialog-process-continue": "המשך",
  "ooui-combobox-button-label": "אפשרויות החלפה בין מצבים",
  "ooui-selectfile-button-select": "נא לבחור קובץ",
  "ooui-selectfile-button-select-multiple": "בחירת קבצים",
  "ooui-selectfile-placeholder": "לא נבחר שום קובץ",
  "ooui-selectfile-dragdrop-placeholder": "נא לשחרר את הקובץ כאן",
  "ooui-selectfile-dragdrop-placeholder-multiple": "יש לגרור את הקבצים לכאן",
  "ooui-popup-widget-close-button-aria-label": "סגירה",
  "ooui-field-help": "עזרה",
} satisfies Partial<Record<MessageKey, MessageValue>>;
