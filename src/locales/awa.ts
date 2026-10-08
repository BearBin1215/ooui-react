import type { MessageKey, MessageValue } from "../i18n";

/**
 * 阿瓦德语消息包：译文取自原版OOUI dist/i18n/awa.json（0.54.2，译者见原文件@metadata）。
 * 类型为Partial——缺键由英文默认逐键兜底
 */
export default {
  "ooui-copytextlayout-copy": "प्रतिलिपि बनावा जाय",
} satisfies Partial<Record<MessageKey, MessageValue>>;
