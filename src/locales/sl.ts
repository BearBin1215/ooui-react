import type { MessageKey, MessageValue } from "../i18n";

/**
 * 斯洛文尼亚语消息包：译文取自原版OOUI dist/i18n/sl.json（0.54.2，译者见原文件@metadata）。
 * 类型为Partial——缺键由英文默认逐键兜底
 */
export default {
  "ooui-copytextlayout-copy": "Kopiraj",
  "ooui-outline-control-move-down": "Prestavi predmet nižje",
  "ooui-outline-control-move-up": "Prestavi predmet višje",
  "ooui-outline-control-remove": "Odstrani vnos",
  "ooui-toolgroup-expand": "Več",
  "ooui-toolgroup-collapse": "Manj",
  "ooui-item-remove": "Odstrani",
  "ooui-dialog-message-accept": "V redu",
  "ooui-dialog-message-reject": "Prekliči",
  "ooui-dialog-process-error": "Nekaj je šlo narobe",
  "ooui-dialog-process-back": "Nazaj",
  "ooui-dialog-process-dismiss": "Opusti",
  "ooui-dialog-process-retry": "Poskusite znova",
  "ooui-dialog-process-continue": "Nadaljuj",
  "ooui-combobox-button-label": "Preklop možnosti",
  "ooui-selectfile-button-select": "Izberite datoteko",
  "ooui-selectfile-button-select-multiple": "Izberi datoteke",
  "ooui-selectfile-placeholder": "Nobena datoteka ni izbrana",
  "ooui-selectfile-dragdrop-placeholder": "Izpustite datoteko tukaj",
  "ooui-selectfile-dragdrop-placeholder-multiple": "Izpustite datoteke tukaj",
  "ooui-popup-widget-close-button-aria-label": "Zapri",
  "ooui-field-help": "Pomoč",
} satisfies Partial<Record<MessageKey, MessageValue>>;
