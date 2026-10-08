import type { MessageKey, MessageValue } from "../i18n";

/**
 * 低地苏格兰语消息包：译文取自原版OOUI dist/i18n/sco.json（0.54.2，译者见原文件@metadata）。
 * 类型为Partial——缺键由英文默认逐键兜底
 */
export default {
  "ooui-outline-control-move-down": "Muiv item doon",
  "ooui-outline-control-move-up": "Muiv item up",
  "ooui-outline-control-remove": "Remuiv item",
  "ooui-toolgroup-expand": "Mair",
  "ooui-toolgroup-collapse": "Less",
  "ooui-dialog-message-accept": "OK",
  "ooui-dialog-message-reject": "Cancel",
  "ooui-dialog-process-error": "Sommit went wrang",
  "ooui-dialog-process-dismiss": "Close",
  "ooui-dialog-process-retry": "Try again",
  "ooui-dialog-process-continue": "Conteena",
  "ooui-selectfile-placeholder": "Nae file selectit",
} satisfies Partial<Record<MessageKey, MessageValue>>;
