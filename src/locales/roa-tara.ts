import type { MessageKey, MessageValue } from "../i18n";

/**
 * 塔伦蒂诺语消息包：译文取自原版OOUI dist/i18n/roa-tara.json（0.54.2，译者见原文件@metadata）。
 * 类型为Partial——缺键由英文默认逐键兜底
 */
export default {
  "ooui-copytextlayout-copy": "Copie",
  "ooui-outline-control-move-down": "Spuèste 'a vôsce sotte",
  "ooui-outline-control-move-up": "Spuèste 'a vôsce sus",
  "ooui-outline-control-remove": "Live 'a vôsce",
  "ooui-toolgroup-expand": "De cchiù",
  "ooui-toolgroup-collapse": "De mene",
  "ooui-item-remove": "Live",
  "ooui-dialog-message-accept": "OK",
  "ooui-dialog-message-reject": "Annulle",
  "ooui-dialog-process-error": "Quacche cose ha sciute stuèrte",
  "ooui-dialog-process-dismiss": "Scitte",
  "ooui-dialog-process-retry": "Pruève arrete",
  "ooui-dialog-process-continue": "Condinue",
  "ooui-combobox-button-label": "Opziune de mitte e live",
  "ooui-selectfile-button-select": "Scacchie 'nu file",
  "ooui-selectfile-button-select-multiple": "Scacchie le file",
  "ooui-selectfile-placeholder": "Nisciune file scacchiate",
  "ooui-selectfile-dragdrop-placeholder": "Scitte 'u file aqquà",
  "ooui-selectfile-dragdrop-placeholder-multiple": "Scitte le file aqquà",
  "ooui-popup-widget-close-button-aria-label": "Achiude",
  "ooui-field-help": "Aijute",
} satisfies Partial<Record<MessageKey, MessageValue>>;
