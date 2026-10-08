import type { MessageKey, MessageValue } from "../i18n";

/**
 * 阿尔巴尼亚语消息包：译文取自原版OOUI dist/i18n/sq.json（0.54.2，译者见原文件@metadata）。
 * 类型为Partial——缺键由英文默认逐键兜底
 */
export default {
  "ooui-outline-control-move-down": "Zbriteni objektin poshtë",
  "ooui-outline-control-move-up": "Ngjiteni objektin sipër",
  "ooui-outline-control-remove": "Hiqeni objektin",
  "ooui-toolgroup-expand": "Shfaq tërë listën",
  "ooui-toolgroup-collapse": "Ngushto listën",
  "ooui-item-remove": "Hiqeni",
  "ooui-dialog-message-accept": "OK",
  "ooui-dialog-message-reject": "Anulojeni",
  "ooui-dialog-process-error": "Diçka shkoi keq",
  "ooui-dialog-process-dismiss": "Hidhe tej",
  "ooui-dialog-process-retry": "Riprovoni",
  "ooui-dialog-process-continue": "Vazhdo",
  "ooui-combobox-button-label": "Shfaq/fshih mundësitë",
  "ooui-selectfile-button-select": "Përzgjidhni një kartelë",
  "ooui-selectfile-button-select-multiple": "Përzgjidhni kartelat",
  "ooui-selectfile-placeholder": "Nuk është përzgjedhur kartelë",
  "ooui-selectfile-dragdrop-placeholder": "Hidheni kartelën këtu",
  "ooui-selectfile-dragdrop-placeholder-multiple": "Hidhini kartelat këtu",
  "ooui-popup-widget-close-button-aria-label": "Mbylle",
  "ooui-field-help": "Ndihmë",
} satisfies Partial<Record<MessageKey, MessageValue>>;
