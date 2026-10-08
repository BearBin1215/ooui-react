import type { MessageKey, MessageValue } from "../i18n";

/**
 * 达加雷语消息包：译文取自原版OOUI dist/i18n/dga.json（0.54.2，译者见原文件@metadata）。
 * 类型为Partial——缺键由英文默认逐键兜底
 */
export default {
  "ooui-copytextlayout-copy": "Kaabo",
  "ooui-outline-control-move-down": "Iri a gaa puli",
  "ooui-outline-control-move-up": "De a gaa saazu",
  "ooui-outline-control-remove": "Iri a boma",
  "ooui-toolgroup-expand": "Mine",
  "ooui-toolgroup-collapse": "Fēē",
  "ooui-item-remove": "Iri",
  "ooui-dialog-message-accept": "Tɔɔ",
  "ooui-dialog-message-reject": "Saaŋ",
  "ooui-dialog-process-error": "Yeli kaŋa kyene kpeɛŋ la",
  "ooui-dialog-process-dismiss": "Page",
  "ooui-dialog-process-retry": "Leɛ e nyɛ",
  "ooui-dialog-process-continue": "Naŋ gɛrɛ",
  "ooui-combobox-button-label": "Leɛre gɔɔloŋ",
  "ooui-selectfile-button-select": "Iri a gampɛle",
  "ooui-selectfile-button-select-multiple": "Iri gampɛle",
  "ooui-selectfile-placeholder": "Gampɛle zaa ba iri",
  "ooui-selectfile-dragdrop-placeholder": "Biŋ a gampɛle a kyɛ",
  "ooui-selectfile-dragdrop-placeholder-multiple": "Biŋ gampɛle kyɛ",
  "ooui-popup-widget-close-button-aria-label": "Page",
  "ooui-field-help": "Sommo",
} satisfies Partial<Record<MessageKey, MessageValue>>;
