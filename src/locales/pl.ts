import type { MessageKey, MessageValue } from "../i18n";

/**
 * 波兰语消息包：译文取自原版OOUI dist/i18n/pl.json（0.54.2，译者见原文件@metadata）。
 * 类型为Partial——缺键由英文默认逐键兜底
 */
export default {
  "ooui-copytextlayout-copy": "Skopiuj",
  "ooui-outline-control-move-down": "Przesuń w dół",
  "ooui-outline-control-move-up": "Przesuń w górę",
  "ooui-outline-control-remove": "Usuń element",
  "ooui-toolgroup-expand": "Więcej",
  "ooui-toolgroup-collapse": "Mniej",
  "ooui-item-remove": "Usuń",
  "ooui-dialog-message-accept": "OK",
  "ooui-dialog-message-reject": "Anuluj",
  "ooui-dialog-process-error": "Coś poszło nie tak",
  "ooui-dialog-process-back": "Wstecz",
  "ooui-dialog-process-dismiss": "Odrzuć",
  "ooui-dialog-process-retry": "Spróbuj ponownie",
  "ooui-dialog-process-continue": "Kontynuuj",
  "ooui-combobox-button-label": "Pokaż opcje",
  "ooui-selectfile-button-select": "Wybierz plik",
  "ooui-selectfile-button-select-multiple": "Wybierz pliki",
  "ooui-selectfile-placeholder": "Nie wybrano pliku",
  "ooui-selectfile-dragdrop-placeholder": "Upuść plik tutaj",
  "ooui-selectfile-dragdrop-placeholder-multiple": "Przeciągnij pliki tutaj",
  "ooui-popup-widget-close-button-aria-label": "Zamknij",
  "ooui-field-help": "Pomoc",
} satisfies Partial<Record<MessageKey, MessageValue>>;
