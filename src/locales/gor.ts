import type { MessageKey, MessageValue } from "../i18n";

/**
 * 哥伦打洛语消息包：译文取自原版OOUI dist/i18n/gor.json（0.54.2，译者见原文件@metadata）。
 * 类型为Partial——缺键由英文默认逐键兜底
 */
export default {
  "ooui-outline-control-move-down": "Heyiya botu ode tibawa",
  "ooui-outline-control-move-up": "Heyiya botu ode yitaato",
  "ooui-outline-control-remove": "Yinggila botu",
  "ooui-toolgroup-expand": "Pe'eentapo",
  "ooui-toolgroup-collapse": "ngoolo botu",
  "ooui-dialog-message-accept": "Jo",
  "ooui-dialog-message-reject": "Bataliya",
  "ooui-dialog-process-error": "Woluwo u yilotalawa",
  "ooui-dialog-process-dismiss": "He'uti",
  "ooui-dialog-process-retry": "Yimontali pooli",
  "ooui-dialog-process-continue": "Turusi",
  "ooui-selectfile-button-select": "Tulawota berkas tuwawu",
  "ooui-selectfile-placeholder": "Diya'a berkas u letulawoto",
  "ooui-selectfile-dragdrop-placeholder": "Dutuwa berkas teeya",
  "ooui-field-help": "Wubodu",
} satisfies Partial<Record<MessageKey, MessageValue>>;
