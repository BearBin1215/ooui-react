import type { MessageKey, MessageValue } from "../i18n";

/**
 * 埃尔兹亚语消息包：译文取自原版OOUI dist/i18n/myv.json（0.54.2，译者见原文件@metadata）。
 * 类型为Partial——缺键由英文默认逐键兜底
 */
export default {
  "ooui-toolgroup-expand": "Седе ламо",
  "ooui-toolgroup-collapse": "Седе аламо",
  "ooui-item-remove": "Нардамс",
  "ooui-dialog-message-accept": "Маштови",
  "ooui-dialog-message-reject": "Саемс мекев",
  "ooui-dialog-process-error": "Мезе-бути аволь истя",
  "ooui-dialog-process-retry": "Варчамс одов",
  "ooui-dialog-process-continue": "Поладомс",
  "ooui-selectfile-button-select": "Кочкамс файла",
  "ooui-popup-widget-close-button-aria-label": "Пекстамс",
} satisfies Partial<Record<MessageKey, MessageValue>>;
