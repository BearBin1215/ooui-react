import type { MessageKey, MessageValue } from "../i18n";

/**
 * 拉科塔语消息包：译文取自原版OOUI dist/i18n/lkt.json（0.54.2，译者见原文件@metadata）。
 * 类型为Partial——缺键由英文默认逐键兜底
 */
export default {
  "ooui-copytextlayout-copy": "Wayuóta",
  "ooui-toolgroup-expand": "Sáƞpȟa",
  "ooui-dialog-message-accept": "Hau/Haƞ",
  "ooui-dialog-process-retry": "Akhé iyútȟa",
} satisfies Partial<Record<MessageKey, MessageValue>>;
