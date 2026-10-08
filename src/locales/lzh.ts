import type { MessageKey, MessageValue } from "../i18n";

/**
 * 文言文消息包：译文取自原版OOUI dist/i18n/lzh.json（0.54.2，译者见原文件@metadata）。
 * 类型为Partial——缺键由英文默认逐键兜底
 */
export default {
  "ooui-outline-control-move-down": "遷下",
  "ooui-outline-control-move-up": "遷上",
  "ooui-outline-control-remove": "去物",
  "ooui-dialog-message-accept": "可",
  "ooui-dialog-message-reject": "棄",
} satisfies Partial<Record<MessageKey, MessageValue>>;
