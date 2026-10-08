import type { MessageKey, MessageValue } from "../i18n";

/**
 * 芬兰语消息包：译文取自原版OOUI dist/i18n/fi.json（0.54.2，译者见原文件@metadata）。
 * 类型为Partial——缺键由英文默认逐键兜底
 */
export default {
  "ooui-copytextlayout-copy": "Kopioi",
  "ooui-outline-control-move-down": "Siirrä kohdetta alaspäin",
  "ooui-outline-control-move-up": "Siirrä kohdetta ylöspäin",
  "ooui-outline-control-remove": "Poista kohde",
  "ooui-toolgroup-expand": "Näytä lisää",
  "ooui-toolgroup-collapse": "Näytä vähemmän",
  "ooui-item-remove": "Poista",
  "ooui-dialog-message-accept": "OK",
  "ooui-dialog-message-reject": "Peru",
  "ooui-dialog-process-error": "Jokin meni pieleen",
  "ooui-dialog-process-back": "Takaisin",
  "ooui-dialog-process-dismiss": "Hylkää",
  "ooui-dialog-process-retry": "Yritä uudelleen",
  "ooui-dialog-process-continue": "Jatka",
  "ooui-combobox-button-label": "Vaihda valinnat",
  "ooui-selectfile-button-select": "Valitse tiedosto",
  "ooui-selectfile-button-select-multiple": "Valitse tiedostot",
  "ooui-selectfile-placeholder": "Tiedostoa ei ole valittu",
  "ooui-selectfile-dragdrop-placeholder": "Pudota tiedosto tähän",
  "ooui-selectfile-dragdrop-placeholder-multiple": "Pudota tiedostot tähän",
  "ooui-popup-widget-close-button-aria-label": "Sulje",
  "ooui-field-help": "Ohje",
} satisfies Partial<Record<MessageKey, MessageValue>>;
