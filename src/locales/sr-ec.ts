import type { MessageKey, MessageValue } from "../i18n";

/**
 * 塞尔维亚语（西里尔文）消息包：译文取自原版OOUI dist/i18n/sr-ec.json（0.54.2，译者见原文件@metadata）。
 * 类型为Partial——缺键由英文默认逐键兜底
 */
export default {
  "ooui-copytextlayout-copy": "Копирај",
  "ooui-outline-control-move-down": "Премести ставку надоле",
  "ooui-outline-control-move-up": "Премести ставку нагоре",
  "ooui-outline-control-remove": "Уклони ставку",
  "ooui-toolgroup-expand": "Више",
  "ooui-toolgroup-collapse": "Мање",
  "ooui-item-remove": "Уклони",
  "ooui-dialog-message-accept": "У реду",
  "ooui-dialog-message-reject": "Откажи",
  "ooui-dialog-process-error": "Нешто није у реду",
  "ooui-dialog-process-back": "Назад",
  "ooui-dialog-process-dismiss": "Одбаци",
  "ooui-dialog-process-retry": "Покушај поново",
  "ooui-dialog-process-continue": "Настави",
  "ooui-combobox-button-label": "Прикажи опције",
  "ooui-selectfile-button-select": "Изаберите датотеку",
  "ooui-selectfile-button-select-multiple": "Изабери датотеке",
  "ooui-selectfile-placeholder": "Датотека није изабрана",
  "ooui-selectfile-dragdrop-placeholder": "Отпустите датотеку овде",
  "ooui-selectfile-dragdrop-placeholder-multiple": "Отпустите датотеке овде",
  "ooui-popup-widget-close-button-aria-label": "Затвори",
  "ooui-field-help": "Помоћ",
} satisfies Partial<Record<MessageKey, MessageValue>>;
