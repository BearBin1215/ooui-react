import type { MessageKey, MessageValue } from "../i18n";

/**
 * 冰岛语消息包：译文取自原版OOUI dist/i18n/is.json（0.54.2，译者见原文件@metadata）。
 * 类型为Partial——缺键由英文默认逐键兜底
 */
export default {
  "ooui-copytextlayout-copy": "Afrita",
  "ooui-outline-control-move-down": "Færa atriði niður",
  "ooui-outline-control-move-up": "Færa atriði upp",
  "ooui-outline-control-remove": "Fjarlægja atriði",
  "ooui-toolgroup-expand": "Fleira",
  "ooui-toolgroup-collapse": "Færra",
  "ooui-item-remove": "Fjarlægja",
  "ooui-dialog-message-accept": "Í lagi",
  "ooui-dialog-message-reject": "Hætta við",
  "ooui-dialog-process-error": "Eitthvað mistókst",
  "ooui-dialog-process-dismiss": "Loka",
  "ooui-dialog-process-retry": "Reyna aftur",
  "ooui-dialog-process-continue": "Halda áfram",
  "ooui-combobox-button-label": "Víxla valkostum af/á",
  "ooui-selectfile-button-select": "Velja skrá",
  "ooui-selectfile-placeholder": "Engin skrá er valin",
  "ooui-selectfile-dragdrop-placeholder": "Slepptu skránni hérna",
  "ooui-field-help": "Hjálp",
} satisfies Partial<Record<MessageKey, MessageValue>>;
