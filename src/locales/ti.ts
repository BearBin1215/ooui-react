import type { MessageKey, MessageValue } from "../i18n";

/**
 * 提格里尼亚语消息包：译文取自原版OOUI dist/i18n/ti.json（0.54.2，译者见原文件@metadata）。
 * 类型为Partial——缺键由英文默认逐键兜底
 */
export default {
  "ooui-copytextlayout-copy": "ቅዳሕ",
  "ooui-outline-control-remove": "ውልቀ ነገር ኣልግስ",
  "ooui-toolgroup-expand": "ተወሳኺ",
  "ooui-toolgroup-collapse": "ዝወሓዱ",
  "ooui-item-remove": "ኣልግስ",
  "ooui-dialog-message-accept": "ሕራይ",
  "ooui-dialog-message-reject": "ኣትርፍ",
  "ooui-dialog-process-error": "ገለ ጸገም ኣጋጢሙ ኣሎ",
  "ooui-dialog-process-dismiss": "ስጎግ",
  "ooui-dialog-process-continue": "ቀጽል",
  "ooui-selectfile-button-select": "ፋይል ምረጽ",
  "ooui-selectfile-button-select-multiple": "ፋይላት ምረጽ",
  "ooui-selectfile-dragdrop-placeholder": "ፋይል ኣብዚ ኣውድቕ",
  "ooui-selectfile-dragdrop-placeholder-multiple": "ፋይላት ኣብዚ ኣውድቕ",
  "ooui-popup-widget-close-button-aria-label": "ዕጸው",
  "ooui-field-help": "ሓገዝ",
} satisfies Partial<Record<MessageKey, MessageValue>>;
