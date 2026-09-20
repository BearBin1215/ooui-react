import type { MessageKey, MessageValue } from "../i18n";

/**
 * 捷克语消息包：译文取自原版OOUI dist/i18n/cs.json（0.54.2，译者见原文件@metadata）。
 * 类型为Partial——缺键由英文默认逐键兜底
 */
export default {
  "ooui-copytextlayout-copy": "Zkopírovat",
  "ooui-outline-control-move-down": "Přesunout položku dolů",
  "ooui-outline-control-move-up": "Přesunout položku nahoru",
  "ooui-outline-control-remove": "Odstranit položku",
  "ooui-toolgroup-expand": "Více",
  "ooui-toolgroup-collapse": "Méně",
  "ooui-item-remove": "Odebrat",
  "ooui-dialog-message-accept": "OK",
  "ooui-dialog-message-reject": "Storno",
  "ooui-dialog-process-error": "Něco se pokazilo",
  "ooui-dialog-process-dismiss": "Zavřít",
  "ooui-dialog-process-retry": "Zkusit znovu",
  "ooui-dialog-process-continue": "Pokračovat",
  "ooui-combobox-button-label": "Přepnout možnosti",
  "ooui-selectfile-button-select": "Vybrat soubor",
  "ooui-selectfile-button-select-multiple": "Vybrat soubory",
  "ooui-selectfile-placeholder": "Nebyl vybrán žádný soubor",
  "ooui-selectfile-dragdrop-placeholder": "Umístěte soubor sem",
  "ooui-selectfile-dragdrop-placeholder-multiple": "Přetáhněte soubory sem",
  "ooui-popup-widget-close-button-aria-label": "Zavřít",
  "ooui-field-help": "Pomoc",
} satisfies Partial<Record<MessageKey, MessageValue>>;
