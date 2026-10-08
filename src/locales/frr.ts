import type { MessageKey, MessageValue } from "../i18n";

/**
 * 北弗里西亚语消息包：译文取自原版OOUI dist/i18n/frr.json（0.54.2，译者见原文件@metadata）。
 * 类型为Partial——缺键由英文默认逐键兜底
 */
export default {
  "ooui-outline-control-move-down": "Element efter onern sküüw",
  "ooui-outline-control-move-up": "Element efter boowen sküüw",
  "ooui-outline-control-remove": "Element wechnem",
} satisfies Partial<Record<MessageKey, MessageValue>>;
