import type { MessageKey, MessageValue } from "../i18n";

/**
 * 中库尔德语消息包：译文取自原版OOUI dist/i18n/ckb.json（0.54.2，译者见原文件@metadata）。
 * 类型为Partial——缺键由英文默认逐键兜底
 */
export default {
  "ooui-copytextlayout-copy": "لەبەرگرتنەوە",
  "ooui-toolgroup-expand": "زیاتر",
  "ooui-toolgroup-collapse": "کەمتر",
  "ooui-item-remove": "لابردن",
  "ooui-dialog-message-accept": "باشە",
  "ooui-dialog-message-reject": "پاشگەزبوونەوە",
  "ooui-dialog-process-error": "ھەڵەیەک ڕووی داوە",
  "ooui-dialog-process-dismiss": "لێگەڕان",
  "ooui-dialog-process-retry": "دیسان ھەوڵ بدە",
  "ooui-dialog-process-continue": "درێژە بدە",
  "ooui-combobox-button-label": "ھەڵبژاردەکانی زمانە",
  "ooui-selectfile-button-select": "پەڕگەیەک دەستنیشان بکە",
  "ooui-selectfile-button-select-multiple": "پەڕگەکان ھەڵبژێرە",
  "ooui-selectfile-placeholder": "ھیچ فایلێک ھەڵنەبژێراوە",
  "ooui-selectfile-dragdrop-placeholder": "پەڕگەکان بخەرە ئێرە",
  "ooui-selectfile-dragdrop-placeholder-multiple": "پەڕگەکان بخەرە ئێرە",
  "ooui-popup-widget-close-button-aria-label": "دای بخە",
  "ooui-field-help": "یارمەتی",
} satisfies Partial<Record<MessageKey, MessageValue>>;
