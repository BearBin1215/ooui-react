import type { MessageKey, MessageValue } from "../i18n";

/**
 * 蒙古语消息包：译文取自原版OOUI dist/i18n/mn.json（0.54.2，译者见原文件@metadata）。
 * 类型为Partial——缺键由英文默认逐键兜底
 */
export default {
  "ooui-toolgroup-expand": "Илүү",
  "ooui-toolgroup-collapse": "Цөөн",
  "ooui-dialog-message-accept": "За",
  "ooui-dialog-message-reject": "Цуцлах",
  "ooui-dialog-process-error": "Ямар нэг алдаа гарсан",
  "ooui-dialog-process-dismiss": "Нуух",
  "ooui-dialog-process-retry": "Дахин оролдох",
  "ooui-dialog-process-continue": "Цааш явах",
  "ooui-selectfile-button-select": "Файлаа сонгох",
  "ooui-selectfile-placeholder": "Файл сонгоогүй байна",
  "ooui-selectfile-dragdrop-placeholder": "Файлаа энд хадгалах",
} satisfies Partial<Record<MessageKey, MessageValue>>;
