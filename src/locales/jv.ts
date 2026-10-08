import type { MessageKey, MessageValue } from "../i18n";

/**
 * 爪哇语消息包：译文取自原版OOUI dist/i18n/jv.json（0.54.2，译者见原文件@metadata）。
 * 类型为Partial——缺键由英文默认逐键兜底
 */
export default {
  "ooui-outline-control-move-down": "Lih barang mangisor",
  "ooui-outline-control-move-up": "Lih barangé munggah",
  "ooui-outline-control-remove": "Buwang barang",
  "ooui-toolgroup-expand": "Liyané",
  "ooui-toolgroup-collapse": "Sacukupé",
  "ooui-item-remove": "Buwang",
  "ooui-dialog-message-accept": "Oké",
  "ooui-dialog-message-reject": "Wurung",
  "ooui-dialog-process-error": "Ana masalah",
  "ooui-dialog-process-dismiss": "Tutup",
  "ooui-dialog-process-retry": "Jajalen manèh",
  "ooui-dialog-process-continue": "Bacutaké",
  "ooui-selectfile-button-select": "Pilih berkas",
  "ooui-selectfile-placeholder": "Ora ana barkas kang pinilih",
  "ooui-selectfile-dragdrop-placeholder": "Dèkèk barkas ing kéné",
  "ooui-field-help": "Pitulung",
} satisfies Partial<Record<MessageKey, MessageValue>>;
