import type { MessageKey, MessageValue } from "../i18n";

/**
 * 拉基语消息包：译文取自原版OOUI dist/i18n/lki.json（0.54.2，译者见原文件@metadata）。
 * 类型为Partial——缺键由英文默认逐键兜底
 */
export default {
  "ooui-outline-control-move-down": "جاوواز کردن ئإ هووار",
  "ooui-outline-control-move-up": "جاوواز کردن ئإ بِلِنگ",
  "ooui-outline-control-remove": "حذف مورد",
  "ooui-toolgroup-expand": "ویشتر/فرۀتر",
  "ooui-toolgroup-collapse": "کۀمتر",
  "ooui-dialog-message-accept": "خوو/ باشد",
  "ooui-dialog-message-reject": "ئآهووسانن/لغو",
  "ooui-dialog-process-error": "مشکلی هۀس",
  "ooui-dialog-process-dismiss": "رد کردن",
  "ooui-dialog-process-retry": "دووآرۀ تلاش کۀ",
  "ooui-dialog-process-continue": "ادامه-دؤم گرتن",
  "ooui-selectfile-button-select": "فایلئ انتخاب کۀ",
  "ooui-selectfile-placeholder": "هیچ پرونده‌ای انتخاب نشده است",
  "ooui-selectfile-dragdrop-placeholder": "فایل را اینجا رها کنید",
} satisfies Partial<Record<MessageKey, MessageValue>>;
