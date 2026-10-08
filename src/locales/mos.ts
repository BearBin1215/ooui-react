import type { MessageKey, MessageValue } from "../i18n";

/**
 * 莫西语消息包：译文取自原版OOUI dist/i18n/mos.json（0.54.2，译者见原文件@metadata）。
 * 类型为Partial——缺键由英文默认逐键兜底
 */
export default {
  "ooui-copytextlayout-copy": "rɩki",
  "ooui-outline-control-move-down": "kedme n sigi",
  "ooui-outline-control-move-up": "Kedme n dʋ",
  "ooui-outline-control-remove": "yɩɩsi bũm",
  "ooui-toolgroup-expand": "Wʋsgo",
  "ooui-toolgroup-collapse": "bɩlfu",
  "ooui-item-remove": "yɩɩsi",
  "ooui-dialog-message-accept": "woo",
  "ooui-dialog-message-reject": "yẽese",
  "ooui-dialog-process-error": "bũmbu maani tɩ ka kêng soma",
  "ooui-dialog-process-dismiss": "base",
  "ooui-dialog-process-retry": "Lèbg m mane",
  "ooui-dialog-process-continue": "Kê tɩ m mane",
  "ooui-combobox-button-label": "Zĩisa yâk rẽ",
  "ooui-selectfile-button-select": "Yâk fisiye",
  "ooui-selectfile-button-select-multiple": "Yâk fisiye ramba",
  "ooui-selectfile-placeholder": "fisiye ka yâk ye",
  "ooui-selectfile-dragdrop-placeholder": "Rɩki fisiye ka",
  "ooui-selectfile-dragdrop-placeholder-multiple": "Rɩki fisiye ramba ka",
  "ooui-popup-widget-close-button-aria-label": "Page",
  "ooui-field-help": "Songré",
} satisfies Partial<Record<MessageKey, MessageValue>>;
