import type { MessageKey, MessageValue } from "../i18n";

/**
 * 巴厘语消息包：译文取自原版OOUI dist/i18n/ban.json（0.54.2，译者见原文件@metadata）。
 * 类型为Partial——缺键由英文默认逐键兜底
 */
export default {
  "ooui-copytextlayout-copy": "Tedun",
  "ooui-outline-control-move-down": "Gingsirang item kabetén",
  "ooui-outline-control-move-up": "Gingsirang item kaduur",
  "ooui-outline-control-remove": "Usap item",
  "ooui-toolgroup-expand": "Malih",
  "ooui-toolgroup-collapse": "Sacukupné",
  "ooui-item-remove": "Usap",
  "ooui-dialog-message-accept": "OK",
  "ooui-dialog-message-reject": "Wangdé",
  "ooui-dialog-process-error": "Wénten sané iwang",
  "ooui-dialog-process-dismiss": "Tutup",
  "ooui-dialog-process-retry": "Coba malih",
  "ooui-dialog-process-continue": "Lanturang",
  "ooui-combobox-button-label": "Buka/tutup opsi",
  "ooui-selectfile-button-select": "Pilih aberkas",
  "ooui-selectfile-button-select-multiple": "Pilih berkas",
  "ooui-selectfile-placeholder": "Nénten wénten berkas kapilih",
  "ooui-selectfile-dragdrop-placeholder": "Genahang berkas driki",
  "ooui-selectfile-dragdrop-placeholder-multiple": "Genahang berkas-berkas driki",
  "ooui-popup-widget-close-button-aria-label": "Sineb",
  "ooui-field-help": "Wantuan",
} satisfies Partial<Record<MessageKey, MessageValue>>;
