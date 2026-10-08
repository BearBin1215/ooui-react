import type { MessageKey, MessageValue } from "../i18n";

/**
 * 加利西亚语消息包：译文取自原版OOUI dist/i18n/gl.json（0.54.2，译者见原文件@metadata）。
 * 类型为Partial——缺键由英文默认逐键兜底
 */
export default {
  "ooui-copytextlayout-copy": "Copiar",
  "ooui-outline-control-move-down": "Mover o elemento abaixo",
  "ooui-outline-control-move-up": "Mover o elemento arriba",
  "ooui-outline-control-remove": "Eliminar o elemento",
  "ooui-toolgroup-expand": "Máis",
  "ooui-toolgroup-collapse": "Menos",
  "ooui-item-remove": "Eliminar",
  "ooui-dialog-message-accept": "Aceptar",
  "ooui-dialog-message-reject": "Cancelar",
  "ooui-dialog-process-error": "Algo foi mal",
  "ooui-dialog-process-back": "Volver",
  "ooui-dialog-process-dismiss": "Agochar",
  "ooui-dialog-process-retry": "Inténtao de novo",
  "ooui-dialog-process-continue": "Continuar",
  "ooui-combobox-button-label": "Alternar as opcións",
  "ooui-selectfile-button-select": "Seleccionar un ficheiro",
  "ooui-selectfile-button-select-multiple": "Seleccionar ficheiros",
  "ooui-selectfile-placeholder": "Non se seleccionou ningún ficheiro",
  "ooui-selectfile-dragdrop-placeholder": "Solta un ficheiro aquí",
  "ooui-selectfile-dragdrop-placeholder-multiple": "Solta os ficheiros aquí",
  "ooui-popup-widget-close-button-aria-label": "Pechar",
  "ooui-field-help": "Axuda",
} satisfies Partial<Record<MessageKey, MessageValue>>;
