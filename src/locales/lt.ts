import type { MessageKey, MessageValue } from "../i18n";

/**
 * 立陶宛语消息包：译文取自原版OOUI dist/i18n/lt.json（0.54.2，译者见原文件@metadata）。
 * 类型为Partial——缺键由英文默认逐键兜底
 */
export default {
  "ooui-copytextlayout-copy": "Kopijuoti",
  "ooui-outline-control-move-down": "Perkelti elementą žemyn",
  "ooui-outline-control-move-up": "Perkelti elementą aukštyn",
  "ooui-outline-control-remove": "Šalinti įrašą",
  "ooui-toolgroup-expand": "Daugiau",
  "ooui-toolgroup-collapse": "Mažiau",
  "ooui-item-remove": "Pašalinti",
  "ooui-dialog-message-accept": "Gerai",
  "ooui-dialog-message-reject": "Atšaukti",
  "ooui-dialog-process-error": "Kažkas nutiko ne taip",
  "ooui-dialog-process-dismiss": "Paslėpti",
  "ooui-dialog-process-retry": "Bandykite dar kartą",
  "ooui-dialog-process-continue": "Tęsti",
  "ooui-combobox-button-label": "Perjungti parinktis",
  "ooui-selectfile-button-select": "Pasirinkti failą",
  "ooui-selectfile-button-select-multiple": "Pasirinkti failus",
  "ooui-selectfile-placeholder": "Nėra pasirinktų failų",
  "ooui-selectfile-dragdrop-placeholder": "Atitempkite failą čia",
  "ooui-selectfile-dragdrop-placeholder-multiple": "Atitempkite failus čia",
  "ooui-popup-widget-close-button-aria-label": "Uždaryti",
  "ooui-field-help": "Pagalba",
} satisfies Partial<Record<MessageKey, MessageValue>>;
