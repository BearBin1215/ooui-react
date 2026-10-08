import type { MessageKey, MessageValue } from "../i18n";

/**
 * 闽东语（繁体）消息包：译文取自原版OOUI dist/i18n/cdo-hant.json（0.54.2，译者见原文件@metadata）。
 * 类型为Partial——缺键由英文默认逐键兜底
 */
export default {
  "ooui-outline-control-move-down": "下移項目",
  "ooui-outline-control-move-up": "上移項目",
  "ooui-outline-control-remove": "移除項目",
  "ooui-toolgroup-expand": "更価",
  "ooui-toolgroup-collapse": "更少",
  "ooui-dialog-message-accept": "確定",
  "ooui-dialog-message-reject": "取消",
  "ooui-dialog-process-error": "什乇出毛病了",
  "ooui-dialog-process-dismiss": "關閉",
  "ooui-dialog-process-retry": "再試",
  "ooui-dialog-process-continue": "繼續",
  "ooui-selectfile-button-select": "選擇蜀萆文件",
  "ooui-selectfile-placeholder": "未選文件",
  "ooui-selectfile-dragdrop-placeholder": "共文件拖遘嚽塊",
} satisfies Partial<Record<MessageKey, MessageValue>>;
