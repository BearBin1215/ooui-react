import type { MessageKey, MessageValue } from "../i18n";

/**
 * 信德语消息包：译文取自原版OOUI dist/i18n/sd.json（0.54.2，译者见原文件@metadata）。
 * 类型为Partial——缺键由英文默认逐键兜底
 */
export default {
  "ooui-copytextlayout-copy": "نقل ڪريو",
  "ooui-outline-control-move-down": "اسم کي هيٺ چوريو",
  "ooui-outline-control-move-up": "اسم کي مٿي چوريو",
  "ooui-outline-control-remove": "اسم هٽايو",
  "ooui-toolgroup-expand": "وڌيڪ",
  "ooui-toolgroup-collapse": "گهٽ تر",
  "ooui-item-remove": "هٽايو",
  "ooui-dialog-message-accept": "ٺيڪ",
  "ooui-dialog-message-reject": "رد",
  "ooui-dialog-process-error": "ڪا غلطي ٿي",
  "ooui-dialog-process-dismiss": "برخواست ڪريو",
  "ooui-dialog-process-retry": "ٻيھر ڪوشش ڪريو",
  "ooui-dialog-process-continue": "جاري رکو",
  "ooui-combobox-button-label": "چارن کي ٽوگل ڪريو",
  "ooui-selectfile-button-select": "ڪو فائيل چونڊِو",
  "ooui-selectfile-button-select-multiple": "فائيل چونڊيو",
  "ooui-selectfile-placeholder": "ڪوبہ فائيل چونڊيو ناھي ويو",
  "ooui-selectfile-dragdrop-placeholder": "فائيل کي هتي ڪيرايو",
  "ooui-selectfile-dragdrop-placeholder-multiple": "فائيل هتي ڪيرايو",
  "ooui-popup-widget-close-button-aria-label": "بند ڪريو",
  "ooui-field-help": "مدد",
} satisfies Partial<Record<MessageKey, MessageValue>>;
