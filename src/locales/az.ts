import type { MessageKey, MessageValue } from "../i18n";

/**
 * 阿塞拜疆语消息包：译文取自原版OOUI dist/i18n/az.json（0.54.2，译者见原文件@metadata）。
 * 类型为Partial——缺键由英文默认逐键兜底
 */
export default {
  "ooui-copytextlayout-copy": "Kopiyala",
  "ooui-outline-control-move-down": "Elementi aşağı köçür",
  "ooui-outline-control-move-up": "Elementi yuxarı köçür",
  "ooui-outline-control-remove": "Elementi sil",
  "ooui-toolgroup-expand": "Daha çox",
  "ooui-toolgroup-collapse": "Daha az",
  "ooui-item-remove": "Sil",
  "ooui-dialog-message-accept": "Yaxşı",
  "ooui-dialog-message-reject": "İmtina",
  "ooui-dialog-process-error": "Xəta baş verdi",
  "ooui-dialog-process-back": "Geri",
  "ooui-dialog-process-dismiss": "Bağla",
  "ooui-dialog-process-retry": "Yenidən cəhd et",
  "ooui-dialog-process-continue": "Davam et",
  "ooui-combobox-button-label": "Seçimləri dəyişin",
  "ooui-selectfile-button-select": "Fayl seç",
  "ooui-selectfile-button-select-multiple": "Faylları seç",
  "ooui-selectfile-placeholder": "Heç bir fayl seçilməyib",
  "ooui-selectfile-dragdrop-placeholder": "Faylı buraya burax",
  "ooui-selectfile-dragdrop-placeholder-multiple": "Faylları buraya burax",
  "ooui-popup-widget-close-button-aria-label": "Bağla",
  "ooui-field-help": "Kömək",
} satisfies Partial<Record<MessageKey, MessageValue>>;
