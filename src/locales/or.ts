import type { MessageKey, MessageValue } from "../i18n";

/**
 * 奥里亚语消息包：译文取自原版OOUI dist/i18n/or.json（0.54.2，译者见原文件@metadata）。
 * 类型为Partial——缺键由英文默认逐键兜底
 */
export default {
  "ooui-outline-control-move-down": "ବସ୍ତୁଟିକୁ ତଳକୁ ଘୁଞ୍ଚାନ୍ତୁ",
  "ooui-outline-control-move-up": "ବସ୍ତୁଟିକୁ ଉପରକୁ ଘୁଞ୍ଚାନ୍ତୁ",
  "ooui-outline-control-remove": "ବସ୍ତୁଟିକୁ ଲିଭାନ୍ତୁ",
  "ooui-toolgroup-expand": "ଅଧିକ",
  "ooui-toolgroup-collapse": "ଅଳ୍ପ",
  "ooui-dialog-message-accept": "ହେଉ",
  "ooui-dialog-message-reject": "ନାକଚ",
  "ooui-dialog-process-error": "ଅସୁବିଧାଟିଏ ଘଟିଲା",
  "ooui-dialog-process-dismiss": "ଖାରଜ",
  "ooui-dialog-process-retry": "ଆଉ ଥରେ ଚେଷ୍ଟା କରନ୍ତୁ",
  "ooui-dialog-process-continue": "ଚାଲୁରଖିବେ",
  "ooui-selectfile-placeholder": "କୌଣସି ଫାଇଲ ବଛାଯାଇନାହିଁ",
} satisfies Partial<Record<MessageKey, MessageValue>>;
