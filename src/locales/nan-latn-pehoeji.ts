import type { MessageKey, MessageValue } from "../i18n";

/**
 * 闽南语（白话字）消息包：译文取自原版OOUI dist/i18n/nan-latn-pehoeji.json（0.54.2，译者见原文件@metadata）。
 * 类型为Partial——缺键由英文默认逐键兜底
 */
export default {
  "ooui-outline-control-move-down": "Hāng-bo̍k sóa ē-té",
  "ooui-outline-control-move-up": "Hāng-bo̍k sóa téng-bīn",
  "ooui-outline-control-remove": "Sóa cháu hāng-bo̍k",
  "ooui-toolgroup-expand": "Khah chē",
  "ooui-toolgroup-collapse": "Khah kiám",
  "ooui-dialog-message-accept": "Liáu-kái",
  "ooui-dialog-message-reject": "Chhú-siau",
  "ooui-dialog-process-error": "Ū mi̍h bô hó-sè",
  "ooui-dialog-process-dismiss": "Koaiⁿ tiāu",
  "ooui-dialog-process-retry": "Koh chhì khòaⁿ-māi",
  "ooui-dialog-process-continue": "Kè-sio̍k",
  "ooui-selectfile-button-select": "Soán-tek 1-ê tóng-àn",
  "ooui-selectfile-placeholder": "Iáu-bē soán tóng-àn",
  "ooui-selectfile-dragdrop-placeholder": "Kā tóng-àn tàn chia",
} satisfies Partial<Record<MessageKey, MessageValue>>;
