import type { MessageKey, MessageValue } from "../i18n";

/**
 * 沃莱塔语消息包：译文取自原版OOUI dist/i18n/wal.json（0.54.2，译者见原文件@metadata）。
 * 类型为Partial——缺键由英文默认逐键兜底
 */
export default {
  "ooui-copytextlayout-copy": "Duuqqa",
  "ooui-outline-control-move-down": "Qommuwaa duge yuushsha",
  "ooui-outline-control-move-up": "Qommuwaa pude yuushsha",
  "ooui-outline-control-remove": "Qommuwaa xayssa",
  "ooui-toolgroup-expand": "Aaruwassi",
  "ooui-toolgroup-collapse": "Qiibiyaagaa",
  "ooui-item-remove": "Xayssa",
  "ooui-dialog-message-accept": "Likke",
  "ooui-dialog-message-reject": "Agga",
  "ooui-dialog-process-error": "Aybakko likkenna",
  "ooui-dialog-process-dismiss": "Laala",
  "ooui-dialog-process-retry": "Zaara mala",
  "ooui-dialog-process-continue": "Kaalla",
  "ooui-combobox-button-label": "Doorota laameretta",
  "ooui-selectfile-button-select": "Fayiliyaa doora",
  "ooui-selectfile-button-select-multiple": "Fayileta doora",
  "ooui-selectfile-placeholder": "Doorettida fayilee baawa",
  "ooui-selectfile-dragdrop-placeholder": "Fayiliyaa hagan wotta",
  "ooui-selectfile-dragdrop-placeholder-multiple": "Fayileta hagan wotta",
  "ooui-popup-widget-close-button-aria-label": "Gordda",
  "ooui-field-help": "Maaduwa",
} satisfies Partial<Record<MessageKey, MessageValue>>;
