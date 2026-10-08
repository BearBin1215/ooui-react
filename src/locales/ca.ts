import type { MessageKey, MessageValue } from "../i18n";

/**
 * 加泰罗尼亚语消息包：译文取自原版OOUI dist/i18n/ca.json（0.54.2，译者见原文件@metadata）。
 * 类型为Partial——缺键由英文默认逐键兜底
 */
export default {
  "ooui-copytextlayout-copy": "Copia",
  "ooui-outline-control-move-down": "Baixa l'element",
  "ooui-outline-control-move-up": "Puja l'element",
  "ooui-outline-control-remove": "Esborra l'ítem",
  "ooui-toolgroup-expand": "Més",
  "ooui-toolgroup-collapse": "Menys",
  "ooui-item-remove": "Suprimeix",
  "ooui-dialog-message-accept": "D'acord",
  "ooui-dialog-message-reject": "Cancel·la",
  "ooui-dialog-process-error": "Alguna cosa no ha funcionat",
  "ooui-dialog-process-dismiss": "Descarta",
  "ooui-dialog-process-retry": "Torneu-ho a provar",
  "ooui-dialog-process-continue": "Continua",
  "ooui-combobox-button-label": "Commuta les opcions",
  "ooui-selectfile-button-select": "Seleccioneu un fitxer",
  "ooui-selectfile-button-select-multiple": "Selecció de fitxers",
  "ooui-selectfile-placeholder": "No s'ha seleccionat cap fitxer",
  "ooui-selectfile-dragdrop-placeholder": "Deseu els arxius aquí",
  "ooui-selectfile-dragdrop-placeholder-multiple": "Dipositeu els fitxers aquí",
  "ooui-popup-widget-close-button-aria-label": "Tanca",
  "ooui-field-help": "Ajuda",
} satisfies Partial<Record<MessageKey, MessageValue>>;
