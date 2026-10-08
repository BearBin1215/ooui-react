import type { MessageKey, MessageValue } from "../i18n";

/**
 * 傣纳语消息包：译文取自原版OOUI dist/i18n/tdd.json（0.54.2，译者见原文件@metadata）。
 * 类型为Partial——缺键由英文默认逐键兜底
 */
export default {
  "ooui-outline-control-move-down": "ᥑᥣᥭᥳ ᥘᥨᥒᥰ ᥚᥣᥭᥱ ᥖᥬᥲ",
  "ooui-outline-control-move-up": "ᥑᥣᥭᥳ ᥑᥪᥢᥲ ᥚᥣᥭᥱ ᥘᥫᥴ",
  "ooui-outline-control-remove": "ᥗᥩᥢᥴ ᥙᥦᥖ ᥟᥢ ᥑᥝᥲ ᥙᥣᥰ",
  "ooui-toolgroup-expand": "ᥘᥛᥴ ᥘᥫᥴ",
  "ooui-toolgroup-collapse": "ᥟᥥᥱ ᥘᥫᥴ",
  "ooui-dialog-message-accept": "ᥟᥨᥝᥱ ᥑᥥᥱ",
  "ooui-dialog-message-reject": "ᥟᥛᥱ ᥞᥥᥖᥱ",
  "ooui-dialog-process-error": "ᥔᥥᥴ ᥟᥢ ᥟᥢ ᥚᥤᥖᥴ ᥙᥫᥒ ᥝᥭᥳ",
  "ooui-dialog-process-dismiss": "ᥘᥨᥖᥴ ᥐᥣᥢ",
  "ooui-dialog-process-retry": "ᥑᥖᥴ ᥓᥬ ᥗᥦᥢᥲ",
  "ooui-dialog-process-continue": "ᥔᥪᥙᥱ ᥘᥣᥲ",
  "ooui-selectfile-button-select": "ᥘᥫᥐ ᥜᥣᥭᥱ",
  "ooui-selectfile-placeholder": "ᥟᥛᥱ ᥘᥭᥲ ᥘᥫᥐ ᥜᥣᥭᥱ ᥔᥒᥴ ᥝᥭᥳ",
  "ooui-selectfile-dragdrop-placeholder": "ᥟᥝ ᥜᥣᥭᥱ ᥔᥬᥱ ᥖᥤ ᥘᥭᥳ",
  "ooui-popup-widget-close-button-aria-label": "ᥞᥙᥴ",
  "ooui-field-help": "ᥓᥩᥭ ᥗᥦᥛᥴ",
} satisfies Partial<Record<MessageKey, MessageValue>>;
