import type { MessageKey, MessageValue } from "../i18n";

/**
 * 粤语消息包：译文取自原版OOUI dist/i18n/yue-hant.json（0.54.2，译者见原文件@metadata）。
 * 类型为Partial——缺键由英文默认逐键兜底
 */
export default {
  "ooui-copytextlayout-copy": "抄",
  "ooui-outline-control-move-down": "向下搬",
  "ooui-outline-control-move-up": "向上搬",
  "ooui-outline-control-remove": "拎走",
  "ooui-toolgroup-expand": "多啲",
  "ooui-toolgroup-collapse": "少啲",
  "ooui-item-remove": "剷走",
  "ooui-dialog-message-accept": "好",
  "ooui-dialog-message-reject": "取消",
  "ooui-dialog-process-error": "唔對路",
  "ooui-dialog-process-dismiss": "閂咗佢",
  "ooui-dialog-process-retry": "再試過",
  "ooui-dialog-process-continue": "繼續",
  "ooui-combobox-button-label": "切換選項",
  "ooui-selectfile-button-select": "揀快勞",
  "ooui-selectfile-button-select-multiple": "揀檔案",
  "ooui-selectfile-placeholder": "無揀到文件",
  "ooui-selectfile-dragdrop-placeholder": "放快勞響度",
  "ooui-selectfile-dragdrop-placeholder-multiple": "拖檔案來呢道",
  "ooui-popup-widget-close-button-aria-label": "閂",
  "ooui-field-help": "幫手",
} satisfies Partial<Record<MessageKey, MessageValue>>;
