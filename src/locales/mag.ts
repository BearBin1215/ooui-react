import type { MessageKey, MessageValue } from "../i18n";

/**
 * 摩揭陀语消息包：译文取自原版OOUI dist/i18n/mag.json（0.54.2，译者见原文件@metadata）。
 * 类型为Partial——缺键由英文默认逐键兜底
 */
export default {
  "ooui-copytextlayout-copy": "प्रतिलिपि",
  "ooui-outline-control-move-down": "वस्तु नीचे घसकौथिन",
  "ooui-outline-control-move-up": "वस्तु ऊपरे घसकौथिन",
  "ooui-outline-control-remove": "वस्तु हटावथिन",
  "ooui-toolgroup-expand": "आउ",
  "ooui-toolgroup-collapse": "कम",
  "ooui-item-remove": "हटावथिन",
  "ooui-dialog-message-accept": "ठीक हे",
  "ooui-dialog-message-reject": "निरस्त करथिन",
  "ooui-dialog-process-error": "कौनो गड़बड़ी भेलै",
  "ooui-dialog-process-dismiss": "खारिज करथिन",
  "ooui-dialog-process-retry": "पुनः प्रयास करथिन",
  "ooui-dialog-process-continue": "जारी रखथिन",
  "ooui-combobox-button-label": "विकल्प बदलथिन",
  "ooui-selectfile-button-select": "सञ्चिका चुनथिन",
  "ooui-selectfile-button-select-multiple": "सञ्चिकासभ चुनथिन",
  "ooui-selectfile-placeholder": "कौनो सञ्चिका न चुनल गेलै हे",
  "ooui-selectfile-dragdrop-placeholder": "सञ्चिका हियाँ डालथिन",
  "ooui-selectfile-dragdrop-placeholder-multiple": "सञ्चिका हियाँ डालथिन",
  "ooui-popup-widget-close-button-aria-label": "बन्द करथिन",
  "ooui-field-help": "सहयोग",
} satisfies Partial<Record<MessageKey, MessageValue>>;
