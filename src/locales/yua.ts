import type { MessageKey, MessageValue } from "../i18n";

/**
 * 尤卡坦玛雅语消息包：译文取自原版OOUI dist/i18n/yua.json（0.54.2，译者见原文件@metadata）。
 * 类型为Partial——缺键由英文默认逐键兜底
 */
export default {
  "ooui-copytextlayout-copy": "óochelts'íib",
  "ooui-outline-control-move-down": "Péeksik le ba'alo' tak kaambal",
  "ooui-outline-control-move-up": "Péeks le ba'al ka'analo'",
  "ooui-outline-control-remove": "lu'us le ba'alo'",
  "ooui-toolgroup-expand": "Uláak'",
  "ooui-toolgroup-collapse": "p'íit",
  "ooui-item-remove": "lu'sej",
  "ooui-dialog-message-accept": "Ma'alob",
  "ooui-dialog-message-reject": "k'alej",
  "ooui-dialog-process-error": "Yáan ba'ax ma' jóok' ma'alobí",
  "ooui-dialog-process-back": "Páchil",
  "ooui-dialog-process-dismiss": "jóok'sik",
  "ooui-dialog-process-retry": "ka'a meeyajte",
  "ooui-dialog-process-continue": "Tsaay",
  "ooui-combobox-button-label": "K'ex ba'ax ka béetik",
  "ooui-selectfile-button-select": "Yéey jump'éel k'al meyaj",
  "ooui-selectfile-button-select-multiple": "Yéey k'al meyaj",
  "ooui-selectfile-placeholder": "Mix jump'éel k'al meyaj yéeya'an",
  "ooui-selectfile-dragdrop-placeholder": "ts'áaj le k'al meyaj waye'",
  "ooui-selectfile-dragdrop-placeholder-multiple": "ts'áaj le k'al meyaj waye'",
  "ooui-popup-widget-close-button-aria-label": "K'aal",
  "ooui-field-help": "Áantaj",
} satisfies Partial<Record<MessageKey, MessageValue>>;
