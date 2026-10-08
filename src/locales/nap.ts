import type { MessageKey, MessageValue } from "../i18n";

/**
 * 那不勒斯语消息包：译文取自原版OOUI dist/i18n/nap.json（0.54.2，译者见原文件@metadata）。
 * 类型为Partial——缺键由英文默认逐键兜底
 */
export default {
  "ooui-outline-control-move-down": "Mòve abbascio",
  "ooui-outline-control-move-up": "Mòve ncoppa",
  "ooui-outline-control-remove": "Leva elemento",
  "ooui-toolgroup-expand": "Cchiù",
  "ooui-toolgroup-collapse": "Meno",
  "ooui-dialog-message-accept": "OK",
  "ooui-dialog-message-reject": "Scancella",
  "ooui-dialog-process-error": "Cocchosa è ghiuta malamente",
  "ooui-dialog-process-dismiss": "Passa 'a vacca",
  "ooui-dialog-process-retry": "Prova n'ata vota",
  "ooui-dialog-process-continue": "Continua",
  "ooui-selectfile-button-select": "Sceglie nu file",
  "ooui-selectfile-placeholder": "Nun s'è scigliuto nisciuno file",
  "ooui-selectfile-dragdrop-placeholder": "Lassa 'o file ccà",
} satisfies Partial<Record<MessageKey, MessageValue>>;
