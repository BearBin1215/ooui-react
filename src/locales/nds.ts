import type { MessageKey, MessageValue } from "../i18n";

/**
 * 低地德语消息包：译文取自原版OOUI dist/i18n/nds.json（0.54.2，译者见原文件@metadata）。
 * 类型为Partial——缺键由英文默认逐键兜底
 */
export default {
  "ooui-outline-control-move-down": "Element na ünnen schuven",
  "ooui-outline-control-move-up": "Element na baven schuven",
  "ooui-dialog-message-accept": "OK",
  "ooui-dialog-message-reject": "Afbreken",
  "ooui-dialog-process-error": "Do is wat in'e Büx goan",
  "ooui-dialog-process-continue": "Wiedermaken",
  "ooui-selectfile-button-select": "En Datei utwählen",
  "ooui-field-help": "Hülp",
} satisfies Partial<Record<MessageKey, MessageValue>>;
