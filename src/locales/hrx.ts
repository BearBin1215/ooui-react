import type { MessageKey, MessageValue } from "../i18n";

/**
 * 汉斯立克语消息包：译文取自原版OOUI dist/i18n/hrx.json（0.54.2，译者见原文件@metadata）。
 * 类型为Partial——缺键由英文默认逐键兜底
 */
export default {
  "ooui-toolgroup-expand": "Meahr",
  "ooui-dialog-message-accept": "OK",
  "ooui-dialog-message-reject": "Abbreche",
  "ooui-dialog-process-dismiss": "Ausblenne",
} satisfies Partial<Record<MessageKey, MessageValue>>;
