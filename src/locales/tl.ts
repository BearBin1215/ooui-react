import type { MessageKey, MessageValue } from "../i18n";

/**
 * 他加禄语消息包：译文取自原版OOUI dist/i18n/tl.json（0.54.2，译者见原文件@metadata）。
 * 类型为Partial——缺键由英文默认逐键兜底
 */
export default {
  "ooui-outline-control-move-down": "Ilipat ang aytem pababa",
  "ooui-outline-control-move-up": "Ilipat ang aytem pataas",
  "ooui-outline-control-remove": "Tanggalin ang aytem",
  "ooui-toolgroup-expand": "Maraming iba pa",
  "ooui-toolgroup-collapse": "Kakaunti",
  "ooui-dialog-message-accept": "Sige",
  "ooui-dialog-message-reject": "Huwag ituloy",
  "ooui-dialog-process-error": "May pagkakamali",
  "ooui-dialog-process-dismiss": "Isa-isantabi",
  "ooui-dialog-process-retry": "Subuking muli",
  "ooui-dialog-process-continue": "Magpatuloy",
  "ooui-selectfile-placeholder": "Walang piniling file",
} satisfies Partial<Record<MessageKey, MessageValue>>;
