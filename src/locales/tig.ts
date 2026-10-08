import type { MessageKey, MessageValue } from "../i18n";

/**
 * 提格雷语消息包：译文取自原版OOUI dist/i18n/tig.json（0.54.2，译者见原文件@metadata）。
 * 类型为Partial——缺键由英文默认逐键兜底
 */
export default {
  "ooui-copytextlayout-copy": "ቅደሕ",
  "ooui-toolgroup-expand": "ዚያደት",
  "ooui-toolgroup-collapse": "ላሖዳ",
  "ooui-item-remove": "ነውክ",
  "ooui-dialog-message-accept": "ሰኒ",
  "ooui-dialog-message-reject": "አትርፍ",
  "ooui-dialog-process-error": "ገለ ጸገም እትረከባ ሃላ",
  "ooui-dialog-process-dismiss": "ዳግን",
  "ooui-dialog-process-retry": "ካሊእ መረት ጀርቡ",
  "ooui-dialog-process-continue": "ዋስል",
  "ooui-selectfile-button-select": "ፋይል ሕረ",
  "ooui-selectfile-button-select-multiple": "ፋይላት ሕረ",
  "ooui-selectfile-placeholder": "ፋይል ኢትሐራኒ",
  "ooui-selectfile-dragdrop-placeholder": "ፋይል እንዜ ክረ",
  "ooui-selectfile-dragdrop-placeholder-multiple": "ፋይላት እንዜ ክረ",
  "ooui-popup-widget-close-button-aria-label": "ድበእ",
  "ooui-field-help": "ሰዳየት",
} satisfies Partial<Record<MessageKey, MessageValue>>;
