import type { MessageKey, MessageValue } from "../i18n";

/**
 * 意第绪语消息包：译文取自原版OOUI dist/i18n/yi.json（0.54.2，译者见原文件@metadata）。
 * 类型为Partial——缺键由英文默认逐键兜底
 */
export default {
  "ooui-outline-control-move-down": "רוקן עלעמענט אראפ",
  "ooui-outline-control-move-up": "רוקן עלעמענט ארויף",
  "ooui-outline-control-remove": "אַראָפנעמען איינס",
  "ooui-toolgroup-expand": "נאָך",
  "ooui-toolgroup-collapse": "ווייניגער",
  "ooui-item-remove": "אַראָפּנעמען",
  "ooui-dialog-message-accept": "יאָ",
  "ooui-dialog-message-reject": "אַנולירן",
  "ooui-dialog-process-error": "עפעס איז דורכגעפאלן",
  "ooui-dialog-process-dismiss": "צומאַכן",
  "ooui-dialog-process-retry": "פרובירט נאכאמאל",
  "ooui-dialog-process-continue": "פֿארזעצן",
  "ooui-selectfile-button-select": "קלויבט א טעקע",
  "ooui-selectfile-placeholder": "קיין טעקע נישט אויסגעוויילט",
  "ooui-field-help": "הילף",
} satisfies Partial<Record<MessageKey, MessageValue>>;
