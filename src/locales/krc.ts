import type { MessageKey, MessageValue } from "../i18n";

/**
 * 卡拉恰伊-巴尔卡尔语消息包：译文取自原版OOUI dist/i18n/krc.json（0.54.2，译者见原文件@metadata）。
 * 类型为Partial——缺键由英文默认逐键兜底
 */
export default {
  "ooui-copytextlayout-copy": "Копия эт",
  "ooui-outline-control-move-down": "Элементни тюбюне кёчюр",
  "ooui-outline-control-move-up": "Элементни башына кёчюр",
  "ooui-outline-control-remove": "Пунктну кетер",
  "ooui-toolgroup-expand": "Энтда",
  "ooui-toolgroup-collapse": "Артха",
  "ooui-item-remove": "Къорат",
  "ooui-dialog-message-accept": "ОК",
  "ooui-dialog-message-reject": "Ызына ал",
  "ooui-dialog-process-error": "Не эсе да табсыз кетди",
  "ooui-dialog-process-dismiss": "Унама",
  "ooui-dialog-process-retry": "Энтда сынаб кёр",
  "ooui-dialog-process-continue": "Бардыр",
  "ooui-combobox-button-label": "Опцияланы ач/джаб",
  "ooui-selectfile-button-select": "Файл сайла",
  "ooui-selectfile-button-select-multiple": "Файлла сайла",
  "ooui-selectfile-placeholder": "Бир файл да сайланмагъанды",
  "ooui-selectfile-dragdrop-placeholder": "Файлны былайгъа тарт",
  "ooui-selectfile-dragdrop-placeholder-multiple": "Файлланы былайгъа тарт",
  "ooui-popup-widget-close-button-aria-label": "Джаб",
  "ooui-field-help": "Болушлукъ",
} satisfies Partial<Record<MessageKey, MessageValue>>;
