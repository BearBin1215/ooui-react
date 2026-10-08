import type { MessageKey, MessageValue } from "../i18n";

/**
 * 索马里语消息包：译文取自原版OOUI dist/i18n/so.json（0.54.2，译者见原文件@metadata）。
 * 类型为Partial——缺键由英文默认逐键兜底
 */
export default {
  "ooui-copytextlayout-copy": "Nuqul",
  "ooui-outline-control-move-down": "Hoos u dhaqaaji shayga",
  "ooui-outline-control-move-up": "Kor u dhaqaaji shayga",
  "ooui-outline-control-remove": "Ka saar shayga",
  "ooui-toolgroup-expand": "Dheeraad",
  "ooui-toolgroup-collapse": "Ka yar",
  "ooui-item-remove": "Ka saar",
  "ooui-dialog-message-accept": "Hagaag",
  "ooui-dialog-message-reject": "Jooji",
  "ooui-dialog-process-error": "Wax baa qaldamay",
  "ooui-dialog-process-back": "Dib u noqo",
  "ooui-dialog-process-dismiss": "Xir",
  "ooui-dialog-process-retry": "Mar kale isku day",
  "ooui-dialog-process-continue": "Sii wad",
  "ooui-combobox-button-label": "Beddel xulashooyinka",
  "ooui-selectfile-button-select": "Dooro fayl",
  "ooui-selectfile-button-select-multiple": "Dooro faylasha",
  "ooui-selectfile-placeholder": "Fayl lama xulan",
  "ooui-selectfile-dragdrop-placeholder": "Faylka halkan ku tuur",
  "ooui-selectfile-dragdrop-placeholder-multiple": "Halkan ku soo rid faylasha",
  "ooui-popup-widget-close-button-aria-label": "Xir",
  "ooui-field-help": "Caawin",
} satisfies Partial<Record<MessageKey, MessageValue>>;
