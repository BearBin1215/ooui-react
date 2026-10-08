import type { MessageKey, MessageValue } from "../i18n";

/**
 * 南卢里语消息包：译文取自原版OOUI dist/i18n/luz.json（0.54.2，译者见原文件@metadata）。
 * 类型为Partial——缺键由英文默认逐键兜底
 */
export default {
  "ooui-outline-control-move-down": "انتقال مورد وه دومن",
  "ooui-outline-control-move-up": "انتقال مورد وه بالا",
  "ooui-outline-control-remove": "حذف مورد",
  "ooui-toolgroup-expand": "هنی",
  "ooui-toolgroup-collapse": "کم تر",
  "ooui-dialog-message-accept": "خووه",
  "ooui-dialog-message-reject": "لغو",
  "ooui-dialog-process-error": "یه چیایی اشتباه ویده",
  "ooui-dialog-process-dismiss": "منفصل کردن",
  "ooui-dialog-process-retry": "دوباره تلاش کردن",
  "ooui-dialog-process-continue": "ادامه دائن",
  "ooui-selectfile-placeholder": "فایلی انتخاب نوابیه",
} satisfies Partial<Record<MessageKey, MessageValue>>;
