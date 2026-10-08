import type { MessageKey, MessageValue } from "../i18n";

/**
 * 掸语消息包：译文取自原版OOUI dist/i18n/shn.json（0.54.2，译者见原文件@metadata）。
 * 类型为Partial——缺键由英文默认逐键兜底
 */
export default {
  "ooui-outline-control-move-down": "ၶၢႆႉလူင်းၽၢႆႇတႂ်ႈ",
  "ooui-outline-control-move-up": "ၶၢႆႉၶိုၼ်ႈၽၢႆႇၼိူဝ်",
  "ooui-outline-control-remove": "ထွၼ်ပႅတ်ႈ ဢၼ်ၶဝ်ႈပႃး",
  "ooui-toolgroup-expand": "ထႅင်ႈ",
  "ooui-toolgroup-collapse": "ဢေႇလိူဝ်",
  "ooui-dialog-message-accept": "ဢူဝ်ႇၶေႇ",
  "ooui-dialog-message-reject": "ယႃႉၶိုၼ်း",
  "ooui-dialog-process-error": "သေဢၼ်ဢၼ်ၽိတ်းပိူင်ႈဝႆႉ",
  "ooui-dialog-process-dismiss": "လူတ်းၵၢၼ်",
  "ooui-dialog-process-retry": "ၶတ်းၸႂ်ထႅင်ႈ",
  "ooui-dialog-process-continue": "သိုပ်ႇၼႃႈ",
  "ooui-selectfile-button-select": "လိူၵ်ႈၾၢႆႇ",
  "ooui-selectfile-placeholder": "ဢမ်ႇလႆႈလိူၵ်ႈ ၾၢႆႇသင်ဝႆႉ",
  "ooui-selectfile-dragdrop-placeholder": "ဢဝ်ၾၢႆႇ သႂ်ႇတီႈၼႆႉ",
} satisfies Partial<Record<MessageKey, MessageValue>>;
