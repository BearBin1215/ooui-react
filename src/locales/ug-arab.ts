import type { MessageKey, MessageValue } from "../i18n";

/**
 * 维吾尔语（阿拉伯文）消息包：译文取自原版OOUI dist/i18n/ug-arab.json（0.54.2，译者见原文件@metadata）。
 * 类型为Partial——缺键由英文默认逐键兜底
 */
export default {
  "ooui-outline-control-move-down": "تۆۋەنگە يۆتكە",
  "ooui-outline-control-move-up": "يۇقۇرىغا يۆتكە",
  "ooui-outline-control-remove": "ئۆچۈر",
  "ooui-toolgroup-expand": "تېخىمۇ كۆپ",
  "ooui-toolgroup-collapse": "ئاز",
  "ooui-item-remove": "چىقىرىۋەت",
  "ooui-dialog-message-accept": "تامام",
  "ooui-dialog-message-reject": "ۋاز كەچ",
  "ooui-dialog-process-error": "نامەلۇم خاتالىق كۆرۈلدى",
  "ooui-dialog-process-dismiss": "چىقىرىۋەت",
  "ooui-dialog-process-retry": "قايتا سىنا",
  "ooui-dialog-process-continue": "داۋاملاشتۇر",
  "ooui-selectfile-button-select": "بىر ھۆججەت تاللا",
  "ooui-selectfile-placeholder": "ھۆججەت تاللانمىدى",
  "ooui-selectfile-dragdrop-placeholder": "ھۆججەتنى بۇ يەرگە تاشلاڭ",
} satisfies Partial<Record<MessageKey, MessageValue>>;
