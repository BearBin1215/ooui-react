import type { MessageKey, MessageValue } from "../i18n";

/**
 * 奥克语消息包：译文取自原版OOUI dist/i18n/oc.json（0.54.2，译者见原文件@metadata）。
 * 类型为Partial——缺键由英文默认逐键兜底
 */
export default {
  "ooui-copytextlayout-copy": "Copiar",
  "ooui-outline-control-move-down": "Far davalar l’element",
  "ooui-outline-control-move-up": "Far montar l’element",
  "ooui-outline-control-remove": "Suprimir l’element",
  "ooui-toolgroup-expand": "Mai",
  "ooui-toolgroup-collapse": "Mens",
  "ooui-dialog-message-accept": "D'acòrdi",
  "ooui-dialog-message-reject": "Anullar",
  "ooui-dialog-process-error": "Quicòm a trucat",
  "ooui-dialog-process-dismiss": "Regetar",
  "ooui-dialog-process-retry": "Ensajatz tornamai",
  "ooui-dialog-process-continue": "Contunhar",
  "ooui-combobox-button-label": "Capvirar las opcions",
  "ooui-selectfile-button-select": "Seleccionar un fichièr",
  "ooui-selectfile-placeholder": "Cap de fichièr pas seleccionat",
  "ooui-selectfile-dragdrop-placeholder": "Depausar lo fichièr aicí",
  "ooui-field-help": "Ajuda",
} satisfies Partial<Record<MessageKey, MessageValue>>;
