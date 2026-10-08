import type { MessageKey, MessageValue } from "../i18n";

/**
 * 伊博语消息包：译文取自原版OOUI dist/i18n/ig.json（0.54.2，译者见原文件@metadata）。
 * 类型为Partial——缺键由英文默认逐键兜底
 */
export default {
  "ooui-copytextlayout-copy": "kopi",
  "ooui-outline-control-move-down": "Wetuo ihe a ala",
  "ooui-outline-control-move-up": "Wegoo ihe a elu",
  "ooui-outline-control-remove": "Wepụ ihe a",
  "ooui-toolgroup-expand": "Ọzọkwa",
  "ooui-toolgroup-collapse": "Ole na ole",
  "ooui-item-remove": "Wepụ",
  "ooui-dialog-message-accept": "ọdimma",
  "ooui-dialog-message-reject": "Hapụ̀",
  "ooui-dialog-process-error": "Enwere ihe na-ezighi ezi",
  "ooui-dialog-process-dismiss": "Ghapụ",
  "ooui-dialog-process-retry": "Nwaa ọzọ",
  "ooui-dialog-process-continue": "Gaa n'ịhu",
  "ooui-combobox-button-label": "Gbanwee nhọrọ",
  "ooui-selectfile-button-select": "Họrọ faịlụ",
  "ooui-selectfile-button-select-multiple": "Họrọ faịlụ",
  "ooui-selectfile-placeholder": "Ọ nweghị faịlụ ahọpụtara",
  "ooui-selectfile-dragdrop-placeholder": "Tinye faịlụ ebe a",
  "ooui-selectfile-dragdrop-placeholder-multiple": "Tinye faịlụ ebe a",
  "ooui-popup-widget-close-button-aria-label": "Mechie",
  "ooui-field-help": "Enyemaka",
} satisfies Partial<Record<MessageKey, MessageValue>>;
