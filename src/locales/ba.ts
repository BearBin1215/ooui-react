import type { MessageKey, MessageValue } from "../i18n";

/**
 * 巴什基尔语消息包：译文取自原版OOUI dist/i18n/ba.json（0.54.2，译者见原文件@metadata）。
 * 类型为Partial——缺键由英文默认逐键兜底
 */
export default {
  "ooui-outline-control-move-down": "Элементты аҫҡа күсерергә",
  "ooui-outline-control-move-up": "Элементты өҫкә күсерергә",
  "ooui-outline-control-remove": "Элементты юйырға",
  "ooui-toolgroup-expand": "Күберәк",
  "ooui-toolgroup-collapse": "Аҙыраҡ",
  "ooui-dialog-message-accept": "Яҡшы",
  "ooui-dialog-message-reject": "Кире алырға",
  "ooui-dialog-process-error": "Нимәлер килеп сыҡманы.",
  "ooui-dialog-process-dismiss": "Ябырға",
  "ooui-dialog-process-retry": "Яңынан ҡабатлап ҡарарға",
  "ooui-dialog-process-continue": "Дауам итергә",
  "ooui-selectfile-button-select": "Файлды һайлағыҙ",
  "ooui-selectfile-placeholder": "Файл һайланмаған",
  "ooui-selectfile-dragdrop-placeholder": "Файлды бында күсерегеҙ",
} satisfies Partial<Record<MessageKey, MessageValue>>;
