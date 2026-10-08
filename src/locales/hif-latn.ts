import type { MessageKey, MessageValue } from "../i18n";

/**
 * 斐济印地语消息包：译文取自原版OOUI dist/i18n/hif-latn.json（0.54.2，译者见原文件@metadata）。
 * 类型为Partial——缺键由英文默认逐键兜底
 */
export default {
  "ooui-outline-control-move-down": "Item ke niche karo",
  "ooui-outline-control-move-up": "Item ke uppar karo",
  "ooui-outline-control-remove": "Item ke hatao",
  "ooui-toolgroup-expand": "Aur",
  "ooui-toolgroup-collapse": "Kamtii",
  "ooui-dialog-message-reject": "Cancel karo",
  "ooui-dialog-process-error": "Koi chij wrong hoe gais",
  "ooui-dialog-process-dismiss": "Dismiss karo",
  "ooui-dialog-process-retry": "Fir se try karo",
  "ooui-selectfile-button-select": "Ek file ke select karo",
  "ooui-selectfile-placeholder": "Koi file ke nai select karaa gais hai",
  "ooui-selectfile-dragdrop-placeholder": "Hian pe file ke girao",
} satisfies Partial<Record<MessageKey, MessageValue>>;
