import type { MessageKey, MessageValue } from "../i18n";

/**
 * 卡拉卡尔帕克语消息包：译文取自原版OOUI dist/i18n/kaa.json（0.54.2，译者见原文件@metadata）。
 * 类型为Partial——缺键由英文默认逐键兜底
 */
export default {
  "ooui-copytextlayout-copy": "Kóshirip alıw",
  "ooui-toolgroup-expand": "Kóbirek",
  "ooui-toolgroup-collapse": "Azıraq",
  "ooui-item-remove": "Alıp taslaw",
  "ooui-dialog-message-reject": "Biykar etiw",
  "ooui-combobox-button-label": "Opciyalardı almastırıw",
  "ooui-selectfile-dragdrop-placeholder": "Fayldı usı jerge jılıstırıw",
  "ooui-selectfile-dragdrop-placeholder-multiple": "Fayllardı usı jerge jılıstırıw",
} satisfies Partial<Record<MessageKey, MessageValue>>;
