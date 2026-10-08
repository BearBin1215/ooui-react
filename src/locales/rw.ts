import type { MessageKey, MessageValue } from "../i18n";

/**
 * 卢旺达语消息包：译文取自原版OOUI dist/i18n/rw.json（0.54.2，译者见原文件@metadata）。
 * 类型为Partial——缺键由英文默认逐键兜底
 */
export default {
  "ooui-outline-control-move-down": "Shyira ikintu hasi",
  "ooui-outline-control-move-up": "Shyira ikintu hejuru",
  "ooui-outline-control-remove": "Kuraho ikintu",
  "ooui-toolgroup-expand": "Ibindi",
  "ooui-toolgroup-collapse": "Bike",
  "ooui-item-remove": "Kuraho",
  "ooui-dialog-message-accept": "Yego",
  "ooui-dialog-message-reject": "Guhagarika",
  "ooui-dialog-process-error": "Hari ikintu kitagenze neza",
  "ooui-dialog-process-dismiss": "Kwirukana",
  "ooui-dialog-process-retry": "Ongera ugerageze",
  "ooui-dialog-process-continue": "Komeza",
  "ooui-combobox-button-label": "Hindura amahitamo",
  "ooui-selectfile-button-select": "Hitamo dosiye",
  "ooui-selectfile-button-select-multiple": "Hitamo dosiye",
  "ooui-selectfile-placeholder": "Nta dosiye yatoranyijwe",
  "ooui-selectfile-dragdrop-placeholder": "Shyira dosiye hano",
  "ooui-selectfile-dragdrop-placeholder-multiple": "Shyira dosiye hano",
  "ooui-popup-widget-close-button-aria-label": "Funga",
  "ooui-field-help": "Ubufasha",
} satisfies Partial<Record<MessageKey, MessageValue>>;
