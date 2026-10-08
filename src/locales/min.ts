import type { MessageKey, MessageValue } from "../i18n";

/**
 * 米南加保语消息包：译文取自原版OOUI dist/i18n/min.json（0.54.2，译者见原文件@metadata）。
 * 类型为Partial——缺键由英文默认逐键兜底
 */
export default {
  "ooui-outline-control-move-down": "Pindahan ka bawah",
  "ooui-outline-control-move-up": "Pindahan ka ateh",
  "ooui-outline-control-remove": "Hapuih ko",
  "ooui-toolgroup-expand": "Lainnyo",
  "ooui-toolgroup-collapse": "Saketek",
  "ooui-item-remove": "Hapuih",
  "ooui-dialog-message-accept": "Yo",
  "ooui-dialog-message-reject": "Batal",
  "ooui-dialog-process-error": "Ado nan indak beres",
  "ooui-dialog-process-dismiss": "Tinggakan",
  "ooui-dialog-process-retry": "Cubo lai",
  "ooui-dialog-process-continue": "Taruih",
  "ooui-selectfile-button-select": "Piliah berkas",
  "ooui-selectfile-placeholder": "Indak ado berkas nan tapiliah",
  "ooui-selectfile-dragdrop-placeholder": "Latak berkas di siko",
  "ooui-field-help": "Bantuan",
} satisfies Partial<Record<MessageKey, MessageValue>>;
