import type { MessageKey, MessageValue } from "../i18n";

/**
 * 巽他语消息包：译文取自原版OOUI dist/i18n/su.json（0.54.2，译者见原文件@metadata）。
 * 类型为Partial——缺键由英文默认逐键兜底
 */
export default {
  "ooui-copytextlayout-copy": "Tiron",
  "ooui-outline-control-move-down": "Pindahkeun ka handap",
  "ooui-outline-control-move-up": "Pindahkeun ka luhur",
  "ooui-outline-control-remove": "Hapus",
  "ooui-toolgroup-expand": "Lobaan",
  "ooui-toolgroup-collapse": "Saeutikan",
  "ooui-item-remove": "Pupus",
  "ooui-dialog-message-accept": "Heug",
  "ooui-dialog-message-reject": "Bolay",
  "ooui-dialog-process-error": "Aya nu teu bener",
  "ooui-dialog-process-dismiss": "Tutup",
  "ooui-dialog-process-retry": "Cobaan deui",
  "ooui-dialog-process-continue": "Teruskeun",
  "ooui-selectfile-button-select": "Pilih berkas",
  "ooui-selectfile-placeholder": "Taya berkas anu dipilih",
  "ooui-selectfile-dragdrop-placeholder": "Leupaskeun berkas di dieu",
} satisfies Partial<Record<MessageKey, MessageValue>>;
