import type { MessageKey, MessageValue } from "../i18n";

/**
 * 孔卡尼语（拉丁文）消息包：译文取自原版OOUI dist/i18n/gom-latn.json（0.54.2，译者见原文件@metadata）。
 * 类型为Partial——缺键由英文默认逐键兜底
 */
export default {
  "ooui-copytextlayout-copy": "Nokol",
  "ooui-toolgroup-expand": "Anik",
  "ooui-toolgroup-collapse": "Unnem",
  "ooui-dialog-message-accept": "Borem",
  "ooui-dialog-message-reject": "Rodd'dd kor",
  "ooui-dialog-process-retry": "Porot proyotn kor",
  "ooui-selectfile-button-select": "Ek fayl nivodd",
  "ooui-selectfile-placeholder": "Khuimchech fayl nivddunk nam",
  "ooui-selectfile-dragdrop-placeholder": "Fayl hanga udoi",
} satisfies Partial<Record<MessageKey, MessageValue>>;
