import type { MessageKey, MessageValue } from "../i18n";

/**
 * 格鲁吉亚语消息包：译文取自原版OOUI dist/i18n/ka.json（0.54.2，译者见原文件@metadata）。
 * 类型为Partial——缺键由英文默认逐键兜底
 */
export default {
  "ooui-outline-control-move-down": "ელემენტის ქვემოთ გადატანა",
  "ooui-outline-control-move-up": "ელემენტის ზემოთ გადატანა",
  "ooui-outline-control-remove": "წაშლა",
  "ooui-toolgroup-expand": "მეტი",
  "ooui-toolgroup-collapse": "ნაკლები",
  "ooui-item-remove": "წაშლა",
  "ooui-dialog-message-accept": "კარგი",
  "ooui-dialog-message-reject": "გაუქმება",
  "ooui-dialog-process-error": "მოხდა რაღაც შეცდომა",
  "ooui-dialog-process-dismiss": "დამალვა",
  "ooui-dialog-process-retry": "კიდევ სცადეთ",
  "ooui-dialog-process-continue": "გაგრძელება",
  "ooui-combobox-button-label": "პარამეტრების გადართვა",
  "ooui-selectfile-button-select": "აირჩიეთ ფაილი",
  "ooui-selectfile-button-select-multiple": "ფაილების არჩევა",
  "ooui-selectfile-placeholder": "ფაილი არ არის არჩეული",
  "ooui-selectfile-dragdrop-placeholder": "ჩააგდეთ ფაილი აქ",
  "ooui-selectfile-dragdrop-placeholder-multiple": "ჩაყარეთ ფაილები აქ",
  "ooui-popup-widget-close-button-aria-label": "დახურვა",
  "ooui-field-help": "დახმარება",
} satisfies Partial<Record<MessageKey, MessageValue>>;
