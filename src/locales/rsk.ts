import type { MessageKey, MessageValue } from "../i18n";

/**
 * 潘诺尼亚卢森尼亚语消息包：译文取自原版OOUI dist/i18n/rsk.json（0.54.2，译者见原文件@metadata）。
 * 类型为Partial——缺键由英文默认逐键兜底
 */
export default {
  "ooui-copytextlayout-copy": "Копировац",
  "ooui-outline-control-move-down": "Премесц предмет долу",
  "ooui-outline-control-move-up": "Премесц предмет  горе",
  "ooui-outline-control-remove": "Одстрань предмет",
  "ooui-toolgroup-expand": "Вецей",
  "ooui-toolgroup-collapse": "Менше",
  "ooui-item-remove": "Одстрань",
  "ooui-dialog-message-accept": "У порядку",
  "ooui-dialog-message-reject": "Одкаж",
  "ooui-dialog-process-error": "Цошка нє у шоре",
  "ooui-dialog-process-dismiss": "Одруц",
  "ooui-dialog-process-retry": "Пробуй ознова",
  "ooui-dialog-process-continue": "Предлуж",
  "ooui-combobox-button-label": "Преруц опциї",
  "ooui-selectfile-button-select": "Виберце файл",
  "ooui-selectfile-button-select-multiple": "Виберце файли",
  "ooui-selectfile-placeholder": "Файл нє вибрани",
  "ooui-selectfile-dragdrop-placeholder": "Унєшце файл ту",
  "ooui-selectfile-dragdrop-placeholder-multiple": "Унєшце файли ту",
  "ooui-popup-widget-close-button-aria-label": "Заври",
  "ooui-field-help": "Помоц",
} satisfies Partial<Record<MessageKey, MessageValue>>;
