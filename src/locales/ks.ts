import type { MessageKey, MessageValue } from "../i18n";

/**
 * 克什米尔语消息包：译文取自原版OOUI dist/i18n/ks.json（0.54.2，译者见原文件@metadata）。
 * 类型为Partial——缺键由英文默认逐键兜底
 */
export default {
  "ooui-toolgroup-expand": "مٔزیٖد",
  "ooui-item-remove": "ہَٹٲوِو",
  "ooui-dialog-message-accept": "ٹھیٖک چھُ",
  "ooui-dialog-message-reject": "مَنسوٗخ",
  "ooui-dialog-process-error": "کیٚنٛہہ تام گو غَلط",
  "ooui-dialog-process-dismiss": "مَنسوٗخ",
  "ooui-dialog-process-retry": "بیٚیہِ کٔرِو کوشِش",
  "ooui-dialog-process-continue": "جأری تھٲوِو",
  "ooui-selectfile-button-select": "فَیِل کٔرِو مُنتَخٕب",
  "ooui-selectfile-button-select-multiple": "فَیِلہٕ کٔرِو مُنتَخٕب",
  "ooui-popup-widget-close-button-aria-label": "بَنٛد",
  "ooui-field-help": "مَدَتھ",
} satisfies Partial<Record<MessageKey, MessageValue>>;
