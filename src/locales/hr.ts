import type { MessageKey, MessageValue } from "../i18n";

/**
 * 克罗地亚语消息包：译文取自原版OOUI dist/i18n/hr.json（0.54.2，译者见原文件@metadata）。
 * 类型为Partial——缺键由英文默认逐键兜底
 */
export default {
  "ooui-copytextlayout-copy": "Kopiraj",
  "ooui-outline-control-move-down": "Premjesti stavku dolje",
  "ooui-outline-control-move-up": "Premjesti stavku gore",
  "ooui-outline-control-remove": "Ukloni",
  "ooui-toolgroup-expand": "Više",
  "ooui-toolgroup-collapse": "Manje",
  "ooui-item-remove": "Ukloni",
  "ooui-dialog-message-accept": "U redu",
  "ooui-dialog-message-reject": "Odustani",
  "ooui-dialog-process-error": "Nešto nije u redu",
  "ooui-dialog-process-dismiss": "Zatvori",
  "ooui-dialog-process-retry": "Pokušajte ponovo",
  "ooui-dialog-process-continue": "Nastavi",
  "ooui-combobox-button-label": "Promijeni mogućnosti",
  "ooui-selectfile-button-select": "Odaberi datoteku",
  "ooui-selectfile-button-select-multiple": "Odaberi datoteke",
  "ooui-selectfile-placeholder": "Datoteka nije označena",
  "ooui-selectfile-dragdrop-placeholder": "Povucite datoteku ovdje",
  "ooui-selectfile-dragdrop-placeholder-multiple": "Povucite datoteke ovdje",
  "ooui-popup-widget-close-button-aria-label": "Zatvori",
  "ooui-field-help": "Pomoć",
} satisfies Partial<Record<MessageKey, MessageValue>>;
