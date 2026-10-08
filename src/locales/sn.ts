import type { MessageKey, MessageValue } from "../i18n";

/**
 * 绍纳语消息包：译文取自原版OOUI dist/i18n/sn.json（0.54.2，译者见原文件@metadata）。
 * 类型为Partial——缺键由英文默认逐键兜底
 */
export default {
  "ooui-copytextlayout-copy": "Chenza",
  "ooui-outline-control-move-down": "Chichinura chinhu kuzasi",
  "ooui-outline-control-move-up": "Chichinura chinhu kumusoro",
  "ooui-outline-control-remove": "Bvisa chinhu",
  "ooui-toolgroup-expand": "Zvimwe",
  "ooui-toolgroup-collapse": "Zvishoma",
  "ooui-item-remove": "Bvisa",
  "ooui-dialog-message-accept": "BHO",
  "ooui-dialog-message-reject": "Dzimura",
  "ooui-dialog-process-error": "Pane chinhu chisina kuita mushe",
  "ooui-dialog-process-dismiss": "Didiritsa",
  "ooui-dialog-process-retry": "Edza zvekare",
  "ooui-dialog-process-continue": "Enderera mberi",
  "ooui-combobox-button-label": "Zvisaruriko zve Toggle",
  "ooui-selectfile-button-select": "Sarudza fayera",
  "ooui-selectfile-button-select-multiple": "Sarudza mafayera",
  "ooui-selectfile-placeholder": "Hapana fayera rasarudzwa",
  "ooui-selectfile-dragdrop-placeholder": "Donhesa fayera pano",
  "ooui-selectfile-dragdrop-placeholder-multiple": "Donhesa mafayera pano",
  "ooui-popup-widget-close-button-aria-label": "Vhara",
  "ooui-field-help": "Rubatsiro",
} satisfies Partial<Record<MessageKey, MessageValue>>;
