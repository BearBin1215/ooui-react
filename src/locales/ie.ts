import type { MessageKey, MessageValue } from "../i18n";

/**
 * 国际语消息包：译文取自原版OOUI dist/i18n/ie.json（0.54.2，译者见原文件@metadata）。
 * 类型为Partial——缺键由英文默认逐键兜底
 */
export default {
  "ooui-outline-control-move-down": "Mover element a infra",
  "ooui-outline-control-move-up": "Mover element a supra",
  "ooui-field-help": "Auxilie",
} satisfies Partial<Record<MessageKey, MessageValue>>;
