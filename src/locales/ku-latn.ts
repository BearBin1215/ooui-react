import type { MessageKey, MessageValue } from "../i18n";

/**
 * 库尔德语（拉丁文）消息包：译文取自原版OOUI dist/i18n/ku-latn.json（0.54.2，译者见原文件@metadata）。
 * 类型为Partial——缺键由英文默认逐键兜底
 */
export default {
  "ooui-copytextlayout-copy": "Kopî bike",
  "ooui-toolgroup-expand": "Bêhtir",
  "ooui-toolgroup-collapse": "Kêmtir",
  "ooui-dialog-message-accept": "Baş e",
  "ooui-dialog-message-reject": "Betal bike",
  "ooui-dialog-process-retry": "Dîsa hewl bide",
  "ooui-dialog-process-continue": "Bidomîne",
  "ooui-selectfile-button-select": "Dosyeyekê hilbijêre",
  "ooui-selectfile-placeholder": "Ti dosye nehatiye hilbijartin",
} satisfies Partial<Record<MessageKey, MessageValue>>;
