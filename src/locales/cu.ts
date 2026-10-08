import type { MessageKey, MessageValue } from "../i18n";

/**
 * 教会斯拉夫语消息包：译文取自原版OOUI dist/i18n/cu.json（0.54.2，译者见原文件@metadata）。
 * 类型为Partial——缺键由英文默认逐键兜底
 */
export default {
  "ooui-toolgroup-expand": "вѧщє",
  "ooui-dialog-process-error": "нѣчьто ꙁълѣ сѧ авило",
} satisfies Partial<Record<MessageKey, MessageValue>>;
