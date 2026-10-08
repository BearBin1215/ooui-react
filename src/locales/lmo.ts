import type { MessageKey, MessageValue } from "../i18n";

/**
 * 伦巴第语消息包：译文取自原版OOUI dist/i18n/lmo.json（0.54.2，译者见原文件@metadata）。
 * 类型为Partial——缺键由英文默认逐键兜底
 */
export default {
  "ooui-copytextlayout-copy": "Copia",
  "ooui-outline-control-move-down": "Sposta in sgiò",
  "ooui-outline-control-move-up": "Sposta in alt",
  "ooui-outline-control-remove": "Toeu via l'element",
  "ooui-toolgroup-expand": "Pussee",
  "ooui-toolgroup-collapse": "De men",
  "ooui-item-remove": "Toeu via",
  "ooui-dialog-message-accept": "Va ben",
  "ooui-dialog-message-reject": "Anulla",
  "ooui-dialog-process-error": "Un quaicoss l'è andad mal",
  "ooui-dialog-process-dismiss": "Bandona",
  "ooui-dialog-process-retry": "Proeuvegh de noeuv",
  "ooui-dialog-process-continue": "Va inanz",
  "ooui-combobox-button-label": "Mostra/scond i opzion",
  "ooui-selectfile-button-select": "Cata foeura un fail",
  "ooui-selectfile-button-select-multiple": "Cata foeura di fail",
  "ooui-selectfile-placeholder": "Nissun fail l'è selezzionad",
  "ooui-selectfile-dragdrop-placeholder": "Met via i fail chichinscì",
  "ooui-selectfile-dragdrop-placeholder-multiple": "Met via i fail chichinscì",
  "ooui-popup-widget-close-button-aria-label": "Sara su",
  "ooui-field-help": "Ajut",
} satisfies Partial<Record<MessageKey, MessageValue>>;
