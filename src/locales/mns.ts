import type { MessageKey, MessageValue } from "../i18n";

/**
 * 曼西语消息包：译文取自原版OOUI dist/i18n/mns.json（0.54.2，译者见原文件@metadata）。
 * 类型为Partial——缺键由英文默认逐键兜底
 */
export default {
  "ooui-toolgroup-expand": "Са̄внув",
  "ooui-toolgroup-collapse": "Мосьнув",
  "ooui-item-remove": "Э̄л урен",
  "ooui-dialog-message-accept": "ОК",
  "ooui-dialog-message-reject": "Иӈыт",
  "ooui-popup-widget-close-button-aria-label": "Лап пантэн",
  "ooui-field-help": "Нё̄тмил",
} satisfies Partial<Record<MessageKey, MessageValue>>;
