import type { MessageKey, MessageValue } from "../i18n";

/**
 * 孔卡尼语（天城文）消息包：译文取自原版OOUI dist/i18n/gom-deva.json（0.54.2，译者见原文件@metadata）。
 * 类型为Partial——缺键由英文默认逐键兜底
 */
export default {
  "ooui-copytextlayout-copy": "नक्कल",
  "ooui-dialog-message-accept": "बरें",
} satisfies Partial<Record<MessageKey, MessageValue>>;
