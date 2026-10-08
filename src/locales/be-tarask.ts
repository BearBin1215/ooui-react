import type { MessageKey, MessageValue } from "../i18n";

/**
 * 白俄罗斯语（传统正字法）消息包：译文取自原版OOUI dist/i18n/be-tarask.json（0.54.2，译者见原文件@metadata）。
 * 类型为Partial——缺键由英文默认逐键兜底
 */
export default {
  "ooui-copytextlayout-copy": "Скапіяваць",
  "ooui-outline-control-move-down": "Перасунуць элемэнт ніжэй",
  "ooui-outline-control-move-up": "Перасунуць элемэнт вышэй",
  "ooui-outline-control-remove": "Выдаліць пункт",
  "ooui-toolgroup-expand": "Болей",
  "ooui-toolgroup-collapse": "Меней",
  "ooui-item-remove": "Выдаліць",
  "ooui-dialog-message-accept": "Добра",
  "ooui-dialog-message-reject": "Скасаваць",
  "ooui-dialog-process-error": "Нешта пайшло ня так",
  "ooui-dialog-process-dismiss": "Закрыць",
  "ooui-dialog-process-retry": "Паспрабаваць зноў",
  "ooui-dialog-process-continue": "Працягваць",
  "ooui-combobox-button-label": "Пераключыць можнасьці",
  "ooui-selectfile-button-select": "Абраць файл",
  "ooui-selectfile-button-select-multiple": "Абярыце файлы",
  "ooui-selectfile-placeholder": "Ніводзін файл не абраны",
  "ooui-selectfile-dragdrop-placeholder": "Перацягніце файл сюды",
  "ooui-selectfile-dragdrop-placeholder-multiple": "Перацягніце файлы сюды",
  "ooui-popup-widget-close-button-aria-label": "Закрыць",
  "ooui-field-help": "Дапамога",
} satisfies Partial<Record<MessageKey, MessageValue>>;
