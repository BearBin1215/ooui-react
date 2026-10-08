import type { MessageKey, MessageValue } from "../i18n";

/**
 * 塞尔维亚-克罗地亚语（拉丁文）消息包：译文取自原版OOUI dist/i18n/sh-latn.json（0.54.2，译者见原文件@metadata）。
 * 类型为Partial——缺键由英文默认逐键兜底
 */
export default {
  "ooui-copytextlayout-copy": "Kopiraj",
  "ooui-outline-control-move-down": "Pomakni stavku dolje",
  "ooui-outline-control-move-up": "Premjesti stavku gore",
  "ooui-outline-control-remove": "Ukloni stavku",
  "ooui-toolgroup-expand": "Više",
  "ooui-toolgroup-collapse": "Manje",
  "ooui-item-remove": "Ukloni",
  "ooui-dialog-message-accept": "U redu",
  "ooui-dialog-message-reject": "Otkaži",
  "ooui-dialog-process-error": "Nešto je pošlo naopako",
  "ooui-dialog-process-dismiss": "Odbaci",
  "ooui-dialog-process-retry": "Pokušajte ponovo",
  "ooui-dialog-process-continue": "Nastavi",
  "ooui-combobox-button-label": "Promijeni mogućnosti",
  "ooui-selectfile-button-select": "Izaberi datoteku",
  "ooui-selectfile-button-select-multiple": "Izaberite datoteke",
  "ooui-selectfile-placeholder": "Datoteka nije izabrana",
  "ooui-selectfile-dragdrop-placeholder": "Prevucite datoteku ovdje",
  "ooui-selectfile-dragdrop-placeholder-multiple": "Povucite datoteke ovdje",
  "ooui-popup-widget-close-button-aria-label": "Zatvori",
  "ooui-field-help": "Pomoć",
} satisfies Partial<Record<MessageKey, MessageValue>>;
