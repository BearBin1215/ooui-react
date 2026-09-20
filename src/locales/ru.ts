import type { MessageKey, MessageValue } from "../i18n";

/**
 * 俄语消息包：译文取自原版OOUI dist/i18n/ru.json（0.54.2，译者见原文件@metadata）。
 * 类型为Partial——缺键由英文默认逐键兜底
 */
export default {
  "ooui-copytextlayout-copy": "Копировать",
  "ooui-outline-control-move-down": "Переместить элемент вниз",
  "ooui-outline-control-move-up": "Переместить элемент вверх",
  "ooui-outline-control-remove": "Удалить пункт",
  "ooui-toolgroup-expand": "Больше",
  "ooui-toolgroup-collapse": "Меньше",
  "ooui-item-remove": "Удалить",
  "ooui-dialog-message-accept": "ОК",
  "ooui-dialog-message-reject": "Отмена",
  "ooui-dialog-process-error": "Что-то пошло не так",
  "ooui-dialog-process-back": "Назад",
  "ooui-dialog-process-dismiss": "Закрыть",
  "ooui-dialog-process-retry": "Попробовать ещё раз",
  "ooui-dialog-process-continue": "Продолжить",
  "ooui-combobox-button-label": "Переключить параметры",
  "ooui-selectfile-button-select": "Выберите файл",
  "ooui-selectfile-button-select-multiple": "Выберите файлы",
  "ooui-selectfile-placeholder": "Файл не выбран",
  "ooui-selectfile-dragdrop-placeholder": "Перетащите файл сюда",
  "ooui-selectfile-dragdrop-placeholder-multiple": "Перетащите файлы сюда",
  "ooui-popup-widget-close-button-aria-label": "Закрыть",
  "ooui-field-help": "Справка",
} satisfies Partial<Record<MessageKey, MessageValue>>;
