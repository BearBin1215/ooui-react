import type { MessageKey, MessageValue } from "../i18n";

/**
 * 书面挪威语消息包：译文取自原版OOUI dist/i18n/nb.json（0.54.2，译者见原文件@metadata）。
 * 类型为Partial——缺键由英文默认逐键兜底
 */
export default {
  "ooui-copytextlayout-copy": "Kopier",
  "ooui-outline-control-move-down": "Flytt ned",
  "ooui-outline-control-move-up": "Flytt opp",
  "ooui-outline-control-remove": "Fjern element",
  "ooui-toolgroup-expand": "Mer",
  "ooui-toolgroup-collapse": "Færre",
  "ooui-item-remove": "Fjern",
  "ooui-dialog-message-accept": "OK",
  "ooui-dialog-message-reject": "Avbryt",
  "ooui-dialog-process-error": "Noe gikk galt",
  "ooui-dialog-process-back": "Tilbake",
  "ooui-dialog-process-dismiss": "Lukk",
  "ooui-dialog-process-retry": "Prøv igjen",
  "ooui-dialog-process-continue": "Fortsett",
  "ooui-combobox-button-label": "Vis/skjul valg",
  "ooui-selectfile-button-select": "Velg en fil",
  "ooui-selectfile-button-select-multiple": "Velg filer",
  "ooui-selectfile-placeholder": "Ingen fil er valgt",
  "ooui-selectfile-dragdrop-placeholder": "Slipp fil her",
  "ooui-selectfile-dragdrop-placeholder-multiple": "Slipp filer her",
  "ooui-popup-widget-close-button-aria-label": "Lukk",
  "ooui-field-help": "Hjelp",
} satisfies Partial<Record<MessageKey, MessageValue>>;
