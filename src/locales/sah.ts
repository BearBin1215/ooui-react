import type { MessageKey, MessageValue } from "../i18n";

/**
 * 雅库特语消息包：译文取自原版OOUI dist/i18n/sah.json（0.54.2，译者见原文件@metadata）。
 * 类型为Partial——缺键由英文默认逐键兜底
 */
export default {
  "ooui-copytextlayout-copy": "Хатылаа",
  "ooui-outline-control-move-down": "Аллара түһэрэн биэр",
  "ooui-outline-control-move-up": "Үөһэ таһааран биэр",
  "ooui-outline-control-remove": "Сот",
  "ooui-toolgroup-expand": "Эбии",
  "ooui-toolgroup-collapse": "Кыччат",
  "ooui-item-remove": "Сот",
  "ooui-dialog-message-accept": "Сөп",
  "ooui-dialog-message-reject": "Салҕаама",
  "ooui-dialog-process-error": "Туга эрэ сатаммата",
  "ooui-dialog-process-dismiss": "Сап",
  "ooui-dialog-process-retry": "Хатылаан көр",
  "ooui-dialog-process-continue": "Салгыы",
  "ooui-selectfile-button-select": "Билэни тал",
  "ooui-selectfile-placeholder": "Биир да билэ талыллыбатах",
  "ooui-selectfile-dragdrop-placeholder": "Билэни манна сыҕарыт",
  "ooui-field-help": "Көмө",
} satisfies Partial<Record<MessageKey, MessageValue>>;
