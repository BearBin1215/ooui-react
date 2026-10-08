import type { MessageKey, MessageValue } from "../i18n";

/**
 * 伊多语消息包：译文取自原版OOUI dist/i18n/io.json（0.54.2，译者见原文件@metadata）。
 * 类型为Partial——缺键由英文默认逐键兜底
 */
export default {
  "ooui-outline-control-move-down": "Movar elemento adsube",
  "ooui-outline-control-move-up": "Movar elemento adsupere",
  "ooui-outline-control-remove": "Forigar elemento",
  "ooui-toolgroup-expand": "Plu multa",
  "ooui-toolgroup-collapse": "Min multa",
  "ooui-item-remove": "Eliminar",
  "ooui-dialog-message-accept": "Aplikar",
  "ooui-dialog-message-reject": "Anular",
  "ooui-dialog-process-error": "Ulo faliis",
  "ooui-dialog-process-dismiss": "Celar",
  "ooui-dialog-process-retry": "Riprobar",
  "ooui-dialog-process-continue": "Durigar",
  "ooui-selectfile-button-select": "Selektar dokumento",
  "ooui-selectfile-placeholder": "Nula dokumento selektesis",
  "ooui-selectfile-dragdrop-placeholder": "Pozar dokumento hike",
  "ooui-selectfile-dragdrop-placeholder-multiple": "Pozez arkivi hike",
} satisfies Partial<Record<MessageKey, MessageValue>>;
