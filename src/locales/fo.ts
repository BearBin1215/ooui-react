import type { MessageKey, MessageValue } from "../i18n";

/**
 * 法罗语消息包：译文取自原版OOUI dist/i18n/fo.json（0.54.2，译者见原文件@metadata）。
 * 类型为Partial——缺键由英文默认逐键兜底
 */
export default {
  "ooui-outline-control-move-down": "Flyt lutin niður",
  "ooui-outline-control-move-up": "Flyt lutin upp",
  "ooui-outline-control-remove": "Tak ein lut burtur",
  "ooui-toolgroup-expand": "Meira",
  "ooui-toolgroup-collapse": "Færri",
  "ooui-dialog-message-accept": "OK",
  "ooui-dialog-message-reject": "Avbrót",
  "ooui-dialog-process-error": "Okkurt gekk galið",
  "ooui-dialog-process-dismiss": "Lat aftur",
  "ooui-dialog-process-retry": "Royn aftur",
  "ooui-dialog-process-continue": "Halt fram",
} satisfies Partial<Record<MessageKey, MessageValue>>;
