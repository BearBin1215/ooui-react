import type { MessageKey, MessageValue } from "../i18n";

/**
 * 泰卢固语消息包：译文取自原版OOUI dist/i18n/te.json（0.54.2，译者见原文件@metadata）。
 * 类型为Partial——缺键由英文默认逐键兜底
 */
export default {
  "ooui-copytextlayout-copy": "కాపీచేయి",
  "ooui-outline-control-move-down": "అంశాన్ని కిందికి జరుపు",
  "ooui-outline-control-move-up": "అంశాన్ని పైకి జరుపు",
  "ooui-outline-control-remove": "అంశాన్ని తీసివేయి",
  "ooui-toolgroup-expand": "మరిన్ని",
  "ooui-toolgroup-collapse": "కొన్ని",
  "ooui-item-remove": "తొలగించు",
  "ooui-dialog-message-accept": "సరే",
  "ooui-dialog-message-reject": "రద్దుచేయి",
  "ooui-dialog-process-error": "ఏదో పొరపాటు జరిగింది",
  "ooui-dialog-process-dismiss": "తీసివేయి",
  "ooui-dialog-process-retry": "మళ్ళీ ప్రయత్నించు",
  "ooui-dialog-process-continue": "కొనసాగించు",
  "ooui-selectfile-button-select": "దస్త్రాన్ని ఎంచుకోండి",
  "ooui-selectfile-placeholder": "దస్త్రం దేన్నీ ఎంచుకోలేదు",
  "ooui-selectfile-dragdrop-placeholder": "దస్త్రాన్ని ఇక్కడ పడేయండి",
  "ooui-field-help": "సహాయం",
} satisfies Partial<Record<MessageKey, MessageValue>>;
