import type { MessageKey, MessageValue } from "../i18n";

/**
 * 繁体中文消息包：译文取自原版OOUI dist/i18n/zh-hant.json（0.54.2，译者见原文件@metadata）。
 * 类型为Partial——缺键由英文默认逐键兜底
 */
export default {
  "ooui-copytextlayout-copy": "複製",
  "ooui-outline-control-move-down": "項目下移",
  "ooui-outline-control-move-up": "項目上移",
  "ooui-outline-control-remove": "移除項目",
  "ooui-toolgroup-expand": "更多",
  "ooui-toolgroup-collapse": "更少",
  "ooui-item-remove": "移除",
  "ooui-dialog-message-accept": "確定",
  "ooui-dialog-message-reject": "取消",
  "ooui-dialog-process-error": "發生不明錯誤",
  "ooui-dialog-process-back": "返回",
  "ooui-dialog-process-dismiss": "關閉",
  "ooui-dialog-process-retry": "再試一次",
  "ooui-dialog-process-continue": "繼續",
  "ooui-combobox-button-label": "切換選項",
  "ooui-selectfile-button-select": "選擇一個檔案",
  "ooui-selectfile-button-select-multiple": "選擇多個檔案",
  "ooui-selectfile-placeholder": "尚未選擇檔案",
  "ooui-selectfile-dragdrop-placeholder": "拖曳檔案到此處",
  "ooui-selectfile-dragdrop-placeholder-multiple": "拖曳多個檔案到此處",
  "ooui-popup-widget-close-button-aria-label": "關閉",
  "ooui-field-help": "說明",
} satisfies Partial<Record<MessageKey, MessageValue>>;
