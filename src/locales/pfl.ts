import type { MessageKey, MessageValue } from "../i18n";

/**
 * 普法尔茨德语消息包：译文取自原版OOUI dist/i18n/pfl.json（0.54.2，译者见原文件@metadata）。
 * 类型为Partial——缺键由英文默认逐键兜底
 */
export default {
  "ooui-outline-control-move-down": "Bweeschs nunna",
  "ooui-outline-control-move-up": "Bweeschs nuff",
  "ooui-outline-control-remove": "Leschs",
  "ooui-dialog-message-accept": "OK",
  "ooui-dialog-message-reject": "Abbresche",
} satisfies Partial<Record<MessageKey, MessageValue>>;
