import type { MessageKey, MessageValue } from "../i18n";

/**
 * 北萨米语消息包：译文取自原版OOUI dist/i18n/se.json（0.54.2，译者见原文件@metadata）。
 * 类型为Partial——缺键由英文默认逐键兜底
 */
export default {
  "ooui-copytextlayout-copy": "Máŋge",
  "ooui-outline-control-move-down": "Sirdde merkoša vuollelii",
  "ooui-outline-control-move-up": "Sirdde merkoša badjelii",
  "ooui-outline-control-remove": "Sihko merkoša",
  "ooui-toolgroup-expand": "Čájet eambbo",
  "ooui-toolgroup-collapse": "Čájet unnit",
  "ooui-item-remove": "Sihko",
  "ooui-dialog-message-accept": "OK",
  "ooui-dialog-message-reject": "Gaskkalduhte",
  "ooui-dialog-process-error": "Juoga manai boastut",
  "ooui-dialog-process-dismiss": "Gidde",
  "ooui-dialog-process-retry": "Geahččal fas",
  "ooui-dialog-process-continue": "Joatkke",
  "ooui-combobox-button-label": "Čájet dahje čiega ásahusaid",
  "ooui-selectfile-button-select": "Vállje fiilla",
  "ooui-selectfile-button-select-multiple": "Vállje fiillaid",
  "ooui-selectfile-placeholder": "Ii oktage fiila leat válljejuvvon",
  "ooui-selectfile-dragdrop-placeholder": "Luoitte fiilla dása",
  "ooui-selectfile-dragdrop-placeholder-multiple": "Luoitte fiillaid dása",
  "ooui-popup-widget-close-button-aria-label": "Gidde",
  "ooui-field-help": "Rávvagat",
} satisfies Partial<Record<MessageKey, MessageValue>>;
