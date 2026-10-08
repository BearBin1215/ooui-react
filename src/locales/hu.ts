import type { MessageKey, MessageValue } from "../i18n";

/**
 * 匈牙利语消息包：译文取自原版OOUI dist/i18n/hu.json（0.54.2，译者见原文件@metadata）。
 * 类型为Partial——缺键由英文默认逐键兜底
 */
export default {
  "ooui-copytextlayout-copy": "Másolás",
  "ooui-outline-control-move-down": "Elem mozgatása lefelé",
  "ooui-outline-control-move-up": "Elem mozgatása felfelé",
  "ooui-outline-control-remove": "Elem eltávolítása",
  "ooui-toolgroup-expand": "Több",
  "ooui-toolgroup-collapse": "Kevesebb",
  "ooui-item-remove": "Eltávolítás",
  "ooui-dialog-message-accept": "OK",
  "ooui-dialog-message-reject": "Mégse",
  "ooui-dialog-process-error": "Valami elromlott",
  "ooui-dialog-process-back": "Vissza",
  "ooui-dialog-process-dismiss": "Elrejt",
  "ooui-dialog-process-retry": "Próbáld újra",
  "ooui-dialog-process-continue": "Folytatás",
  "ooui-combobox-button-label": "Opciók megjelenítése/elrejtése",
  "ooui-selectfile-button-select": "Fájl kiválasztása",
  "ooui-selectfile-button-select-multiple": "Fájlok kijelölése",
  "ooui-selectfile-placeholder": "Nincs fájl kiválasztva",
  "ooui-selectfile-dragdrop-placeholder": "Dobd ide a fájlt",
  "ooui-selectfile-dragdrop-placeholder-multiple": "Dobd ide a fájlt",
  "ooui-popup-widget-close-button-aria-label": "Bezárás",
  "ooui-field-help": "Súgó",
} satisfies Partial<Record<MessageKey, MessageValue>>;
