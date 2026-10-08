import type { MessageKey, MessageValue } from "../i18n";

/**
 * 世界语消息包：译文取自原版OOUI dist/i18n/eo.json（0.54.2，译者见原文件@metadata）。
 * 类型为Partial——缺键由英文默认逐键兜底
 */
export default {
  "ooui-copytextlayout-copy": "Kopii",
  "ooui-outline-control-move-down": "Movi eron suben",
  "ooui-outline-control-move-up": "Movi eron supren",
  "ooui-outline-control-remove": "Forigi eron",
  "ooui-toolgroup-expand": "Pli",
  "ooui-toolgroup-collapse": "Malpli",
  "ooui-item-remove": "Forigi",
  "ooui-dialog-message-accept": "Bone",
  "ooui-dialog-message-reject": "Nuligi",
  "ooui-dialog-process-error": "Io misfunkciis",
  "ooui-dialog-process-dismiss": "Fermi",
  "ooui-dialog-process-retry": "Reprovi",
  "ooui-dialog-process-continue": "Daŭrigi",
  "ooui-combobox-button-label": "Baskuligi opciojn",
  "ooui-selectfile-button-select": "Elekti dosieron",
  "ooui-selectfile-button-select-multiple": "Elekti dosierojn",
  "ooui-selectfile-placeholder": "Neniu dosiero elektita",
  "ooui-selectfile-dragdrop-placeholder": "Demetu la dosieron ĉi tie",
  "ooui-selectfile-dragdrop-placeholder-multiple": "Demetu dosierojn ĉi tie",
  "ooui-popup-widget-close-button-aria-label": "Fermi",
  "ooui-field-help": "Helpo",
} satisfies Partial<Record<MessageKey, MessageValue>>;
