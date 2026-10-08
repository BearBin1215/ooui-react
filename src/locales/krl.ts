import type { MessageKey, MessageValue } from "../i18n";

/**
 * 卡累利阿语消息包：译文取自原版OOUI dist/i18n/krl.json（0.54.2，译者见原文件@metadata）。
 * 类型为Partial——缺键由英文默认逐键兜底
 */
export default {
  "ooui-toolgroup-expand": "Enämpi",
  "ooui-toolgroup-collapse": "Vähempi",
} satisfies Partial<Record<MessageKey, MessageValue>>;
