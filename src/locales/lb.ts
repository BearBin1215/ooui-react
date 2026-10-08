import type { MessageKey, MessageValue } from "../i18n";

/**
 * 卢森堡语消息包：译文取自原版OOUI dist/i18n/lb.json（0.54.2，译者见原文件@metadata）。
 * 类型为Partial——缺键由英文默认逐键兜底
 */
export default {
  "ooui-copytextlayout-copy": "Kopéieren",
  "ooui-outline-control-move-down": "Element erof réckelen",
  "ooui-outline-control-move-up": "Element erop réckelen",
  "ooui-outline-control-remove": "Element ewechhuelen",
  "ooui-toolgroup-expand": "Méi",
  "ooui-toolgroup-collapse": "Manner",
  "ooui-item-remove": "Ewechhuelen",
  "ooui-dialog-message-accept": "OK",
  "ooui-dialog-message-reject": "Ofbriechen",
  "ooui-dialog-process-error": "Et ass eppes schif gaang",
  "ooui-dialog-process-back": "Zeréck",
  "ooui-dialog-process-dismiss": "Verwerfen",
  "ooui-dialog-process-retry": "Nach eng Kéier probéieren",
  "ooui-dialog-process-continue": "Virufueren",
  "ooui-combobox-button-label": "Optioune wiesselen",
  "ooui-selectfile-button-select": "E Fichier eraussichen",
  "ooui-selectfile-button-select-multiple": "Fichieren eraussichen",
  "ooui-selectfile-placeholder": "Et ass kee Fichier erausgesicht",
  "ooui-selectfile-dragdrop-placeholder": "Fichier hei ofleeën",
  "ooui-selectfile-dragdrop-placeholder-multiple": "Fichieren hei ofleeën",
  "ooui-popup-widget-close-button-aria-label": "Zoumaachen",
  "ooui-field-help": "Hëllef",
} satisfies Partial<Record<MessageKey, MessageValue>>;
