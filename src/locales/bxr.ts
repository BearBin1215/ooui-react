import type { MessageKey, MessageValue } from "../i18n";

/**
 * 布里亚特语消息包：译文取自原版OOUI dist/i18n/bxr.json（0.54.2，译者见原文件@metadata）。
 * 类型为Partial——缺键由英文默认逐键兜底
 */
export default {
  "ooui-copytextlayout-copy": "Хуулбарилха",
  "ooui-outline-control-move-down": "Зүйл доошонь зөөлгэхэ",
  "ooui-outline-control-move-up": "Зүйл дээшэнь зөөхэ",
  "ooui-outline-control-remove": "Зүйл усадхаха",
  "ooui-toolgroup-expand": "Үшөө",
  "ooui-toolgroup-collapse": "Үсөөн",
  "ooui-item-remove": "Усадхаха",
  "ooui-dialog-message-accept": "Зай",
  "ooui-dialog-message-reject": "Болюулха",
  "ooui-dialog-process-error": "Алдуу гараа",
  "ooui-dialog-process-dismiss": "Сааша хэхэ",
  "ooui-dialog-process-retry": "Дахин туршагты",
  "ooui-dialog-process-continue": "Үргэлжэлүүлхэ",
  "ooui-combobox-button-label": "Опци хараха",
  "ooui-selectfile-button-select": "Файл шэлэхэ",
  "ooui-selectfile-button-select-multiple": "Файлнуудые шэлэхэ",
  "ooui-selectfile-placeholder": "Ямаршье файл шэлэгдээгүй",
  "ooui-selectfile-dragdrop-placeholder": "Файл эндэ хаягты",
  "ooui-selectfile-dragdrop-placeholder-multiple": "Файлнуудые эндэ хаягты",
  "ooui-popup-widget-close-button-aria-label": "Хааха",
  "ooui-field-help": "Туһаламжа",
} satisfies Partial<Record<MessageKey, MessageValue>>;
