import type { MessageKey, MessageValue } from "../i18n";

/**
 * 德语消息包：译文取自原版OOUI dist/i18n/de.json（0.54.2，译者见原文件@metadata）。
 * 类型为Partial——缺键由英文默认逐键兜底
 */
export default {
  "ooui-copytextlayout-copy": "Kopieren",
  "ooui-outline-control-move-down": "Element nach unten verschieben",
  "ooui-outline-control-move-up": "Element nach oben verschieben",
  "ooui-outline-control-remove": "Element entfernen",
  "ooui-toolgroup-expand": "Mehr",
  "ooui-toolgroup-collapse": "Weniger",
  "ooui-item-remove": "Entfernen",
  "ooui-dialog-message-accept": "Okay",
  "ooui-dialog-message-reject": "Abbrechen",
  "ooui-dialog-process-error": "Etwas ist schiefgelaufen",
  "ooui-dialog-process-back": "Zurück",
  "ooui-dialog-process-dismiss": "Ausblenden",
  "ooui-dialog-process-retry": "Erneut versuchen",
  "ooui-dialog-process-continue": "Fortfahren",
  "ooui-combobox-button-label": "Optionen umschalten",
  "ooui-selectfile-button-select": "Eine Datei auswählen",
  "ooui-selectfile-button-select-multiple": "Datei(en) auswählen",
  "ooui-selectfile-placeholder": "Keine Datei ausgewählt",
  "ooui-selectfile-dragdrop-placeholder": "Dateien hier ablegen",
  "ooui-selectfile-dragdrop-placeholder-multiple": "Datei(en) hier ablegen",
  "ooui-popup-widget-close-button-aria-label": "Schließen",
  "ooui-field-help": "Hilfe",
} satisfies Partial<Record<MessageKey, MessageValue>>;
