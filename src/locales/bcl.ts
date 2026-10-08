import type { MessageKey, MessageValue } from "../i18n";

/**
 * 中比科尔语消息包：译文取自原版OOUI dist/i18n/bcl.json（0.54.2，译者见原文件@metadata）。
 * 类型为Partial——缺键由英文默认逐键兜底
 */
export default {
  "ooui-copytextlayout-copy": "Kopyahon",
  "ooui-outline-control-move-down": "Balyuhon an aytem paibaba",
  "ooui-outline-control-move-up": "Balyuhon an aytem paitaas",
} satisfies Partial<Record<MessageKey, MessageValue>>;
