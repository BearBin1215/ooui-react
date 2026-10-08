import type { MessageKey, MessageValue } from "../i18n";

/**
 * 基尔丁萨米语消息包：译文取自原版OOUI dist/i18n/sjd.json（0.54.2，译者见原文件@metadata）。
 * 类型为Partial——缺键由英文默认逐键兜底
 */
export default {
  "ooui-copytextlayout-copy": "Ко̄пья лыһкэ",
  "ooui-toolgroup-expand": "Е̄намп",
  "ooui-toolgroup-collapse": "Ва̄нӓмп",
  "ooui-dialog-message-reject": "Е̄ссктэ",
  "ooui-selectfile-button-select": "Воа̄лэшьт фа̄ял",
  "ooui-selectfile-placeholder": "Фа̄ял элля воа̄лша",
  "ooui-selectfile-dragdrop-placeholder": "Ке̄зь фа̄ял тэсса",
} satisfies Partial<Record<MessageKey, MessageValue>>;
