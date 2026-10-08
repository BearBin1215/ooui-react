import type { MessageKey, MessageValue } from "../i18n";

/**
 * 威尔士语消息包：译文取自原版OOUI dist/i18n/cy.json（0.54.2，译者见原文件@metadata）。
 * 类型为Partial——缺键由英文默认逐键兜底
 */
export default {
  "ooui-copytextlayout-copy": "Copïo",
  "ooui-outline-control-move-down": "Symud yr eitem i lawr",
  "ooui-outline-control-move-up": "Symud yr eitem i fyny",
  "ooui-outline-control-remove": "Tynnu'r eitem",
  "ooui-toolgroup-expand": "Rhagor",
  "ooui-toolgroup-collapse": "Llai",
  "ooui-item-remove": "Tynnu",
  "ooui-dialog-message-accept": "Iawn",
  "ooui-dialog-message-reject": "Canslo",
  "ooui-dialog-process-error": "Aeth rhywbeth o’i le",
  "ooui-dialog-process-dismiss": "Gadael",
  "ooui-dialog-process-retry": "Ailgeisio",
  "ooui-dialog-process-continue": "Parhau",
  "ooui-combobox-button-label": "Opsiynau toglo",
  "ooui-selectfile-button-select": "Dewis ffeil",
  "ooui-selectfile-button-select-multiple": "Dewisiwch ffeiliau",
  "ooui-selectfile-placeholder": "Dim ffeil wedi'i dewis",
  "ooui-selectfile-dragdrop-placeholder": "Gollwng ffeil yma",
  "ooui-selectfile-dragdrop-placeholder-multiple": "Gollwng ffeiliau yma",
  "ooui-popup-widget-close-button-aria-label": "Cau",
  "ooui-field-help": "Cymorth",
} satisfies Partial<Record<MessageKey, MessageValue>>;
