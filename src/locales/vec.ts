import type { MessageKey, MessageValue } from "../i18n";

/**
 * 威尼斯语消息包：译文取自原版OOUI dist/i18n/vec.json（0.54.2，译者见原文件@metadata）。
 * 类型为Partial——缺键由英文默认逐键兜底
 */
export default {
  "ooui-outline-control-move-down": "Sposta in baso",
  "ooui-outline-control-move-up": "Sposta in sima",
  "ooui-toolgroup-expand": "Piassè",
  "ooui-toolgroup-collapse": "Manco",
  "ooui-dialog-message-accept": "Va ben",
  "ooui-dialog-message-reject": "Descançełare",
  "ooui-dialog-process-error": "Xe 'ndà storto calcossa",
  "ooui-dialog-process-dismiss": "Scondi",
  "ooui-dialog-process-retry": "Proa da novo",
  "ooui-dialog-process-continue": "Và vanti",
  "ooui-selectfile-button-select": "Siegli un file",
  "ooui-selectfile-dragdrop-placeholder": "Mola zo el file chì rento",
  "ooui-field-help": "Juto",
} satisfies Partial<Record<MessageKey, MessageValue>>;
