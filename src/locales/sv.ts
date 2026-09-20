import type { MessageKey, MessageValue } from "../i18n";

/**
 * 瑞典语消息包：译文取自原版OOUI dist/i18n/sv.json（0.54.2，译者见原文件@metadata）。
 * 类型为Partial——缺键由英文默认逐键兜底
 */
export default {
  "ooui-copytextlayout-copy": "Kopiera",
  "ooui-outline-control-move-down": "Flytta ned objekt",
  "ooui-outline-control-move-up": "Flytta upp objekt",
  "ooui-outline-control-remove": "Ta bort objekt",
  "ooui-toolgroup-expand": "Fler",
  "ooui-toolgroup-collapse": "Färre",
  "ooui-item-remove": "Ta bort",
  "ooui-dialog-message-accept": "OK",
  "ooui-dialog-message-reject": "Avbryt",
  "ooui-dialog-process-error": "Något gick fel",
  "ooui-dialog-process-dismiss": "Stäng",
  "ooui-dialog-process-retry": "Försök igen",
  "ooui-dialog-process-continue": "Fortsätt",
  "ooui-combobox-button-label": "Växla alternativ",
  "ooui-selectfile-button-select": "Välj en fil",
  "ooui-selectfile-button-select-multiple": "Välj filer",
  "ooui-selectfile-placeholder": "Ingen fil är vald",
  "ooui-selectfile-dragdrop-placeholder": "Släpp filen här",
  "ooui-selectfile-dragdrop-placeholder-multiple": "Släpp filer här",
  "ooui-popup-widget-close-button-aria-label": "Stäng",
  "ooui-field-help": "Hjälp",
} satisfies Partial<Record<MessageKey, MessageValue>>;
