import type { MessageKey, MessageValue } from "../i18n";

/**
 * 豪萨语消息包：译文取自原版OOUI dist/i18n/ha.json（0.54.2，译者见原文件@metadata）。
 * 类型为Partial——缺键由英文默认逐键兜底
 */
export default {
  "ooui-outline-control-move-down": "Matsar da abu ƙasa",
  "ooui-outline-control-move-up": "Matsar da abu sama",
  "ooui-outline-control-remove": "Cire abu",
  "ooui-toolgroup-expand": "Mai Yawa",
  "ooui-toolgroup-collapse": "Ƙarami",
  "ooui-item-remove": "Cire",
  "ooui-dialog-message-accept": "Amincewa",
  "ooui-dialog-message-reject": "Sokewa",
  "ooui-dialog-process-error": "Wani abu yayi kuskure",
  "ooui-dialog-process-dismiss": "sallama",
  "ooui-dialog-process-retry": "Sake gwadawa",
  "ooui-dialog-process-continue": "Cigaba",
  "ooui-combobox-button-label": "Canza zaɓuɓɓuka",
  "ooui-selectfile-button-select": "Zaɓi fayil",
  "ooui-selectfile-button-select-multiple": "Zaɓi fayiloli",
  "ooui-selectfile-placeholder": "Ba a zaɓi fayil ba",
  "ooui-selectfile-dragdrop-placeholder": "Sauke fayil anan",
  "ooui-selectfile-dragdrop-placeholder-multiple": "Sauke fayiloli anan",
  "ooui-popup-widget-close-button-aria-label": "Rufe, kulle, kusa da",
  "ooui-field-help": "Taimako",
} satisfies Partial<Record<MessageKey, MessageValue>>;
