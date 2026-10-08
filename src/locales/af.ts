import type { MessageKey, MessageValue } from "../i18n";

/**
 * 南非荷兰语消息包：译文取自原版OOUI dist/i18n/af.json（0.54.2，译者见原文件@metadata）。
 * 类型为Partial——缺键由英文默认逐键兜底
 */
export default {
  "ooui-outline-control-move-down": "Skuif item af",
  "ooui-outline-control-move-up": "Skuif item op",
  "ooui-outline-control-remove": "Verwyder item",
  "ooui-toolgroup-expand": "Meer",
  "ooui-toolgroup-collapse": "Minder",
  "ooui-item-remove": "Verwyder",
  "ooui-dialog-message-accept": "Regso",
  "ooui-dialog-message-reject": "Kanselleer",
  "ooui-dialog-process-error": "Iets het verkeerd gegaan",
  "ooui-dialog-process-dismiss": "Sluit",
  "ooui-dialog-process-retry": "Probeer weer",
  "ooui-dialog-process-continue": "Gaan voort",
  "ooui-combobox-button-label": "Wissel opsies",
  "ooui-selectfile-button-select": "Kies 'n lêer",
  "ooui-selectfile-placeholder": "Geen lêer is gekies nie",
  "ooui-selectfile-dragdrop-placeholder": "Laat val die lêer hier",
  "ooui-field-help": "Hulp",
} satisfies Partial<Record<MessageKey, MessageValue>>;
