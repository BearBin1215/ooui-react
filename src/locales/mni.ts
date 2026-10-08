import type { MessageKey, MessageValue } from "../i18n";

/**
 * 曼尼普尔语消息包：译文取自原版OOUI dist/i18n/mni.json（0.54.2，译者见原文件@metadata）。
 * 类型为Partial——缺键由英文默认逐键兜底
 */
export default {
  "ooui-outline-control-move-down": "ꯄꯣꯠꯂꯝ ꯃꯈꯥꯗ ꯂꯣꯡꯍꯟꯕ",
  "ooui-outline-control-move-up": "ꯄꯣꯠꯂꯝ ꯃꯊꯛꯇ ꯂꯦꯡꯍꯟꯕ",
  "ooui-outline-control-remove": "ꯄꯣꯠꯂꯝ ꯂꯧꯊꯣꯛꯄ",
  "ooui-toolgroup-expand": "ꯋꯥꯠꯂꯤ",
  "ooui-toolgroup-collapse": "ꯌꯥꯝꯗꯕ",
  "ooui-item-remove": "ꯂꯧꯊꯣꯛꯄ",
  "ooui-dialog-message-accept": "ꯌꯥꯔꯦ",
  "ooui-dialog-message-reject": "ꯇꯣꯛꯄ",
  "ooui-dialog-process-error": "ꯀꯔꯤꯒꯨꯝꯕ ꯈꯔꯥ ꯁꯣꯏꯔꯦ",
  "ooui-dialog-process-dismiss": "ꯀꯛꯊꯠꯄ",
  "ooui-dialog-process-retry": "ꯑꯃꯨꯛ ꯍꯟꯅ ꯇꯧꯔꯣ",
  "ooui-dialog-process-continue": "ꯃꯈꯥꯆꯠꯊꯧ",
  "ooui-selectfile-button-select": "ꯐꯥꯏꯜ ꯱ ꯈꯟꯂꯨ",
  "ooui-selectfile-button-select-multiple": "ꯐꯥꯏꯜꯁꯤꯡ ꯈꯟꯂꯨ",
  "ooui-selectfile-placeholder": "ꯐꯥꯏꯜ ꯑꯃꯇ ꯈꯟꯗꯔꯤ",
  "ooui-selectfile-dragdrop-placeholder": "ꯐꯥꯏꯜꯗꯨ ꯃꯁꯤꯗ ꯊꯝꯃꯨ",
  "ooui-selectfile-dragdrop-placeholder-multiple": "ꯐꯥꯏꯜꯃꯈꯦ ꯃꯁꯤꯗ ꯊꯝꯃꯨ",
  "ooui-popup-widget-close-button-aria-label": "ꯈꯨꯝꯖꯤꯟꯕ",
  "ooui-field-help": "ꯃꯇꯦꯡ",
} satisfies Partial<Record<MessageKey, MessageValue>>;
