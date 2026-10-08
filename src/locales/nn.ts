import type { MessageKey, MessageValue } from "../i18n";

/**
 * 新挪威语消息包：译文取自原版OOUI dist/i18n/nn.json（0.54.2，译者见原文件@metadata）。
 * 类型为Partial——缺键由英文默认逐键兜底
 */
export default {
  "ooui-outline-control-move-down": "Flytt element ned",
  "ooui-outline-control-move-up": "Flytt element opp",
  "ooui-toolgroup-expand": "Meir",
  "ooui-toolgroup-collapse": "Færre",
  "ooui-dialog-message-reject": "Bryt av",
  "ooui-dialog-process-error": "Noko gjekk gale",
  "ooui-dialog-process-dismiss": "Lat att",
  "ooui-dialog-process-continue": "Hald fram",
  "ooui-selectfile-button-select": "Vel ei fil",
  "ooui-selectfile-placeholder": "Inga fil er vald",
  "ooui-selectfile-dragdrop-placeholder": "Slepp fil her",
  "ooui-selectfile-dragdrop-placeholder-multiple": "Slepp filer her",
} satisfies Partial<Record<MessageKey, MessageValue>>;
