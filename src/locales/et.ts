import type { MessageKey, MessageValue } from "../i18n";

/**
 * 爱沙尼亚语消息包：译文取自原版OOUI dist/i18n/et.json（0.54.2，译者见原文件@metadata）。
 * 类型为Partial——缺键由英文默认逐键兜底
 */
export default {
  "ooui-copytextlayout-copy": "Kopeeri",
  "ooui-outline-control-move-down": "Liiguta üksust allapoole",
  "ooui-outline-control-move-up": "Liiguta üksust ülespoole",
  "ooui-outline-control-remove": "Eemalda üksus",
  "ooui-toolgroup-expand": "Veel",
  "ooui-toolgroup-collapse": "Vähem",
  "ooui-item-remove": "Eemalda",
  "ooui-dialog-message-accept": "Sobib",
  "ooui-dialog-message-reject": "Loobu",
  "ooui-dialog-process-error": "Midagi läks valesti",
  "ooui-dialog-process-dismiss": "Sule",
  "ooui-dialog-process-retry": "Proovi uuesti",
  "ooui-dialog-process-continue": "Jätka",
  "ooui-selectfile-button-select": "Vali fail",
  "ooui-selectfile-placeholder": "Faili ei ole valitud",
  "ooui-selectfile-dragdrop-placeholder": "Lohista fail siia",
  "ooui-selectfile-dragdrop-placeholder-multiple": "Lohista failid siia",
  "ooui-popup-widget-close-button-aria-label": "Sulge",
  "ooui-field-help": "Abi",
} satisfies Partial<Record<MessageKey, MessageValue>>;
