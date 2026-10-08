import type { MessageKey, MessageValue } from "../i18n";

/**
 * 伊洛卡诺语消息包：译文取自原版OOUI dist/i18n/ilo.json（0.54.2，译者见原文件@metadata）。
 * 类型为Partial——缺键由英文默认逐键兜底
 */
export default {
  "ooui-outline-control-move-down": "Ipababa ti banag",
  "ooui-outline-control-move-up": "Ipangato ti banag",
  "ooui-outline-control-remove": "Ikkaten ti banag",
  "ooui-toolgroup-expand": "Adu pay",
  "ooui-toolgroup-collapse": "Basbassit",
  "ooui-item-remove": "Ikkaten",
  "ooui-dialog-message-accept": "Sige",
  "ooui-dialog-message-reject": "Ukasen",
  "ooui-dialog-process-error": "Adda madi a napasamak",
  "ooui-dialog-process-dismiss": "Pugsayen",
  "ooui-dialog-process-retry": "Padasen manen",
  "ooui-dialog-process-continue": "Agtuloy",
  "ooui-selectfile-button-select": "Agpili iti papeles",
  "ooui-selectfile-placeholder": "Awan ti napili a papeles",
  "ooui-selectfile-dragdrop-placeholder": "Itinnag ti papeles ditoy",
  "ooui-field-help": "Tulong",
} satisfies Partial<Record<MessageKey, MessageValue>>;
