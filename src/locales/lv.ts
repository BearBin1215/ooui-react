import type { MessageKey, MessageValue } from "../i18n";

/**
 * 拉脱维亚语消息包：译文取自原版OOUI dist/i18n/lv.json（0.54.2，译者见原文件@metadata）。
 * 类型为Partial——缺键由英文默认逐键兜底
 */
export default {
  "ooui-copytextlayout-copy": "Kopēt",
  "ooui-outline-control-move-down": "Pārvietot vienumu uz leju",
  "ooui-outline-control-move-up": "Pārvietot vienumu uz augšu",
  "ooui-outline-control-remove": "Noņemt vienumu",
  "ooui-toolgroup-expand": "Vairāk",
  "ooui-toolgroup-collapse": "Mazāk",
  "ooui-item-remove": "Noņemt",
  "ooui-dialog-message-accept": "Labi",
  "ooui-dialog-message-reject": "Atcelt",
  "ooui-dialog-process-error": "Kaut kas nogāja greizi",
  "ooui-dialog-process-dismiss": "Paslēpt",
  "ooui-dialog-process-retry": "Mēģināt vēlreiz",
  "ooui-dialog-process-continue": "Turpināt",
  "ooui-combobox-button-label": "Pārslēgt iespējas",
  "ooui-selectfile-button-select": "Izvēlies failu",
  "ooui-selectfile-button-select-multiple": "Izvēlies failus",
  "ooui-selectfile-placeholder": "Nav izvēlēts neviens fails",
  "ooui-selectfile-dragdrop-placeholder": "Nomet failu šeit",
  "ooui-selectfile-dragdrop-placeholder-multiple": "Nomet failus šeit",
  "ooui-popup-widget-close-button-aria-label": "Aizvērt",
  "ooui-field-help": "Palīdzība",
} satisfies Partial<Record<MessageKey, MessageValue>>;
