import type { MessageKey, MessageValue } from "../i18n";

/**
 * 贝塔维语消息包：译文取自原版OOUI dist/i18n/bew.json（0.54.2，译者见原文件@metadata）。
 * 类型为Partial——缺键由英文默认逐键兜底
 */
export default {
  "ooui-copytextlayout-copy": "Jiplak",
  "ooui-outline-control-move-down": "Pindahin barang ke bawah",
  "ooui-outline-control-move-up": "Pindahin barang ke atas",
  "ooui-outline-control-remove": "Buang barang",
  "ooui-toolgroup-expand": "Selengkepnya",
  "ooui-toolgroup-collapse": "Dikitan",
  "ooui-item-remove": "Buang",
  "ooui-dialog-message-accept": "Baè'",
  "ooui-dialog-message-reject": "Urungin",
  "ooui-dialog-process-error": "Ada nyang kaga' bèrès",
  "ooui-dialog-process-dismiss": "Tutup",
  "ooui-dialog-process-retry": "Jal lagi",
  "ooui-dialog-process-continue": "Terusin",
  "ooui-combobox-button-label": "Cetèk pilihan",
  "ooui-selectfile-button-select": "Pilih gepokan",
  "ooui-selectfile-button-select-multiple": "Pilih gepokan",
  "ooui-selectfile-placeholder": "Kaga' ada berekas nyang dipilih",
  "ooui-selectfile-dragdrop-placeholder": "Taroh gepokan di mari",
  "ooui-selectfile-dragdrop-placeholder-multiple": "Taroh gepokan di mari",
  "ooui-popup-widget-close-button-aria-label": "Tutup",
  "ooui-field-help": "Pertulungan",
} satisfies Partial<Record<MessageKey, MessageValue>>;
