import type { MessageKey, MessageValue } from "../i18n";

/**
 * 国际辅助语消息包：译文取自原版OOUI dist/i18n/ia.json（0.54.2，译者见原文件@metadata）。
 * 类型为Partial——缺键由英文默认逐键兜底
 */
export default {
  "ooui-copytextlayout-copy": "Copiar",
  "ooui-outline-control-move-down": "Displaciar elemento in basso",
  "ooui-outline-control-move-up": "Displaciar elemento in alto",
  "ooui-outline-control-remove": "Remover elemento",
  "ooui-toolgroup-expand": "Plus",
  "ooui-toolgroup-collapse": "Minus",
  "ooui-item-remove": "Remover",
  "ooui-dialog-message-accept": "OK",
  "ooui-dialog-message-reject": "Cancellar",
  "ooui-dialog-process-error": "Qualcosa ha vadite mal",
  "ooui-dialog-process-back": "Retro",
  "ooui-dialog-process-dismiss": "Clauder",
  "ooui-dialog-process-retry": "Reprobar",
  "ooui-dialog-process-continue": "Continuar",
  "ooui-combobox-button-label": "Commutar optiones",
  "ooui-selectfile-button-select": "Selige un file",
  "ooui-selectfile-button-select-multiple": "Seliger files",
  "ooui-selectfile-placeholder": "Nulle file es seligite",
  "ooui-selectfile-dragdrop-placeholder": "Depone file hic",
  "ooui-selectfile-dragdrop-placeholder-multiple": "Depone files hic",
  "ooui-popup-widget-close-button-aria-label": "Clauder",
  "ooui-field-help": "Adjuta",
} satisfies Partial<Record<MessageKey, MessageValue>>;
