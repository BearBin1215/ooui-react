import type { MessageKey, MessageValue } from "../i18n";

/**
 * 荷兰语消息包：译文取自原版OOUI dist/i18n/nl.json（0.54.2，译者见原文件@metadata）。
 * 类型为Partial——缺键由英文默认逐键兜底
 */
export default {
  "ooui-copytextlayout-copy": "Kopiëren",
  "ooui-outline-control-move-down": "Item omlaag verplaatsen",
  "ooui-outline-control-move-up": "Item omhoog verplaatsen",
  "ooui-outline-control-remove": "Item verwijderen",
  "ooui-toolgroup-expand": "Meer",
  "ooui-toolgroup-collapse": "Minder",
  "ooui-item-remove": "Verwijderen",
  "ooui-dialog-message-accept": "OK",
  "ooui-dialog-message-reject": "Annuleren",
  "ooui-dialog-process-error": "Er is iets misgegaan",
  "ooui-dialog-process-back": "Terug",
  "ooui-dialog-process-dismiss": "Sluiten",
  "ooui-dialog-process-retry": "Opnieuw proberen",
  "ooui-dialog-process-continue": "Doorgaan",
  "ooui-combobox-button-label": "Opties omschakelen",
  "ooui-selectfile-button-select": "Selecteer een bestand",
  "ooui-selectfile-button-select-multiple": "Bestanden selecteren",
  "ooui-selectfile-placeholder": "Er is geen bestand geselecteerd",
  "ooui-selectfile-dragdrop-placeholder": "Sleep hier een bestand heen",
  "ooui-selectfile-dragdrop-placeholder-multiple": "Sleep hier bestanden heen",
  "ooui-popup-widget-close-button-aria-label": "Sluiten",
  "ooui-field-help": "Hulp",
} satisfies Partial<Record<MessageKey, MessageValue>>;
