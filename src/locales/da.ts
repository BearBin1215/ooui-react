import type { MessageKey, MessageValue } from "../i18n";

/**
 * 丹麦语消息包：译文取自原版OOUI dist/i18n/da.json（0.54.2，译者见原文件@metadata）。
 * 类型为Partial——缺键由英文默认逐键兜底
 */
export default {
  "ooui-copytextlayout-copy": "Kopiér",
  "ooui-outline-control-move-down": "Flyt ned",
  "ooui-outline-control-move-up": "Flyt op",
  "ooui-outline-control-remove": "Fjern element",
  "ooui-toolgroup-expand": "Mere",
  "ooui-toolgroup-collapse": "Færre",
  "ooui-item-remove": "Fjern",
  "ooui-dialog-message-accept": "OK",
  "ooui-dialog-message-reject": "Afbryd",
  "ooui-dialog-process-error": "Noget gik galt",
  "ooui-dialog-process-back": "Tilbage",
  "ooui-dialog-process-dismiss": "Luk",
  "ooui-dialog-process-retry": "Prøv igen",
  "ooui-dialog-process-continue": "Fortsæt",
  "ooui-combobox-button-label": "Vis/skjul muligheder",
  "ooui-selectfile-button-select": "Vælg en fil",
  "ooui-selectfile-button-select-multiple": "Vælg filer",
  "ooui-selectfile-placeholder": "Ingen filer er valgt",
  "ooui-selectfile-dragdrop-placeholder": "Slip fil her",
  "ooui-selectfile-dragdrop-placeholder-multiple": "Slip filer her",
  "ooui-popup-widget-close-button-aria-label": "Luk",
  "ooui-field-help": "Hjælp",
} satisfies Partial<Record<MessageKey, MessageValue>>;
