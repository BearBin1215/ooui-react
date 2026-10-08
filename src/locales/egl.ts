import type { MessageKey, MessageValue } from "../i18n";

/**
 * 艾米利亚语消息包：译文取自原版OOUI dist/i18n/egl.json（0.54.2，译者见原文件@metadata）。
 * 类型为Partial——缺键由英文默认逐键兜底
 */
export default {
  "ooui-outline-control-move-down": "Spôsta in bâs",
  "ooui-outline-control-move-up": "Spôsta in êlt",
  "ooui-outline-control-remove": "Armōv l'elemèint",
  "ooui-dialog-message-accept": "'D acòrdi",
  "ooui-dialog-message-reject": "Scanślèr",
} satisfies Partial<Record<MessageKey, MessageValue>>;
