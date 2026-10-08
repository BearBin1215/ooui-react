import type { MessageKey, MessageValue } from "../i18n";

/**
 * 古吉拉特语消息包：译文取自原版OOUI dist/i18n/gu.json（0.54.2，译者见原文件@metadata）。
 * 类型为Partial——缺键由英文默认逐键兜底
 */
export default {
  "ooui-outline-control-move-down": "વસ્તુ નીચે ખસેડો",
  "ooui-outline-control-move-up": "વસ્તુ ઉપર ખસેડો",
  "ooui-outline-control-remove": "વસ્તુ હટાવો",
  "ooui-toolgroup-expand": "વધુ",
  "ooui-toolgroup-collapse": "ઓછા",
  "ooui-item-remove": "દૂર કરો",
  "ooui-dialog-message-accept": "બરાબર",
  "ooui-dialog-message-reject": "રદ કરો",
  "ooui-dialog-process-error": "કંઇક ગરબડ થઇ",
  "ooui-dialog-process-dismiss": "વિસર્જન",
  "ooui-dialog-process-retry": "ફરી પ્રયત્ન કરો",
  "ooui-dialog-process-continue": "ચાલુ રાખો",
  "ooui-selectfile-button-select": "ફાઈલ પસંદ કરો",
  "ooui-selectfile-placeholder": "કોઇ ફાઇલ પસંદ નથી કરાઈ",
  "ooui-selectfile-dragdrop-placeholder": "અહીં ફાઇલ મૂકો",
  "ooui-field-help": "મદદ",
} satisfies Partial<Record<MessageKey, MessageValue>>;
