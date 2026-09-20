import type { MessageKey, MessageValue } from "../i18n";

/**
 * 乌克兰语消息包：译文取自原版OOUI dist/i18n/uk.json（0.54.2，译者见原文件@metadata）。
 * 类型为Partial——缺键由英文默认逐键兜底
 */
export default {
  "ooui-copytextlayout-copy": "Копіювати",
  "ooui-outline-control-move-down": "Перемістити елемент униз",
  "ooui-outline-control-move-up": "Перемістити елемент вгору",
  "ooui-outline-control-remove": "Видалити елемент",
  "ooui-toolgroup-expand": "Більше",
  "ooui-toolgroup-collapse": "Менше",
  "ooui-item-remove": "Вилучити",
  "ooui-dialog-message-accept": "Готово",
  "ooui-dialog-message-reject": "Скасувати",
  "ooui-dialog-process-error": "Щось пішло не так",
  "ooui-dialog-process-back": "Назад",
  "ooui-dialog-process-dismiss": "Приховати",
  "ooui-dialog-process-retry": "Спробуйте ще раз",
  "ooui-dialog-process-continue": "Продовжити",
  "ooui-combobox-button-label": "Перемкнути опції",
  "ooui-selectfile-button-select": "Оберіть файл",
  "ooui-selectfile-button-select-multiple": "Оберіть файли",
  "ooui-selectfile-placeholder": "Жодного файлу не вибрано",
  "ooui-selectfile-dragdrop-placeholder": "Помістіть файл сюди",
  "ooui-selectfile-dragdrop-placeholder-multiple": "Перемістіть файли сюди",
  "ooui-popup-widget-close-button-aria-label": "Закрити",
  "ooui-field-help": "Допомога",
} satisfies Partial<Record<MessageKey, MessageValue>>;
