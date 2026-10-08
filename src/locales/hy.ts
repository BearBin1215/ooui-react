import type { MessageKey, MessageValue } from "../i18n";

/**
 * 亚美尼亚语消息包：译文取自原版OOUI dist/i18n/hy.json（0.54.2，译者见原文件@metadata）。
 * 类型为Partial——缺键由英文默认逐键兜底
 */
export default {
  "ooui-copytextlayout-copy": "Պատճենել",
  "ooui-outline-control-move-down": "Իջեցնել ներքև",
  "ooui-outline-control-move-up": "Բարձրացնել կետը",
  "ooui-outline-control-remove": "Հեռացնել տարրը",
  "ooui-toolgroup-expand": "Ավելին",
  "ooui-toolgroup-collapse": "Պակաս",
  "ooui-item-remove": "Հեռացնել",
  "ooui-dialog-message-accept": "Լավ",
  "ooui-dialog-message-reject": "Չեղարկել",
  "ooui-dialog-process-error": "Ինչ-որ սխալ է տեղի ունեցել",
  "ooui-dialog-process-back": "Հետ",
  "ooui-dialog-process-dismiss": "Փակել",
  "ooui-dialog-process-retry": "Կրկին փորձել",
  "ooui-dialog-process-continue": "Շարունակել",
  "ooui-selectfile-button-select": "Ընտրել նիշք",
  "ooui-selectfile-placeholder": "Ֆայլն ընտրված չէ",
  "ooui-selectfile-dragdrop-placeholder": "Ֆայլը բերել այստեղ",
  "ooui-popup-widget-close-button-aria-label": "Փակել",
} satisfies Partial<Record<MessageKey, MessageValue>>;
