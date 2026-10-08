import type { MessageKey, MessageValue } from "../i18n";

/**
 * 撒奇莱雅语消息包：译文取自原版OOUI dist/i18n/szy.json（0.54.2，译者见原文件@metadata）。
 * 类型为Partial——缺键由英文默认逐键兜底
 */
export default {
  "ooui-outline-control-move-down": "miliad kasacacay tasasa’",
  "ooui-outline-control-move-up": "miliad kasacacay tapabaw",
  "ooui-outline-control-remove": "misipu kasacacay",
  "ooui-toolgroup-expand": "yadah",
  "ooui-toolgroup-collapse": "ma’ngadis mangalep",
  "ooui-item-remove": "milimad",
  "ooui-dialog-message-accept": "malucekay",
  "ooui-dialog-message-reject": "palawpes",
  "ooui-dialog-process-error": "tahkal ku caykapulitaay a mungangaw",
  "ooui-dialog-process-dismiss": "edeben",
  "ooui-dialog-process-retry": "pitaneng henay aca",
  "ooui-dialog-process-continue": "palalid",
  "ooui-selectfile-button-select": "mipili’ cacay a tangan",
  "ooui-selectfile-placeholder": "caay henay mipili’ tu tangan",
  "ooui-selectfile-dragdrop-placeholder": "mutengteng tangan katukuh itini",
} satisfies Partial<Record<MessageKey, MessageValue>>;
