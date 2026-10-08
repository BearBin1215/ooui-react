import type { MessageKey, MessageValue } from "../i18n";

/**
 * 塔吉克语（西里尔文）消息包：译文取自原版OOUI dist/i18n/tg-cyrl.json（0.54.2，译者见原文件@metadata）。
 * 类型为Partial——缺键由英文默认逐键兜底
 */
export default {
  "ooui-outline-control-move-down": "Ҳаракати мавод ба поён",
  "ooui-outline-control-move-up": "Ҳаракати мавод ба боло",
  "ooui-outline-control-remove": "Ҳазви мавод",
} satisfies Partial<Record<MessageKey, MessageValue>>;
