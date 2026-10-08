import type { MessageKey, MessageValue } from "../i18n";

/**
 * 海地克里奥尔语消息包：译文取自原版OOUI dist/i18n/ht.json（0.54.2，译者见原文件@metadata）。
 * 类型为Partial——缺键由英文默认逐键兜底
 */
export default {
  "ooui-outline-control-move-down": "Bouje eleman an desann",
  "ooui-outline-control-move-up": "Bouje eleman an anwo",
  "ooui-outline-control-remove": "Retire eleman an",
  "ooui-toolgroup-expand": "Plis",
  "ooui-toolgroup-collapse": "Mwens",
  "ooui-item-remove": "Retire",
  "ooui-dialog-message-accept": "OK",
  "ooui-dialog-message-reject": "Anile",
  "ooui-dialog-process-error": "Yon bagay ale mal",
  "ooui-dialog-process-dismiss": "Fèmen",
  "ooui-dialog-process-retry": "Eseye anko",
  "ooui-dialog-process-continue": "Kontinye",
  "ooui-selectfile-button-select": "Chwazi yon fichye",
  "ooui-selectfile-button-select-multiple": "Chwazi fichye yo",
  "ooui-selectfile-placeholder": "Pa gen fichye chwazi",
  "ooui-selectfile-dragdrop-placeholder": "Depoze fichye a isit la",
  "ooui-selectfile-dragdrop-placeholder-multiple": "Depoze fichye yo isit la",
  "ooui-popup-widget-close-button-aria-label": "Fèmen",
  "ooui-field-help": "Èd",
} satisfies Partial<Record<MessageKey, MessageValue>>;
