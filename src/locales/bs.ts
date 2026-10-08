import type { MessageKey, MessageValue } from "../i18n";

/**
 * 波斯尼亚语消息包：译文取自原版OOUI dist/i18n/bs.json（0.54.2，译者见原文件@metadata）。
 * 类型为Partial——缺键由英文默认逐键兜底
 */
export default {
  "ooui-copytextlayout-copy": "Kopiraj",
  "ooui-outline-control-move-down": "Premjesti stavku dolje",
  "ooui-outline-control-move-up": "Premjesti stavku gore",
  "ooui-outline-control-remove": "Ukloni stavku",
  "ooui-toolgroup-expand": "Više",
  "ooui-toolgroup-collapse": "Manje",
  "ooui-item-remove": "Ukloni",
  "ooui-dialog-message-accept": "U redu",
  "ooui-dialog-message-reject": "Otkaži",
  "ooui-dialog-process-error": "Nešto nije u redu",
  "ooui-dialog-process-dismiss": "Odbaci",
  "ooui-dialog-process-retry": "Pokušaj ponovo",
  "ooui-dialog-process-continue": "Nastavi",
  "ooui-selectfile-button-select": "Izaberite datoteku",
  "ooui-selectfile-placeholder": "Datoteka nije izabrana",
  "ooui-selectfile-dragdrop-placeholder": "Prevucite datoteku ovdje",
  "ooui-field-help": "Pomoć",
} satisfies Partial<Record<MessageKey, MessageValue>>;
