import type { MessageKey, MessageValue } from "../i18n";

/**
 * 斯洛伐克语消息包：译文取自原版OOUI dist/i18n/sk.json（0.54.2，译者见原文件@metadata）。
 * 类型为Partial——缺键由英文默认逐键兜底
 */
export default {
  "ooui-copytextlayout-copy": "Kopírovať",
  "ooui-outline-control-move-down": "Posunúť položku nadol",
  "ooui-outline-control-move-up": "Posunúť položku nahor",
  "ooui-outline-control-remove": "Odstrániť položku",
  "ooui-toolgroup-expand": "Viac",
  "ooui-toolgroup-collapse": "Menej",
  "ooui-item-remove": "Odstrániť",
  "ooui-dialog-message-accept": "OK",
  "ooui-dialog-message-reject": "Zrušiť",
  "ooui-dialog-process-error": "Niečo sa pokazilo",
  "ooui-dialog-process-back": "Späť",
  "ooui-dialog-process-dismiss": "Zrušiť",
  "ooui-dialog-process-retry": "Skúsiť znova",
  "ooui-dialog-process-continue": "Pokračovať",
  "ooui-combobox-button-label": "Prepnúť možnosti",
  "ooui-selectfile-button-select": "Vybrať súbor",
  "ooui-selectfile-button-select-multiple": "Vybrať súbory",
  "ooui-selectfile-placeholder": "Nie je vybraný žiadny súbor",
  "ooui-selectfile-dragdrop-placeholder": "Potiahni súbor sem",
  "ooui-selectfile-dragdrop-placeholder-multiple": "Potiahnite súbory sem",
  "ooui-popup-widget-close-button-aria-label": "Zavrieť",
  "ooui-field-help": "Pomoc",
} satisfies Partial<Record<MessageKey, MessageValue>>;
