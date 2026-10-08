import type { MessageKey, MessageValue } from "../i18n";

/**
 * 泰米尔语消息包：译文取自原版OOUI dist/i18n/ta.json（0.54.2，译者见原文件@metadata）。
 * 类型为Partial——缺键由英文默认逐键兜底
 */
export default {
  "ooui-copytextlayout-copy": "நகல்",
  "ooui-outline-control-move-down": "உருப்படியை கீழிடு",
  "ooui-outline-control-move-up": "உருப்படியை மேலிடு",
  "ooui-outline-control-remove": "உருப்படியை நீக்கு",
  "ooui-toolgroup-expand": "மேலும்",
  "ooui-toolgroup-collapse": "குறைவாக",
  "ooui-item-remove": "அகற்று",
  "ooui-dialog-message-accept": "சரி",
  "ooui-dialog-message-reject": "கைவிடுக",
  "ooui-dialog-process-error": "ஏதோ தவறாகியுள்ளது",
  "ooui-dialog-process-dismiss": "அகற்று",
  "ooui-dialog-process-retry": "மீண்டும் முயல்க",
  "ooui-dialog-process-continue": "தொடரவும்",
  "ooui-combobox-button-label": "விருப்பங்களை மாற்று",
  "ooui-selectfile-button-select": "ஒரு கோப்பைத் தேர்க",
  "ooui-selectfile-button-select-multiple": "கோப்பூக்களைத் தேர்க",
  "ooui-selectfile-placeholder": "எக்கோப்பும் தெரிவாகவில்லை",
  "ooui-selectfile-dragdrop-placeholder": "கோப்பை இங்கே இட",
  "ooui-selectfile-dragdrop-placeholder-multiple": "கோப்புகளை இங்கே இட",
  "ooui-popup-widget-close-button-aria-label": "மூடு",
  "ooui-field-help": "உதவி",
} satisfies Partial<Record<MessageKey, MessageValue>>;
