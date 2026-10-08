import type { MessageKey, MessageValue } from "../i18n";

/**
 * 巴乌莱语消息包：译文取自原版OOUI dist/i18n/bci.json（0.54.2，译者见原文件@metadata）。
 * 类型为Partial——缺键由英文默认逐键兜底
 */
export default {
  "ooui-outline-control-move-down": "Fa liké nga fa djra",
  "ooui-outline-control-move-up": "Fa liké nga fa fou nglo",
  "ooui-outline-control-remove": "Nounnoun liké nga",
  "ooui-toolgroup-expand": "Ouflè ékun",
  "ooui-toolgroup-collapse": "Kaan sa",
  "ooui-item-remove": "Yi",
  "ooui-dialog-message-accept": "Kpli'n sou",
  "ooui-dialog-message-reject": "Nan yé i koun",
  "ooui-dialog-process-dismiss": "Djasso sou",
  "ooui-dialog-process-retry": "Yé i ékoun",
  "ooui-dialog-process-continue": "Yé i ékoun",
  "ooui-selectfile-button-select": "Fa floua koun",
  "ooui-selectfile-button-select-multiple": "Fa floua moun",
  "ooui-selectfile-placeholder": "Ba faman floua vié fi",
  "ooui-selectfile-dragdrop-placeholder": "Man floua sou sié i wa",
  "ooui-selectfile-dragdrop-placeholder-multiple": "Man floua mé sou sié bé wa",
  "ooui-popup-widget-close-button-aria-label": "Gni",
  "ooui-field-help": "Oukalè",
} satisfies Partial<Record<MessageKey, MessageValue>>;
