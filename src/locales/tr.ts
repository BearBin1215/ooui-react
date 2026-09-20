import type { MessageKey, MessageValue } from "../i18n";

/**
 * 土耳其语消息包：译文取自原版OOUI dist/i18n/tr.json（0.54.2，译者见原文件@metadata）。
 * 类型为Partial——缺键由英文默认逐键兜底
 */
export default {
  "ooui-copytextlayout-copy": "Kopyala",
  "ooui-outline-control-move-down": "Ögeyi aşağı taşı",
  "ooui-outline-control-move-up": "Ögeyi yukarı taşı",
  "ooui-outline-control-remove": "Ögeyi kaldır",
  "ooui-toolgroup-expand": "Daha fazla",
  "ooui-toolgroup-collapse": "Daha az",
  "ooui-item-remove": "Kaldır",
  "ooui-dialog-message-accept": "Tamam",
  "ooui-dialog-message-reject": "İptal",
  "ooui-dialog-process-error": "Bir şeyler yanlış gitti",
  "ooui-dialog-process-back": "Geri",
  "ooui-dialog-process-dismiss": "Kapat",
  "ooui-dialog-process-retry": "Tekrar dene",
  "ooui-dialog-process-continue": "Devam et",
  "ooui-combobox-button-label": "Seçenekleri değiştir",
  "ooui-selectfile-button-select": "Dosya seç",
  "ooui-selectfile-button-select-multiple": "Dosya seç",
  "ooui-selectfile-placeholder": "Hiçbir dosya seçilmedi",
  "ooui-selectfile-dragdrop-placeholder": "Dosyayı buraya bırak",
  "ooui-selectfile-dragdrop-placeholder-multiple": "Dosyaları buraya bırak",
  "ooui-popup-widget-close-button-aria-label": "Kapat",
  "ooui-field-help": "Yardım",
} satisfies Partial<Record<MessageKey, MessageValue>>;
