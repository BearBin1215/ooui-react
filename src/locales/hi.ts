import type { MessageKey, MessageValue } from "../i18n";

/**
 * 印地语消息包：译文取自原版OOUI dist/i18n/hi.json（0.54.2，译者见原文件@metadata）。
 * 类型为Partial——缺键由英文默认逐键兜底
 */
export default {
  "ooui-copytextlayout-copy": "कॉपी करें",
  "ooui-outline-control-move-down": "आयटम को नीचे ले जाएँ",
  "ooui-outline-control-move-up": "आयटम को ऊपर ले जाएँ",
  "ooui-outline-control-remove": "आयटम को हटाएँ",
  "ooui-toolgroup-expand": "अधिक",
  "ooui-toolgroup-collapse": "कम",
  "ooui-item-remove": "हटाएँ",
  "ooui-dialog-message-accept": "ठीक है",
  "ooui-dialog-message-reject": "रद्द करें",
  "ooui-dialog-process-error": "कोई त्रुटि आई",
  "ooui-dialog-process-dismiss": "रद्द करें",
  "ooui-dialog-process-retry": "दोबारा कोशिश करें",
  "ooui-dialog-process-continue": "जारी रखें",
  "ooui-combobox-button-label": "विकल्प बदलें",
  "ooui-selectfile-button-select": "फ़ाइल चुनें",
  "ooui-selectfile-button-select-multiple": "फ़ाइलें चुनें",
  "ooui-selectfile-placeholder": "कोई फ़ाइल चुनी नहीं गई है",
  "ooui-selectfile-dragdrop-placeholder": "फ़ाइल यहाँ डालें",
  "ooui-selectfile-dragdrop-placeholder-multiple": "फ़ाइलों को यहाँ डालें",
  "ooui-popup-widget-close-button-aria-label": "बंद करें",
  "ooui-field-help": "सहायता",
} satisfies Partial<Record<MessageKey, MessageValue>>;
