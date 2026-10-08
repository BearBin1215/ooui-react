import type { MessageKey, MessageValue } from "../i18n";

/**
 * 马其顿语消息包：译文取自原版OOUI dist/i18n/mk.json（0.54.2，译者见原文件@metadata）。
 * 类型为Partial——缺键由英文默认逐键兜底
 */
export default {
  "ooui-copytextlayout-copy": "Копирај",
  "ooui-outline-control-move-down": "Помести надолу",
  "ooui-outline-control-move-up": "Помести нагоре",
  "ooui-outline-control-remove": "Отстрани ставка",
  "ooui-toolgroup-expand": "Повеќе",
  "ooui-toolgroup-collapse": "Помалку",
  "ooui-item-remove": "Отстрани",
  "ooui-dialog-message-accept": "ОК",
  "ooui-dialog-message-reject": "Откажи",
  "ooui-dialog-process-error": "Нешто не е во ред",
  "ooui-dialog-process-back": "Назад",
  "ooui-dialog-process-dismiss": "Тргни",
  "ooui-dialog-process-retry": "Обиди се пак",
  "ooui-dialog-process-continue": "Продолжи",
  "ooui-combobox-button-label": "Расклоп на можности",
  "ooui-selectfile-button-select": "Одберете податотека",
  "ooui-selectfile-button-select-multiple": "Одберете податотеки",
  "ooui-selectfile-placeholder": "Немате одбрано податотека",
  "ooui-selectfile-dragdrop-placeholder": "Тука пуштете ја податотеката",
  "ooui-selectfile-dragdrop-placeholder-multiple": "Тука пуштајте ги податотеките",
  "ooui-popup-widget-close-button-aria-label": "Затвори",
  "ooui-field-help": "Помош",
} satisfies Partial<Record<MessageKey, MessageValue>>;
