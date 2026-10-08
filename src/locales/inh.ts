import type { MessageKey, MessageValue } from "../i18n";

/**
 * 印古什语消息包：译文取自原版OOUI dist/i18n/inh.json（0.54.2，译者见原文件@metadata）。
 * 类型为Partial——缺键由英文默认逐键兜底
 */
export default {
  "ooui-outline-control-move-down": "Элемент Iолохеяккха",
  "ooui-outline-control-move-up": "Элемент Iолакхеяккха",
  "ooui-outline-control-remove": "Пункт дӀаяккха",
  "ooui-toolgroup-expand": "ДукхагIа",
  "ooui-toolgroup-collapse": "КӀезига",
  "ooui-dialog-message-accept": "ОК",
  "ooui-dialog-message-reject": "Эшац",
  "ooui-dialog-process-error": "Харцахьа хилар цхьа хIама",
  "ooui-dialog-process-dismiss": "ДIакъовла",
  "ooui-dialog-process-retry": "Кхы цкъа де гIорта",
  "ooui-dialog-process-continue": "ДIаьхде",
  "ooui-selectfile-button-select": "Файл хьахаржа",
  "ooui-selectfile-placeholder": "Файл хержа яц",
  "ooui-selectfile-dragdrop-placeholder": "Укхаза хьадехьаяккха файл",
} satisfies Partial<Record<MessageKey, MessageValue>>;
