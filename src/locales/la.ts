import type { MessageKey, MessageValue } from "../i18n";

/**
 * 拉丁语消息包：译文取自原版OOUI dist/i18n/la.json（0.54.2，译者见原文件@metadata）。
 * 类型为Partial——缺键由英文默认逐键兜底
 */
export default {
  "ooui-toolgroup-expand": "Plus",
  "ooui-toolgroup-collapse": "Paucior",
  "ooui-dialog-message-accept": "Assentior",
  "ooui-dialog-message-reject": "Dimittere",
  "ooui-dialog-process-dismiss": "Dimittere",
  "ooui-dialog-process-retry": "Retemptare",
  "ooui-dialog-process-continue": "Pergere",
  "ooui-field-help": "Auxilium",
} satisfies Partial<Record<MessageKey, MessageValue>>;
