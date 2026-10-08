import type { MessageKey, MessageValue } from "../i18n";

/**
 * 瓦瑞语消息包：译文取自原版OOUI dist/i18n/war.json（0.54.2，译者见原文件@metadata）。
 * 类型为Partial——缺键由英文默认逐键兜底
 */
export default {
  "ooui-outline-control-move-down": "Ibalhin paubos",
  "ooui-outline-control-move-up": "Ibalhin paigbaw",
  "ooui-outline-control-remove": "Tanggala",
  "ooui-toolgroup-expand": "Damo pa",
  "ooui-toolgroup-collapse": "Guruguti",
  "ooui-dialog-message-accept": "OK",
  "ooui-dialog-message-reject": "Igpabaliwaray",
  "ooui-dialog-process-error": "Mayda sayop nga nahitabo",
  "ooui-dialog-process-retry": "Utroha",
  "ooui-dialog-process-continue": "Padayon",
  "ooui-selectfile-button-select": "Pagpili hin file",
} satisfies Partial<Record<MessageKey, MessageValue>>;
