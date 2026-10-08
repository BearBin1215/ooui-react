import type { MessageKey, MessageValue } from "../i18n";

/**
 * 上索布语消息包：译文取自原版OOUI dist/i18n/hsb.json（0.54.2，译者见原文件@metadata）。
 * 类型为Partial——缺键由英文默认逐键兜底
 */
export default {
  "ooui-outline-control-move-down": "Zapisk dele přesunyć",
  "ooui-outline-control-move-up": "Zapisk horje přesunyć",
  "ooui-outline-control-remove": "Zapisk wotstronić",
  "ooui-toolgroup-expand": "Wjace",
  "ooui-toolgroup-collapse": "Mjenje",
  "ooui-item-remove": "Wotstronić",
  "ooui-dialog-message-accept": "W porjadku",
  "ooui-dialog-message-reject": "Přetorhnyć",
  "ooui-dialog-process-error": "Něšto je so nimokuliło",
  "ooui-dialog-process-dismiss": "Schować",
  "ooui-dialog-process-retry": "Hišće raz spytać",
  "ooui-dialog-process-continue": "Dale",
  "ooui-combobox-button-label": "Opcije přešaltować",
  "ooui-selectfile-button-select": "Dataju wubrać",
  "ooui-selectfile-button-select-multiple": "Dataje wubrać",
  "ooui-selectfile-placeholder": "Žana dataja wubrana",
  "ooui-selectfile-dragdrop-placeholder": "Dataje tu wotpołožić",
  "ooui-selectfile-dragdrop-placeholder-multiple": "Dataje tu wotpołožić",
  "ooui-popup-widget-close-button-aria-label": "Začinić",
  "ooui-field-help": "Pomoc",
} satisfies Partial<Record<MessageKey, MessageValue>>;
