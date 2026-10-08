import type { MessageKey, MessageValue } from "../i18n";

/**
 * 卡拜尔语消息包：译文取自原版OOUI dist/i18n/kab.json（0.54.2，译者见原文件@metadata）。
 * 类型为Partial——缺键由英文默认逐键兜底
 */
export default {
  "ooui-outline-control-move-down": "Awi aferdi d akesser",
  "ooui-outline-control-move-up": "Awi aferdis d asawen",
  "ooui-outline-control-remove": "Kkes aferdis",
  "ooui-toolgroup-expand": "Ugar",
  "ooui-toolgroup-collapse": "Drus",
  "ooui-item-remove": "Kkes",
  "ooui-dialog-message-accept": "IH",
  "ooui-dialog-message-reject": "Sefsex",
  "ooui-dialog-process-error": "Yella wayen yeḍran",
  "ooui-dialog-process-back": "Uɣal",
  "ooui-dialog-process-dismiss": "Mdel",
  "ooui-dialog-process-retry": "Ɛreḍ tikelt-nniden",
  "ooui-dialog-process-continue": "Kemmel",
  "ooui-selectfile-button-select": "Fren afaylu",
  "ooui-selectfile-placeholder": "Ulac afaylu yettwafernen",
  "ooui-selectfile-dragdrop-placeholder": "Sers afaylu dagi",
} satisfies Partial<Record<MessageKey, MessageValue>>;
