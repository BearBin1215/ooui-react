import type { MessageKey, MessageValue } from "../i18n";

/**
 * 西西里语消息包：译文取自原版OOUI dist/i18n/scn.json（0.54.2，译者见原文件@metadata）。
 * 类型为Partial——缺键由英文默认逐键兜底
 */
export default {
  "ooui-copytextlayout-copy": "Copia",
  "ooui-outline-control-move-down": "Sposta di sutta",
  "ooui-outline-control-move-up": "Sposta di supra",
  "ooui-outline-control-remove": "Leva elementu",
  "ooui-toolgroup-expand": "Àutru",
  "ooui-toolgroup-collapse": "Menu",
  "ooui-item-remove": "Leva",
  "ooui-dialog-message-accept": "OK",
  "ooui-dialog-message-reject": "Annulla",
  "ooui-dialog-process-dismiss": "Ammuccia",
  "ooui-combobox-button-label": "Cancia opzioni",
  "ooui-selectfile-button-select": "Scarta nu file",
  "ooui-selectfile-button-select-multiple": "Scarta file",
  "ooui-selectfile-placeholder": "Nuḍḍu file è scartatu",
  "ooui-popup-widget-close-button-aria-label": "Chiudi",
  "ooui-field-help": "Aiutu",
} satisfies Partial<Record<MessageKey, MessageValue>>;
