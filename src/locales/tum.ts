import type { MessageKey, MessageValue } from "../i18n";

/**
 * 通布卡语消息包：译文取自原版OOUI dist/i18n/tum.json（0.54.2，译者见原文件@metadata）。
 * 类型为Partial——缺键由英文默认逐键兜底
 */
export default {
  "ooui-outline-control-move-down": "Sendezga chinthu pasi",
  "ooui-outline-control-move-up": "Sendezga chinthu mchanya",
  "ooui-outline-control-remove": "Uskapo chinthu",
  "ooui-toolgroup-expand": "Vinandi",
  "ooui-toolgroup-collapse": "Vidoko",
  "ooui-item-remove": "Uskapo",
  "ooui-dialog-message-accept": "Enya",
  "ooui-dialog-message-reject": "Leka",
  "ooui-dialog-process-error": "Chinyake changunangika",
  "ooui-dialog-process-dismiss": "Uskapo",
  "ooui-dialog-process-retry": "Yezganiso",
  "ooui-dialog-process-continue": "Pitilizga",
  "ooui-combobox-button-label": "Oneska visankho",
  "ooui-selectfile-button-select": "Sankhani chinthu",
  "ooui-selectfile-button-select-multiple": "Sankhani vinthu",
  "ooui-selectfile-placeholder": "Palije icho chasankhika",
  "ooui-selectfile-dragdrop-placeholder": "Ikani chinthu pano",
  "ooui-selectfile-dragdrop-placeholder-multiple": "Ikani vinthu pano",
  "ooui-popup-widget-close-button-aria-label": "Jala",
  "ooui-field-help": "Wowili",
} satisfies Partial<Record<MessageKey, MessageValue>>;
