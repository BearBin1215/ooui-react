import type { MessageKey, MessageValue } from "../i18n";

/**
 * 吉拉基语消息包：译文取自原版OOUI dist/i18n/glk.json（0.54.2，译者见原文件@metadata）。
 * 类型为Partial——缺键由英文默认逐键兜底
 */
export default {
  "ooui-outline-control-move-down": "مأسمکه جابجا بۊکۊن جير",
  "ooui-outline-control-move-up": "مأسمکه جابجا بۊکۊن جؤر",
  "ooui-outline-control-remove": "مأسمکه حذفأکۊن",
  "ooui-toolgroup-expand": "ويشتر",
  "ooui-toolgroup-collapse": "کمتر",
  "ooui-dialog-message-accept": "خؤ",
  "ooui-dialog-message-reject": "لغو",
  "ooui-dialog-process-error": "ىک مؤشکلي هنأ",
  "ooui-dialog-process-dismiss": "وأبدي",
  "ooui-dialog-process-retry": "هندئه حقسأى بۊکۊنين",
  "ooui-dialog-process-continue": "ايدامه",
  "ooui-selectfile-button-select": "ىکته فاىله دؤجين بۊکۊنين",
  "ooui-selectfile-placeholder": "هيچ فاىلي دؤجين نۊبؤ",
  "ooui-selectfile-dragdrop-placeholder": "فاىله ائره رها بکۊنين",
} satisfies Partial<Record<MessageKey, MessageValue>>;
