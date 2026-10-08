import type { MessageKey, MessageValue } from "../i18n";

/**
 * 利维卡累利阿语消息包：译文取自原版OOUI dist/i18n/olo.json（0.54.2，译者见原文件@metadata）。
 * 类型为Partial——缺键由英文默认逐键兜底
 */
export default {
  "ooui-outline-control-move-down": "Siirrä kohteh alah",
  "ooui-outline-control-move-up": "Siirrä kohteh yläh",
  "ooui-outline-control-remove": "Ota kohteh iäre",
  "ooui-toolgroup-expand": "Enämbi",
  "ooui-toolgroup-collapse": "Vähembi",
  "ooui-dialog-message-accept": "OK",
  "ooui-dialog-message-reject": "Hylgiä",
  "ooui-dialog-process-error": "Mitah haireh rodih",
  "ooui-dialog-process-dismiss": "Hylgiä",
  "ooui-dialog-process-retry": "Opi vie",
  "ooui-dialog-process-continue": "Jatka",
  "ooui-selectfile-button-select": "Valliče failu",
  "ooui-selectfile-placeholder": "Failua ei ole vallittu",
  "ooui-selectfile-dragdrop-placeholder": "Kirvota failu täh",
} satisfies Partial<Record<MessageKey, MessageValue>>;
