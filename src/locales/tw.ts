import type { MessageKey, MessageValue } from "../i18n";

/**
 * 契维语消息包：译文取自原版OOUI dist/i18n/tw.json（0.54.2，译者见原文件@metadata）。
 * 类型为Partial——缺键由英文默认逐键兜底
 */
export default {
  "ooui-outline-control-move-down": "Pia ade kɔ ase",
  "ooui-outline-control-move-up": "Pia kɔ soro",
  "ooui-outline-control-remove": "Yi biribi fi mu",
  "ooui-toolgroup-expand": "Pii",
  "ooui-toolgroup-collapse": "Kakraa",
  "ooui-item-remove": "Yi",
  "ooui-dialog-message-accept": "Yoo",
  "ooui-dialog-message-reject": "Twa mu",
  "ooui-dialog-process-error": "Bibi ankɔ yie",
  "ooui-dialog-process-dismiss": "Bɔ gu",
  "ooui-dialog-process-retry": "Yɛ bio",
  "ooui-dialog-process-continue": "Kɔso",
  "ooui-combobox-button-label": "Ma nkyerɛkyerɛ mu no nmra",
  "ooui-selectfile-button-select": "Yi file baako",
  "ooui-selectfile-button-select-multiple": "Yi files no",
  "ooui-selectfile-placeholder": "Wo nnfa file bia yɛ",
  "ooui-selectfile-dragdrop-placeholder": "Fa file no to ha",
  "ooui-selectfile-dragdrop-placeholder-multiple": "Fa files no gu ha",
  "ooui-popup-widget-close-button-aria-label": "To mu",
  "ooui-field-help": "Mmoa",
} satisfies Partial<Record<MessageKey, MessageValue>>;
