import type { MessageKey, MessageValue } from "../i18n";

/**
 * 意大利语消息包：译文取自原版OOUI dist/i18n/it.json（0.54.2，译者见原文件@metadata）。
 * 类型为Partial——缺键由英文默认逐键兜底
 */
export default {
  "ooui-copytextlayout-copy": "Copia",
  "ooui-outline-control-move-down": "Sposta in basso",
  "ooui-outline-control-move-up": "Sposta in alto",
  "ooui-outline-control-remove": "Rimuovi elemento",
  "ooui-toolgroup-expand": "Altro",
  "ooui-toolgroup-collapse": "Meno",
  "ooui-item-remove": "Rimuovi",
  "ooui-dialog-message-accept": "OK",
  "ooui-dialog-message-reject": "Annulla",
  "ooui-dialog-process-error": "Qualcosa è andato storto",
  "ooui-dialog-process-back": "Indietro",
  "ooui-dialog-process-dismiss": "Nascondi",
  "ooui-dialog-process-retry": "Riprova",
  "ooui-dialog-process-continue": "Continua",
  "ooui-combobox-button-label": "Cambia opzioni",
  "ooui-selectfile-button-select": "Seleziona un file",
  "ooui-selectfile-button-select-multiple": "Seleziona file",
  "ooui-selectfile-placeholder": "Nessun file è selezionato",
  "ooui-selectfile-dragdrop-placeholder": "Posiziona i file qui",
  "ooui-selectfile-dragdrop-placeholder-multiple": "Posiziona i file qui",
  "ooui-popup-widget-close-button-aria-label": "Chiudi",
  "ooui-field-help": "Aiuto",
} satisfies Partial<Record<MessageKey, MessageValue>>;
