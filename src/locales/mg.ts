import type { MessageKey, MessageValue } from "../i18n";

/**
 * 马尔加什语消息包：译文取自原版OOUI dist/i18n/mg.json（0.54.2，译者见原文件@metadata）。
 * 类型为Partial——缺键由英文默认逐键兜底
 */
export default {
  "ooui-copytextlayout-copy": "Dikaina",
  "ooui-outline-control-move-down": "Hampidina ilay zavatra",
  "ooui-outline-control-move-up": "Hampiakatra ilay zavatra",
  "ooui-outline-control-remove": "Hanala iay zavatra",
  "ooui-toolgroup-expand": "Be kokoa",
  "ooui-toolgroup-collapse": "Kely kokoa",
  "ooui-item-remove": "Esorina",
  "ooui-dialog-message-accept": "OK",
  "ooui-dialog-message-reject": "Avela",
  "ooui-dialog-process-error": "Nisy hadisoana nitranga",
  "ooui-dialog-process-dismiss": "Esorina",
  "ooui-dialog-process-retry": "Andramana indray",
  "ooui-dialog-process-continue": "Tohizana",
  "ooui-combobox-button-label": "Hamadibadika safidy",
  "ooui-selectfile-button-select": "Misafidia rakitra iray",
  "ooui-selectfile-button-select-multiple": "Hisafidy rakitra",
  "ooui-selectfile-placeholder": "Tsy misy rakitra voafidy",
  "ooui-selectfile-dragdrop-placeholder": "Hametraka rakitra eto",
  "ooui-selectfile-dragdrop-placeholder-multiple": "Apetraho eto ny rakitra",
  "ooui-popup-widget-close-button-aria-label": "Hidina",
  "ooui-field-help": "Fanoroana",
} satisfies Partial<Record<MessageKey, MessageValue>>;
