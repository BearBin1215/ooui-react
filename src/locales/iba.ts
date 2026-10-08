import type { MessageKey, MessageValue } from "../i18n";

/**
 * 伊班语消息包：译文取自原版OOUI dist/i18n/iba.json（0.54.2，译者见原文件@metadata）。
 * 类型为Partial——缺键由英文默认逐键兜底
 */
export default {
  "ooui-copytextlayout-copy": "Salin",
  "ooui-outline-control-move-down": "Mindahka item ke baruh",
  "ooui-outline-control-move-up": "Mindahka item ke atas",
  "ooui-outline-control-remove": "Buai item",
  "ooui-toolgroup-expand": "Ke penuh",
  "ooui-toolgroup-collapse": "Ke chukup",
  "ooui-item-remove": "Buai",
  "ooui-dialog-message-accept": "OK",
  "ooui-dialog-message-reject": "Kinsil",
  "ooui-dialog-process-error": "Bisi utai nyadi",
  "ooui-dialog-process-dismiss": "Tutup",
  "ooui-dialog-process-retry": "Uji baru",
  "ooui-dialog-process-continue": "Neruska",
  "ooui-combobox-button-label": "Pemilih togol",
  "ooui-selectfile-button-select": "Pilih fail",
  "ooui-selectfile-button-select-multiple": "Pilih fail",
  "ooui-selectfile-placeholder": "Nadai fail dipilih",
  "ooui-selectfile-dragdrop-placeholder": "Engkah fail ditu",
  "ooui-selectfile-dragdrop-placeholder-multiple": "Engkah fail ditu",
  "ooui-popup-widget-close-button-aria-label": "Tutup",
  "ooui-field-help": "Bantu",
} satisfies Partial<Record<MessageKey, MessageValue>>;
