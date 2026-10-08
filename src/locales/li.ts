import type { MessageKey, MessageValue } from "../i18n";

/**
 * 林堡语消息包：译文取自原版OOUI dist/i18n/li.json（0.54.2，译者见原文件@metadata）。
 * 类型为Partial——缺键由英文默认逐键兜底
 */
export default {
  "ooui-outline-control-move-down": "Item nao ónger verplaatse",
  "ooui-outline-control-move-up": "Item nao bove verplaetse",
  "ooui-outline-control-remove": "Item ewegsjaffe",
  "ooui-toolgroup-expand": "Mieë",
  "ooui-toolgroup-collapse": "Minder",
  "ooui-item-remove": "Sjaf eweg",
  "ooui-dialog-message-accept": "Ok",
  "ooui-dialog-message-reject": "Aafbraeke",
  "ooui-dialog-process-error": "Dao is get misgegange",
  "ooui-dialog-process-dismiss": "Sjlete",
  "ooui-dialog-process-retry": "Perbeer obbenuujts",
  "ooui-dialog-process-continue": "Doorgaon",
  "ooui-selectfile-button-select": "Kees e bestandj",
  "ooui-selectfile-placeholder": "Dao is gein besjtandj geselekteerd",
  "ooui-selectfile-dragdrop-placeholder": "Sleip e bestandj hieroppes",
} satisfies Partial<Record<MessageKey, MessageValue>>;
