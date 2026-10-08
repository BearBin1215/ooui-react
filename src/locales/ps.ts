import type { MessageKey, MessageValue } from "../i18n";

/**
 * 普什图语消息包：译文取自原版OOUI dist/i18n/ps.json（0.54.2，译者见原文件@metadata）。
 * 类型为Partial——缺键由英文默认逐键兜底
 */
export default {
  "ooui-copytextlayout-copy": "لمېسل",
  "ooui-outline-control-move-down": "توکی ښکته راوړل",
  "ooui-outline-control-move-up": "توکی پورته راوړل",
  "ooui-outline-control-remove": "توکی غورځول",
  "ooui-toolgroup-expand": "نور",
  "ooui-toolgroup-collapse": "لږ تر لږ",
  "ooui-item-remove": "غورځول",
  "ooui-dialog-message-accept": "ښه",
  "ooui-dialog-message-reject": "ناگارل",
  "ooui-dialog-process-error": "يوه ستونزه رامنځ ته شوه",
  "ooui-dialog-process-back": "پرشاکېدل",
  "ooui-dialog-process-dismiss": "تړل",
  "ooui-dialog-process-retry": "بيا هڅه",
  "ooui-dialog-process-continue": "پرله پورې",
  "ooui-combobox-button-label": "بدلون خوښنې",
  "ooui-selectfile-button-select": "يوه دوتنه وټاکئ",
  "ooui-selectfile-button-select-multiple": "دوتنې ټاکل",
  "ooui-selectfile-placeholder": "کومه دوتنه نه ده ټاکل شوې",
  "ooui-selectfile-dragdrop-placeholder": "دوتنه مو دلته واچوئ",
  "ooui-selectfile-dragdrop-placeholder-multiple": "دوتنې مو دلته واچوئ",
  "ooui-popup-widget-close-button-aria-label": "تړل",
  "ooui-field-help": "لارښود",
} satisfies Partial<Record<MessageKey, MessageValue>>;
