import type { MessageKey, MessageValue } from "../i18n";

/**
 * 巴斯克语消息包：译文取自原版OOUI dist/i18n/eu.json（0.54.2，译者见原文件@metadata）。
 * 类型为Partial——缺键由英文默认逐键兜底
 */
export default {
  "ooui-copytextlayout-copy": "Kopiatu",
  "ooui-outline-control-move-down": "Mugitu itema beherantz",
  "ooui-outline-control-move-up": "Mugitu itema gorantz",
  "ooui-outline-control-remove": "Elementua kendu",
  "ooui-toolgroup-expand": "Gehiago",
  "ooui-toolgroup-collapse": "Gutxiago",
  "ooui-item-remove": "Ezabatu",
  "ooui-dialog-message-accept": "Ados",
  "ooui-dialog-message-reject": "Utzi",
  "ooui-dialog-process-error": "Zerbaitek huts egin du",
  "ooui-dialog-process-dismiss": "Utzi",
  "ooui-dialog-process-retry": "Saiatu berriro",
  "ooui-dialog-process-continue": "Jarraitu",
  "ooui-selectfile-button-select": "Fitxategi bat aukeratu",
  "ooui-selectfile-placeholder": "Ez da fitxategirik hautatu",
  "ooui-selectfile-dragdrop-placeholder": "Fitxategia hemen utzi",
  "ooui-selectfile-dragdrop-placeholder-multiple": "Fitxategiak hemen utzi",
  "ooui-field-help": "Laguntza",
} satisfies Partial<Record<MessageKey, MessageValue>>;
