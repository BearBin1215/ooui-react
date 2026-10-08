import type { MessageKey, MessageValue } from "../i18n";

/**
 * 车臣语消息包：译文取自原版OOUI dist/i18n/ce.json（0.54.2，译者见原文件@metadata）。
 * 类型为Partial——缺键由英文默认逐键兜底
 */
export default {
  "ooui-copytextlayout-copy": "Копийаккха",
  "ooui-outline-control-move-down": "Элемент лахайаккха",
  "ooui-outline-control-move-up": "Элемент хьалайаккха",
  "ooui-outline-control-remove": "ДӀадаха меттиг",
  "ooui-toolgroup-expand": "Кхин сов",
  "ooui-toolgroup-collapse": "КӀезиг",
  "ooui-item-remove": "ДӀайаккха",
  "ooui-dialog-message-accept": "ХӀаъ",
  "ooui-dialog-message-reject": "ДӀадаккхар",
  "ooui-dialog-process-error": "Цхьа хӀума галдаьлла",
  "ooui-dialog-process-dismiss": "ДӀачӀагӀа",
  "ooui-dialog-process-retry": "Кхин цкъа гӀорта",
  "ooui-dialog-process-continue": "Кхин дӀа",
  "ooui-combobox-button-label": "Опцеш хийца",
  "ooui-selectfile-button-select": "Харжа файл",
  "ooui-selectfile-button-select-multiple": "Харжа файлаш",
  "ooui-selectfile-placeholder": "Файл хаьржина йац",
  "ooui-selectfile-dragdrop-placeholder": "Файл кхуза схьатакхае",
  "ooui-selectfile-dragdrop-placeholder-multiple": "Файлаш кхуза схьатакхае",
  "ooui-popup-widget-close-button-aria-label": "ДӀачӀагӀа",
  "ooui-field-help": "ГӀо",
} satisfies Partial<Record<MessageKey, MessageValue>>;
