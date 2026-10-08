import type { MessageKey, MessageValue } from "../i18n";

/**
 * 通用语消息包：译文取自原版OOUI dist/i18n/lfn.json（0.54.2，译者见原文件@metadata）。
 * 类型为Partial——缺键由英文默认逐键兜底
 */
export default {
  "ooui-copytextlayout-copy": "Copia",
  "ooui-toolgroup-expand": "Plu",
  "ooui-toolgroup-collapse": "Min",
  "ooui-dialog-message-reject": "Cansela",
  "ooui-dialog-process-dismiss": "Dejeta",
  "ooui-dialog-process-retry": "Atenta denova",
  "ooui-dialog-process-continue": "Continua",
  "ooui-selectfile-button-select": "Eleje un fix",
  "ooui-selectfile-button-select-multiple": "Eleje fixes",
  "ooui-selectfile-placeholder": "No fix es elejeda",
  "ooui-popup-widget-close-button-aria-label": "Clui",
  "ooui-field-help": "Aida",
} satisfies Partial<Record<MessageKey, MessageValue>>;
