import type { MessageKey, MessageValue } from "../i18n";

/**
 * 马若语消息包：译文取自原版OOUI dist/i18n/mrh.json（0.54.2，译者见原文件@metadata）。
 * 类型为Partial——缺键由英文默认逐键兜底
 */
export default {
  "ooui-outline-control-move-down": "Chhaichhi pathi",
  "ooui-outline-control-move-up": "Chhaichhi pathao",
  "ooui-outline-control-remove": "Chhaichhi thy",
  "ooui-toolgroup-expand": "Ahluhviapa",
  "ooui-toolgroup-collapse": "Achyhvia",
  "ooui-item-remove": "Thy",
  "ooui-dialog-message-accept": "A PHA",
  "ooui-dialog-message-reject": "Châvei",
  "ooui-dialog-process-error": "Sâkhakha ado vei",
  "ooui-dialog-process-dismiss": "Thlo",
  "ooui-dialog-process-retry": "Azaoh via",
  "ooui-dialog-process-continue": "Pazao",
  "ooui-combobox-button-label": "Toggle khotlynazy",
  "ooui-selectfile-button-select": "Faih sâkha atlyh teh",
  "ooui-selectfile-button-select-multiple": "Faih a tlyh teih",
  "ooui-selectfile-placeholder": "Faih atlyh tlâ mâh va chi",
  "ooui-selectfile-dragdrop-placeholder": "He liata faih pathla teh",
  "ooui-selectfile-dragdrop-placeholder-multiple": "He liata faihzy pathla teh",
  "ooui-popup-widget-close-button-aria-label": "Khaw",
  "ooui-field-help": "Baona",
} satisfies Partial<Record<MessageKey, MessageValue>>;
