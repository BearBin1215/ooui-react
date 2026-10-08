import type { MessageKey, MessageValue } from "../i18n";

/**
 * 阿斯图里亚斯语消息包：译文取自原版OOUI dist/i18n/ast.json（0.54.2，译者见原文件@metadata）。
 * 类型为Partial——缺键由英文默认逐键兜底
 */
export default {
  "ooui-copytextlayout-copy": "Copiar",
  "ooui-outline-control-move-down": "Mover abaxo l'elementu",
  "ooui-outline-control-move-up": "Mover arriba l'elementu",
  "ooui-outline-control-remove": "Desaniciar elementu",
  "ooui-toolgroup-expand": "Más",
  "ooui-toolgroup-collapse": "Menos",
  "ooui-item-remove": "Desaniciar",
  "ooui-dialog-message-accept": "Aceutar",
  "ooui-dialog-message-reject": "Zarrar",
  "ooui-dialog-process-error": "Daqué funcionó mal",
  "ooui-dialog-process-dismiss": "Descartar",
  "ooui-dialog-process-retry": "Vuelvi a intentalo",
  "ooui-dialog-process-continue": "Siguir",
  "ooui-combobox-button-label": "Llista desplegable pa caxa combinada",
  "ooui-selectfile-button-select": "Seleicionar un ficheru",
  "ooui-selectfile-placeholder": "Nun se seleicionó nengún ficheru",
  "ooui-selectfile-dragdrop-placeholder": "Soltar el ficheru equí",
  "ooui-field-help": "Ayuda",
} satisfies Partial<Record<MessageKey, MessageValue>>;
