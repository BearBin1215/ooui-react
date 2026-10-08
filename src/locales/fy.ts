import type { MessageKey, MessageValue } from "../i18n";

/**
 * 西弗里西亚语消息包：译文取自原版OOUI dist/i18n/fy.json（0.54.2，译者见原文件@metadata）。
 * 类型为Partial——缺键由英文默认逐键兜底
 */
export default {
  "ooui-outline-control-move-down": "Item leger sette",
  "ooui-outline-control-move-up": "Item heger sette",
  "ooui-outline-control-remove": "Item fuortsmite",
  "ooui-toolgroup-expand": "Mear",
  "ooui-toolgroup-collapse": "Minder",
  "ooui-item-remove": "Fuortsmite",
  "ooui-dialog-message-accept": "OK",
  "ooui-dialog-message-reject": "Annulearje",
  "ooui-dialog-process-error": "Der gong wat mis",
  "ooui-dialog-process-dismiss": "Slute",
  "ooui-dialog-process-retry": "Nochris besykje",
  "ooui-dialog-process-continue": "Fierder",
  "ooui-combobox-button-label": "Opsjes yn-/útskeakelje",
  "ooui-selectfile-button-select": "Bestân selektearje",
  "ooui-selectfile-button-select-multiple": "Bestannen selektearje",
  "ooui-selectfile-placeholder": "Der is gjin bestân selektearre",
  "ooui-selectfile-dragdrop-placeholder": "Bestân hjir delsette",
  "ooui-selectfile-dragdrop-placeholder-multiple": "Bestannen hjir delsette",
  "ooui-popup-widget-close-button-aria-label": "Slute",
  "ooui-field-help": "Help",
} satisfies Partial<Record<MessageKey, MessageValue>>;
