import type { MessageKey, MessageValue } from "../i18n";

/**
 * 波斯语消息包：译文取自原版OOUI dist/i18n/fa.json（0.54.2，译者见原文件@metadata）。
 * 类型为Partial——缺键由英文默认逐键兜底
 */
export default {
  "ooui-copytextlayout-copy": "رونوشت",
  "ooui-outline-control-move-down": "انتقال مورد به پایین",
  "ooui-outline-control-move-up": "انتقال مورد به بالا",
  "ooui-outline-control-remove": "حذف مورد",
  "ooui-toolgroup-expand": "بیشتر",
  "ooui-toolgroup-collapse": "کمتر",
  "ooui-item-remove": "حذف",
  "ooui-dialog-message-accept": "تأیید",
  "ooui-dialog-message-reject": "لغو",
  "ooui-dialog-process-error": "مشکلی وجود دارد",
  "ooui-dialog-process-back": "بازگشت",
  "ooui-dialog-process-dismiss": "رد",
  "ooui-dialog-process-retry": "دوباره امتحان کنید",
  "ooui-dialog-process-continue": "ادامه",
  "ooui-combobox-button-label": "تغییر گزینه‌ها",
  "ooui-selectfile-button-select": "انتخاب یک پرونده",
  "ooui-selectfile-button-select-multiple": "انتخاب پرونده‌ها",
  "ooui-selectfile-placeholder": "هیچ پرونده‌ای انتخاب نشده است",
  "ooui-selectfile-dragdrop-placeholder": "پرونده را اینجا رها کنید",
  "ooui-selectfile-dragdrop-placeholder-multiple": "پرونده‌ها را اینجا رها کنید",
  "ooui-popup-widget-close-button-aria-label": "بستن",
  "ooui-field-help": "راهنما",
} satisfies Partial<Record<MessageKey, MessageValue>>;
