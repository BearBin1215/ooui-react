import type { MessageKey, MessageValue } from "../i18n";

/**
 * 扎扎其语消息包：译文取自原版OOUI dist/i18n/diq.json（0.54.2，译者见原文件@metadata）。
 * 类型为Partial——缺键由英文默认逐键兜底
 */
export default {
  "ooui-copytextlayout-copy": "Kopya",
  "ooui-outline-control-move-down": "Bendi bere cêr",
  "ooui-outline-control-move-up": "Bendi bere cor",
  "ooui-outline-control-remove": "Obcey wedare",
  "ooui-toolgroup-expand": "Zêde",
  "ooui-toolgroup-collapse": "Deha tayn",
  "ooui-item-remove": "Wedare",
  "ooui-dialog-message-accept": "TEMAM",
  "ooui-dialog-message-reject": "Bıtexelne",
  "ooui-dialog-process-error": "Tayê çi ğelet şi...",
  "ooui-dialog-process-dismiss": "Red ke",
  "ooui-dialog-process-retry": "Fına bıcerbın",
  "ooui-dialog-process-continue": "Dewam ke",
  "ooui-combobox-button-label": "Weçinıtışê Toogle",
  "ooui-selectfile-button-select": "Yu dosya weçinê",
  "ooui-selectfile-button-select-multiple": "Dosyey Bıweçinê",
  "ooui-selectfile-placeholder": "Dosya nêwçineya",
  "ooui-selectfile-dragdrop-placeholder": "Dosya tiyara ake",
  "ooui-selectfile-dragdrop-placeholder-multiple": "Dosyeyan tiya ra ake",
  "ooui-popup-widget-close-button-aria-label": "Kip ke",
  "ooui-field-help": "Peşti",
} satisfies Partial<Record<MessageKey, MessageValue>>;
