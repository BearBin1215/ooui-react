import type { MessageKey, MessageValue } from "../i18n";

/**
 * 印度尼西亚语消息包：译文取自原版OOUI dist/i18n/id.json（0.54.2，译者见原文件@metadata）。
 * 类型为Partial——缺键由英文默认逐键兜底
 */
export default {
  "ooui-copytextlayout-copy": "Salin",
  "ooui-outline-control-move-down": "Pindahkan butir ke bawah",
  "ooui-outline-control-move-up": "Pindahkan butir ke atas",
  "ooui-outline-control-remove": "Hapus butir",
  "ooui-toolgroup-expand": "Selengkapnya",
  "ooui-toolgroup-collapse": "Secukupnya",
  "ooui-item-remove": "Hapus",
  "ooui-dialog-message-accept": "Oke",
  "ooui-dialog-message-reject": "Batal",
  "ooui-dialog-process-error": "Ada yang tidak beres",
  "ooui-dialog-process-dismiss": "Tutup",
  "ooui-dialog-process-retry": "Coba lagi",
  "ooui-dialog-process-continue": "Lanjutkan",
  "ooui-combobox-button-label": "Buka/tutup opsi",
  "ooui-selectfile-button-select": "Pilih berkas",
  "ooui-selectfile-button-select-multiple": "Pilih berkas-berkas",
  "ooui-selectfile-placeholder": "Tidak ada berkas yang terpilih",
  "ooui-selectfile-dragdrop-placeholder": "Letakkan berkas di sini",
  "ooui-selectfile-dragdrop-placeholder-multiple": "Letakkan berkas-berkas di sini",
  "ooui-popup-widget-close-button-aria-label": "Tutup",
  "ooui-field-help": "Bantuan",
} satisfies Partial<Record<MessageKey, MessageValue>>;
