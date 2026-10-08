import type { MessageKey, MessageValue } from "../i18n";

/**
 * 马拉雅拉姆语消息包：译文取自原版OOUI dist/i18n/ml.json（0.54.2，译者见原文件@metadata）。
 * 类型为Partial——缺键由英文默认逐键兜底
 */
export default {
  "ooui-copytextlayout-copy": "പകർത്തുക",
  "ooui-outline-control-move-down": "ഇനം താഴേയ്ക്ക് മാറ്റുക",
  "ooui-outline-control-move-up": "ഇനം മുകളിലേയ്ക്ക് മാറ്റുക",
  "ooui-outline-control-remove": "ഇനം നീക്കംചെയ്യുക",
  "ooui-toolgroup-expand": "കൂടുതൽ",
  "ooui-toolgroup-collapse": "കുറച്ച്",
  "ooui-item-remove": "നീക്കം ചെയ്യുക",
  "ooui-dialog-message-accept": "ശരി",
  "ooui-dialog-message-reject": "റദ്ദാക്കുക",
  "ooui-dialog-process-error": "എന്തോ പ്രശ്നമുണ്ടായി",
  "ooui-dialog-process-dismiss": "ഒഴിവാക്കുക",
  "ooui-dialog-process-retry": "വീണ്ടും ശ്രമിക്കുക",
  "ooui-dialog-process-continue": "തുടരുക",
  "ooui-selectfile-button-select": "പ്രമാണം തിരഞ്ഞെടുക്കുക",
  "ooui-selectfile-placeholder": "പ്രമാണങ്ങൾ ഒന്നും തിരഞ്ഞെടുത്തിട്ടില്ല",
  "ooui-selectfile-dragdrop-placeholder": "പ്രമാണം ഇവിടെ ഇടുക",
  "ooui-field-help": "സഹായം",
} satisfies Partial<Record<MessageKey, MessageValue>>;
