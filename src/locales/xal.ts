import type { MessageKey, MessageValue } from "../i18n";

/**
 * 卡尔梅克语消息包：译文取自原版OOUI dist/i18n/xal.json（0.54.2，译者见原文件@metadata）。
 * 类型为Partial——缺键由英文默认逐键兜底
 */
export default {
  "ooui-copytextlayout-copy": "Хуулх",
  "ooui-toolgroup-expand": "Үлү",
  "ooui-toolgroup-collapse": "Цөн",
  "ooui-item-remove": "Уга кех",
  "ooui-dialog-message-accept": "Нә",
  "ooui-dialog-message-reject": "Цуцлх",
  "ooui-dialog-process-error": "Ямаран негн эндү һарв",
  "ooui-dialog-process-dismiss": "Нуух",
  "ooui-dialog-process-retry": "Дәкн орлдх",
  "ooui-dialog-process-continue": "Үрглҗлүлх",
  "ooui-selectfile-button-select": "Файлан суңһх",
  "ooui-selectfile-button-select-multiple": "Файлан суңһтн",
  "ooui-selectfile-placeholder": "Файл суңһад уга бәәнә",
  "ooui-selectfile-dragdrop-placeholder": "Файлан энд хадһлх",
  "ooui-popup-widget-close-button-aria-label": "Хаах",
  "ooui-field-help": "Туслмҗ",
} satisfies Partial<Record<MessageKey, MessageValue>>;
