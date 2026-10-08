import type { MessageKey, MessageValue } from "../i18n";

/**
 * 阿尔及利亚阿拉伯语消息包：译文取自原版OOUI dist/i18n/arq.json（0.54.2，译者见原文件@metadata）。
 * 类型为Partial——缺键由英文默认逐键兜底
 */
export default {
  "ooui-copytextlayout-copy": "انسخ",
  "ooui-outline-control-move-down": "هبط الشيئ للتحت",
  "ooui-outline-control-move-up": "طلع الشيئ للفوق",
  "ooui-outline-control-remove": "أمحي العنصر",
  "ooui-toolgroup-expand": "زيادة",
  "ooui-toolgroup-collapse": "قليل",
  "ooui-item-remove": "امحي",
  "ooui-dialog-message-accept": "مليح",
  "ooui-dialog-message-reject": "رجَع",
  "ooui-dialog-process-error": "حاجه ما خدمتش مليح",
  "ooui-dialog-process-back": "رجوع",
  "ooui-dialog-process-dismiss": "أرفضها",
  "ooui-dialog-process-retry": "عاود جرب",
  "ooui-dialog-process-continue": "واصل",
  "ooui-combobox-button-label": "خيارات التبديل",
  "ooui-selectfile-button-select": "خير ملف",
  "ooui-selectfile-button-select-multiple": "خير ملفات",
  "ooui-selectfile-placeholder": "ما اختاريتش حتا ملف",
  "ooui-selectfile-dragdrop-placeholder": "خلي الملف هنا",
  "ooui-selectfile-dragdrop-placeholder-multiple": "حط الملفات هنا",
  "ooui-popup-widget-close-button-aria-label": "بلّع",
  "ooui-field-help": "معاونه",
} satisfies Partial<Record<MessageKey, MessageValue>>;
