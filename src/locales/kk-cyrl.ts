import type { MessageKey, MessageValue } from "../i18n";

/**
 * 哈萨克语（西里尔文）消息包：译文取自原版OOUI dist/i18n/kk-cyrl.json（0.54.2，译者见原文件@metadata）。
 * 类型为Partial——缺键由英文默认逐键兜底
 */
export default {
  "ooui-copytextlayout-copy": "Көшіру",
  "ooui-outline-control-move-down": "Элементті төмен жылжыту",
  "ooui-outline-control-move-up": "Элементті жоғары жылжыту",
  "ooui-outline-control-remove": "Элементті алып тастау",
  "ooui-toolgroup-expand": "Тағы",
  "ooui-toolgroup-collapse": "Азырақ",
  "ooui-item-remove": "Алып тастау",
  "ooui-dialog-message-accept": "OK",
  "ooui-dialog-message-reject": "Қажет емес",
  "ooui-dialog-process-error": "Бірдеңеден қате кетті",
  "ooui-dialog-process-dismiss": "Жабу",
  "ooui-dialog-process-retry": "Қайта байқап көріңіз",
  "ooui-dialog-process-continue": "Жалғастыру",
  "ooui-combobox-button-label": "Опцияларды ауыстыру",
  "ooui-selectfile-button-select": "Файлды таңдау",
  "ooui-selectfile-button-select-multiple": "Файлдарды таңдау",
  "ooui-selectfile-placeholder": "Файл таңдалмады",
  "ooui-selectfile-dragdrop-placeholder": "Файлды мында жылжыту",
  "ooui-selectfile-dragdrop-placeholder-multiple": "Файлды мында жылжыту",
  "ooui-popup-widget-close-button-aria-label": "Жабу",
  "ooui-field-help": "Көмек",
} satisfies Partial<Record<MessageKey, MessageValue>>;
