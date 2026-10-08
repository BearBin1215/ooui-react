import type { MessageKey, MessageValue } from "../i18n";

/**
 * 芳蒂语消息包：译文取自原版OOUI dist/i18n/fat.json（0.54.2，译者见原文件@metadata）。
 * 类型为Partial——缺键由英文默认逐键兜底
 */
export default {
  "ooui-outline-control-move-down": "Fa adze no kɔ ase",
  "ooui-outline-control-move-up": "Fa kɔ sor",
  "ooui-outline-control-remove": "Yi ndzɛmba no",
  "ooui-toolgroup-expand": "Beberee",
  "ooui-toolgroup-collapse": "Ketseaba",
  "ooui-item-remove": "Yi",
  "ooui-dialog-message-accept": "Nyoo",
  "ooui-dialog-message-reject": "Twa mu",
  "ooui-dialog-process-error": "Biribi annkɔ yie",
  "ooui-dialog-process-dismiss": "Bɔ gu",
  "ooui-dialog-process-retry": "Yɛ bio",
  "ooui-dialog-process-continue": "Tua do",
  "ooui-combobox-button-label": "Ma nkyerɛkyerɛmu no mbra",
  "ooui-selectfile-button-select": "Yi fael bi",
  "ooui-selectfile-button-select-multiple": "Yi files nu",
  "ooui-selectfile-placeholder": "Innyii fael biara",
  "ooui-selectfile-dragdrop-placeholder": "Fa fael no to ha",
  "ooui-selectfile-dragdrop-placeholder-multiple": "Fa fael ahorow to ha",
  "ooui-popup-widget-close-button-aria-label": "Tow mu",
  "ooui-field-help": "Mboa",
} satisfies Partial<Record<MessageKey, MessageValue>>;
