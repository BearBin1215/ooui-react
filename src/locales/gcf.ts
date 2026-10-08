import type { MessageKey, MessageValue } from "../i18n";

/**
 * 瓜德罗普克里奥尔语消息包：译文取自原版OOUI dist/i18n/gcf.json（0.54.2，译者见原文件@metadata）。
 * 类型为Partial——缺键由英文默认逐键兜底
 */
export default {
  "ooui-copytextlayout-copy": "Kopyé",
  "ooui-outline-control-move-down": "Désann éléman-la",
  "ooui-outline-control-move-up": "Monté éléman-la",
  "ooui-outline-control-remove": "Wotè éléman-la",
  "ooui-toolgroup-expand": "Plis",
  "ooui-toolgroup-collapse": "Mwens",
  "ooui-item-remove": "Woté-y",
  "ooui-dialog-message-accept": "OK",
  "ooui-dialog-process-dismiss": "Fèmé",
  "ooui-field-help": "Anmwé",
} satisfies Partial<Record<MessageKey, MessageValue>>;
