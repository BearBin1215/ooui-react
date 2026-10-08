import type { MessageKey, MessageValue } from "../i18n";

/**
 * 博杰普尔语消息包：译文取自原版OOUI dist/i18n/bho.json（0.54.2，译者见原文件@metadata）。
 * 类型为Partial——缺键由英文默认逐键兜底
 */
export default {
  "ooui-outline-control-move-down": "आइटम नीचे घसकाईं",
  "ooui-outline-control-move-up": "आइटम ऊपर घसकाईं",
  "ooui-outline-control-remove": "आइटम हटाईं",
  "ooui-toolgroup-expand": "अउरी",
  "ooui-toolgroup-collapse": "कम",
  "ooui-dialog-message-accept": "ओके",
  "ooui-dialog-message-reject": "कैंसिल",
  "ooui-dialog-process-error": "कुछ गड़बड़ी हो गइल",
  "ooui-dialog-process-dismiss": "रद्द",
  "ooui-dialog-process-retry": "दोबारा कोसिस करीं",
  "ooui-dialog-process-continue": "जारी राखीं",
  "ooui-selectfile-button-select": "एगो फाइल चुनीं",
  "ooui-selectfile-placeholder": "कौनों फाइल नइखे चुनल गइल",
  "ooui-selectfile-dragdrop-placeholder": "फाइल इहाँ ड्रॉप करीं",
} satisfies Partial<Record<MessageKey, MessageValue>>;
