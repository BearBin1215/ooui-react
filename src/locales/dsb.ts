import type { MessageKey, MessageValue } from "../i18n";

/**
 * 下索布语消息包：译文取自原版OOUI dist/i18n/dsb.json（0.54.2，译者见原文件@metadata）。
 * 类型为Partial——缺键由英文默认逐键兜底
 */
export default {
  "ooui-outline-control-move-down": "Element dołoj pśesunuś",
  "ooui-outline-control-move-up": "Element górjej pśesunuś",
  "ooui-outline-control-remove": "Zapisk wótpóraś",
} satisfies Partial<Record<MessageKey, MessageValue>>;
