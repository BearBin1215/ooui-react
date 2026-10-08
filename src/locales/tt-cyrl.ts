import type { MessageKey, MessageValue } from "../i18n";

/**
 * 鞑靼语（西里尔文）消息包：译文取自原版OOUI dist/i18n/tt-cyrl.json（0.54.2，译者见原文件@metadata）。
 * 类型为Partial——缺键由英文默认逐键兜底
 */
export default {
  "ooui-copytextlayout-copy": "Күчермә алу",
  "ooui-outline-control-move-down": "Элементны аска күчерү",
  "ooui-outline-control-move-up": "Элементны өскә күчерү",
  "ooui-outline-control-remove": "Элементны бетерү",
  "ooui-toolgroup-expand": "Күбрәк",
  "ooui-toolgroup-collapse": "Азрак",
  "ooui-item-remove": "Бетерү",
  "ooui-dialog-message-accept": "Ярар",
  "ooui-dialog-message-reject": "Кире алу",
  "ooui-dialog-process-error": "Нәрсәдер килеп чыкмады",
  "ooui-dialog-process-back": "Кирегә",
  "ooui-dialog-process-dismiss": "Ябу",
  "ooui-dialog-process-retry": "Кабатлау",
  "ooui-dialog-process-continue": "Дәвам итү",
  "ooui-combobox-button-label": "Параметрларны үзгәрт",
  "ooui-selectfile-button-select": "Файлны сайлагыз",
  "ooui-selectfile-button-select-multiple": "Файлларны сайлагыз",
  "ooui-selectfile-placeholder": "Файл сайланмаган",
  "ooui-selectfile-dragdrop-placeholder": "Файлны монда куегыз",
  "ooui-selectfile-dragdrop-placeholder-multiple": "Файлларны монда тартып куегыз",
  "ooui-popup-widget-close-button-aria-label": "Ябу",
  "ooui-field-help": "Белешмә",
} satisfies Partial<Record<MessageKey, MessageValue>>;
