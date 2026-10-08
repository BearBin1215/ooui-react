import type { MessageKey, MessageValue } from "../i18n";

/**
 * 苏格兰盖尔语消息包：译文取自原版OOUI dist/i18n/gd.json（0.54.2，译者见原文件@metadata）。
 * 类型为Partial——缺键由英文默认逐键兜底
 */
export default {
  "ooui-outline-control-move-down": "Gluais nì sìos",
  "ooui-outline-control-move-up": "Gluais nì suas",
  "ooui-outline-control-remove": "Thoir air falbh an nì",
  "ooui-dialog-message-accept": "Ceart ma-thà",
  "ooui-dialog-message-reject": "Sguir dheth",
} satisfies Partial<Record<MessageKey, MessageValue>>;
