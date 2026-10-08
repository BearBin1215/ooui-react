import type { MessageKey, MessageValue } from "../i18n";

/**
 * 白俄罗斯语消息包：译文取自原版OOUI dist/i18n/be.json（0.54.2，译者见原文件@metadata）。
 * 类型为Partial——缺键由英文默认逐键兜底
 */
export default {
  "ooui-copytextlayout-copy": "Капіраваць",
  "ooui-outline-control-move-down": "Перамясціць элемент ўніз",
  "ooui-outline-control-move-up": "Перамясціць элемент уверх",
  "ooui-outline-control-remove": "Выдаліць элемент",
  "ooui-toolgroup-expand": "Яшчэ",
  "ooui-toolgroup-collapse": "Меней",
  "ooui-item-remove": "Выдаліць",
  "ooui-dialog-message-accept": "ОК",
  "ooui-dialog-message-reject": "Скасаваць",
  "ooui-dialog-process-error": "Штосьці пайшло не так…",
  "ooui-dialog-process-dismiss": "Закрыць",
  "ooui-dialog-process-retry": "Паспрабаваць яшчэ раз",
  "ooui-dialog-process-continue": "Працягнуць",
  "ooui-combobox-button-label": "Пераключыць можнасці",
  "ooui-selectfile-button-select": "Выбраць файл",
  "ooui-selectfile-button-select-multiple": "Выбраць файлы",
  "ooui-selectfile-placeholder": "Файл не выбраны",
  "ooui-selectfile-dragdrop-placeholder": "Перацягніце файл сюды",
  "ooui-selectfile-dragdrop-placeholder-multiple": "Перацягніце файлы сюды",
  "ooui-popup-widget-close-button-aria-label": "Закрыць",
  "ooui-field-help": "Даведка",
} satisfies Partial<Record<MessageKey, MessageValue>>;
