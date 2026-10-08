import type { MessageKey, MessageValue } from "../i18n";

/**
 * 巴赫蒂亚里语消息包：译文取自原版OOUI dist/i18n/bqi.json（0.54.2，译者见原文件@metadata）。
 * 类型为Partial——缺键由英文默认逐键兜底
 */
export default {
  "ooui-outline-control-move-down": "ڤا دڤۈن بوردن آیتم",
  "ooui-outline-control-move-up": "ڤارو بردن آیتم",
  "ooui-outline-control-remove": "ڤورداشتن آیتم",
  "ooui-toolgroup-expand": "بیشتر",
  "ooui-toolgroup-collapse": "کمتر",
  "ooui-dialog-message-accept": "خۈڤإ",
  "ooui-dialog-message-reject": "أنجومشيڤ کردن",
  "ooui-dialog-process-error": "یأ چي ايچو إشتوا إ",
  "ooui-dialog-process-retry": "ز نۉ تلاش کونين",
  "ooui-dialog-process-continue": "ديندا گرهڌن",
  "ooui-selectfile-button-select": "گولإڤورچين کردن جانیا",
  "ooui-selectfile-placeholder": "هيژ جانيایي گولإ ڤورچين نڤابيڌإ",
  "ooui-selectfile-dragdrop-placeholder": "جانيانأ ڤأنين ايچو",
} satisfies Partial<Record<MessageKey, MessageValue>>;
