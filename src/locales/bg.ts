import type { MessageKey, MessageValue } from "../i18n";

/**
 * 保加利亚语消息包：译文取自原版OOUI dist/i18n/bg.json（0.54.2，译者见原文件@metadata）。
 * 类型为Partial——缺键由英文默认逐键兜底
 */
export default {
  "ooui-copytextlayout-copy": "Копиране",
  "ooui-outline-control-move-down": "Преместване на елемента надолу",
  "ooui-outline-control-move-up": "Преместване на елемента нагоре",
  "ooui-outline-control-remove": "Премахване на обекта",
  "ooui-toolgroup-expand": "Още",
  "ooui-toolgroup-collapse": "По-малко",
  "ooui-item-remove": "Премахване",
  "ooui-dialog-message-accept": "OK",
  "ooui-dialog-message-reject": "Отказ",
  "ooui-dialog-process-error": "Нещо се обърка",
  "ooui-dialog-process-dismiss": "Затваряне",
  "ooui-dialog-process-retry": "Опитайте отново",
  "ooui-dialog-process-continue": "Продължаване",
  "ooui-combobox-button-label": "Падащи настройки",
  "ooui-selectfile-button-select": "Избиране на файл",
  "ooui-selectfile-placeholder": "Не е избран файл",
  "ooui-selectfile-dragdrop-placeholder": "Пуснете файла тук",
  "ooui-field-help": "Помощ",
} satisfies Partial<Record<MessageKey, MessageValue>>;
