import type { MessageKey, MessageValue } from "../i18n";

/**
 * 低地撒克逊语（荷兰）消息包：译文取自原版OOUI dist/i18n/nds-nl.json（0.54.2，译者见原文件@metadata）。
 * 类型为Partial——缺键由英文默认逐键兜底
 */
export default {
  "ooui-outline-control-move-down": "Objekt ümdale setten",
  "ooui-outline-control-move-up": "Objekt ümhouge setten",
  "ooui-outline-control-remove": "Element vortdoon",
  "ooui-toolgroup-expand": "Meyr",
  "ooui-toolgroup-collapse": "Minder",
  "ooui-dialog-message-accept": "Okee",
  "ooui-dialog-message-reject": "Afbreaken",
  "ooui-dialog-process-error": "Der gung iets fout",
  "ooui-dialog-process-dismiss": "Sluten",
  "ooui-dialog-process-retry": "Opniej proberen",
  "ooui-dialog-process-continue": "Deurgaon",
} satisfies Partial<Record<MessageKey, MessageValue>>;
