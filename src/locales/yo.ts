import type { MessageKey, MessageValue } from "../i18n";

/**
 * 约鲁巴语消息包：译文取自原版OOUI dist/i18n/yo.json（0.54.2，译者见原文件@metadata）。
 * 类型为Partial——缺键由英文默认逐键兜底
 */
export default {
  "ooui-outline-control-move-down": "Sún onítòún sí sàlẹ̀",
  "ooui-outline-control-move-up": "Sún onítòún s'ókè",
} satisfies Partial<Record<MessageKey, MessageValue>>;
