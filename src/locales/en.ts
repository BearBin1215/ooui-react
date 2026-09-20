import type { MessageKey } from "../i18n";

/**
 * 英文默认消息表：内建基线而非可选语言包（不经OOUIProvider的messages通道，始终参与产物）。
 * 键值对齐原版OOUI dist内联的en消息（0.54.2），是各语言包缺键时的逐键兜底，
 * 故类型取完整Record——漏键即编译期报错；同目录其余语言包类型为Partial
 */
export default {
  "ooui-copytextlayout-copy": "Copy",
  "ooui-outline-control-move-down": "Move item down",
  "ooui-outline-control-move-up": "Move item up",
  "ooui-outline-control-remove": "Remove item",
  "ooui-toolgroup-expand": "More",
  "ooui-toolgroup-collapse": "Fewer",
  "ooui-item-remove": "Remove",
  "ooui-dialog-message-accept": "OK",
  "ooui-dialog-message-reject": "Cancel",
  "ooui-dialog-process-error": "Something went wrong",
  "ooui-dialog-process-back": "Back",
  "ooui-dialog-process-dismiss": "Dismiss",
  "ooui-dialog-process-retry": "Try again",
  "ooui-dialog-process-continue": "Continue",
  "ooui-combobox-button-label": "Toggle options",
  "ooui-selectfile-button-select": "Select a file",
  "ooui-selectfile-button-select-multiple": "Select files",
  "ooui-selectfile-placeholder": "No file is selected",
  "ooui-selectfile-dragdrop-placeholder": "Drop file here",
  "ooui-selectfile-dragdrop-placeholder-multiple": "Drop files here",
  "ooui-popup-widget-close-button-aria-label": "Close",
  "ooui-field-help": "Help",
} satisfies Record<MessageKey, string>;
