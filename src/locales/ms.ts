import type { MessageKey, MessageValue } from "../i18n";

/**
 * 马来语消息包：译文取自原版OOUI dist/i18n/ms.json（0.54.2，译者见原文件@metadata）。
 * 类型为Partial——缺键由英文默认逐键兜底
 */
export default {
  "ooui-copytextlayout-copy": "Salin",
  "ooui-outline-control-move-down": "Alihkan perkara ke bawah",
  "ooui-outline-control-move-up": "Alihkan perkara ke atas",
  "ooui-outline-control-remove": "Buang perkara",
  "ooui-toolgroup-expand": "Selengkapnya",
  "ooui-toolgroup-collapse": "Secukupnya",
  "ooui-item-remove": "Buang",
  "ooui-dialog-message-accept": "OK",
  "ooui-dialog-message-reject": "Batal",
  "ooui-dialog-process-error": "Ada masalah",
  "ooui-dialog-process-back": "Kembali",
  "ooui-dialog-process-dismiss": "Abaikan",
  "ooui-dialog-process-retry": "Cuba lagi",
  "ooui-dialog-process-continue": "Teruskan",
  "ooui-combobox-button-label": "Pilihan togol",
  "ooui-selectfile-button-select": "Pilih fail",
  "ooui-selectfile-button-select-multiple": "Pilih fail",
  "ooui-selectfile-placeholder": "Tiada fail yang dipilih",
  "ooui-selectfile-dragdrop-placeholder": "Letakkan fail di sini",
  "ooui-selectfile-dragdrop-placeholder-multiple": "Letakkan fail di sini",
  "ooui-popup-widget-close-button-aria-label": "Tutup",
  "ooui-field-help": "Bantuan",
} satisfies Partial<Record<MessageKey, MessageValue>>;
