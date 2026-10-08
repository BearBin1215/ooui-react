import type { MessageKey, MessageValue } from "../i18n";

/**
 * 明格列尔语消息包：译文取自原版OOUI dist/i18n/xmf.json（0.54.2，译者见原文件@metadata）。
 * 类型为Partial——缺键由英文默认逐键兜底
 */
export default {
  "ooui-copytextlayout-copy": "კოპირაფა",
  "ooui-outline-control-move-down": "ელემენტის ქვემოთ გადატანა",
  "ooui-outline-control-move-up": "ელემენტის ზემოთ გადატანა",
  "ooui-outline-control-remove": "ელემენტის წაშლა",
  "ooui-toolgroup-expand": "უმოსი",
  "ooui-toolgroup-collapse": "რამდენიმე",
  "ooui-dialog-message-accept": "ჯგირი",
  "ooui-dialog-message-reject": "გოუქვაფა",
  "ooui-dialog-process-error": "ქუმოხვადჷ მუდგაინ ჩილათაქ",
  "ooui-dialog-process-dismiss": "ტყობინაფა",
  "ooui-dialog-process-retry": "ხოლო ქოცადით",
  "ooui-dialog-process-continue": "გაგჷნძორაფა",
  "ooui-selectfile-button-select": "გეგშაგორით ფაილი",
  "ooui-selectfile-placeholder": "ფაილი ვა რე გიშაგორილი",
  "ooui-selectfile-dragdrop-placeholder": "ქინაჸათით ფაილი ათაქ",
  "ooui-popup-widget-close-button-aria-label": "კილუა",
} satisfies Partial<Record<MessageKey, MessageValue>>;
