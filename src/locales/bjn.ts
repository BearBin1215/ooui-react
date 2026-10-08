import type { MessageKey, MessageValue } from "../i18n";

/**
 * 班贾尔语消息包：译文取自原版OOUI dist/i18n/bjn.json（0.54.2，译者见原文件@metadata）。
 * 类型为Partial——缺键由英文默认逐键兜底
 */
export default {
  "ooui-outline-control-move-down": "Pindahakan butir ka bawah",
  "ooui-outline-control-move-up": "Pindahakan butir ka atas",
  "ooui-outline-control-remove": "Hapus butir",
  "ooui-toolgroup-expand": "Salangkapnya",
  "ooui-toolgroup-collapse": "Sacukupnya",
  "ooui-item-remove": "Hapus",
  "ooui-dialog-message-accept": "OK",
  "ooui-dialog-message-reject": "Pasah",
  "ooui-dialog-process-error": "Ada nang kucam",
  "ooui-dialog-process-dismiss": "Tutup",
  "ooui-dialog-process-retry": "Cubai pulang",
  "ooui-dialog-process-continue": "Lanjutakan",
  "ooui-combobox-button-label": "Daptar turun bawah gasan kutak kombo",
  "ooui-selectfile-button-select": "Pilih barakas",
  "ooui-selectfile-placeholder": "Kadada barakas nang tapilih",
  "ooui-selectfile-dragdrop-placeholder": "Andakakan barakas di sini",
  "ooui-field-help": "Patulung",
} satisfies Partial<Record<MessageKey, MessageValue>>;
