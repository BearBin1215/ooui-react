import type { MessageKey, MessageValue } from "../i18n";

/**
 * 斯瓦希里语消息包：译文取自原版OOUI dist/i18n/sw.json（0.54.2，译者见原文件@metadata）。
 * 类型为Partial——缺键由英文默认逐键兜底
 */
export default {
  "ooui-outline-control-move-down": "Sogeza kipengee chini",
  "ooui-outline-control-move-up": "Sogeza kipengee juu",
  "ooui-outline-control-remove": "Toa kitu",
  "ooui-toolgroup-expand": "Zaidi",
  "ooui-dialog-message-accept": "Sawa",
  "ooui-dialog-message-reject": "Batilisha",
  "ooui-dialog-process-retry": "Jaribu tena",
} satisfies Partial<Record<MessageKey, MessageValue>>;
