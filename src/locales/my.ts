import type { MessageKey, MessageValue } from "../i18n";

/**
 * 缅甸语消息包：译文取自原版OOUI dist/i18n/my.json（0.54.2，译者见原文件@metadata）。
 * 类型为Partial——缺键由英文默认逐键兜底
 */
export default {
  "ooui-copytextlayout-copy": "မိတ္တူကူး",
  "ooui-toolgroup-expand": "ပို၍",
  "ooui-toolgroup-collapse": "ပိုနည်း",
  "ooui-item-remove": "ဖယ်ရှားရန်",
  "ooui-dialog-message-accept": "အိုကေ",
  "ooui-dialog-message-reject": "မလုပ်တော့ပါ",
  "ooui-dialog-process-error": "တစ်ခုခု မှားယွင်းသွားခဲ့ပါသည်",
  "ooui-dialog-process-dismiss": "ဖြုတ်ရန်",
  "ooui-dialog-process-retry": "နောက်တစ်ဖန် ကြိုးစားပါ",
  "ooui-dialog-process-continue": "ဆက်လက်",
  "ooui-selectfile-button-select": "ဖိုင်တစ်ခု ရွေးချယ်ရန်",
  "ooui-selectfile-button-select-multiple": "ဖိုင်များကို ရွေးပါ",
  "ooui-selectfile-placeholder": "ဖိုင် ရွေးချယ်မထားပါ",
  "ooui-selectfile-dragdrop-placeholder": "ဖိုင်ကို ဤနေရာတွင် ချလိုက်ပါ",
  "ooui-selectfile-dragdrop-placeholder-multiple": "ဖိုင်များကို ဤနေရာတွင် ချလိုက်ပါ",
  "ooui-popup-widget-close-button-aria-label": "ပိတ်ရန်",
  "ooui-field-help": "အကူအညီ",
} satisfies Partial<Record<MessageKey, MessageValue>>;
