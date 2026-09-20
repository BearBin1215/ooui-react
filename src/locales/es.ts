import type { MessageKey, MessageValue } from "../i18n";

/**
 * 西班牙语消息包：译文取自原版OOUI dist/i18n/es.json（0.54.2，译者见原文件@metadata）。
 * 类型为Partial——缺键由英文默认逐键兜底
 */
export default {
  "ooui-copytextlayout-copy": "Copiar",
  "ooui-outline-control-move-down": "Bajar elemento",
  "ooui-outline-control-move-up": "Subir elemento",
  "ooui-outline-control-remove": "Eliminar elemento",
  "ooui-toolgroup-expand": "Más",
  "ooui-toolgroup-collapse": "Menos",
  "ooui-item-remove": "Quitar",
  "ooui-dialog-message-accept": "Aceptar",
  "ooui-dialog-message-reject": "Cancelar",
  "ooui-dialog-process-error": "Algo salió mal",
  "ooui-dialog-process-dismiss": "Descartar",
  "ooui-dialog-process-retry": "Intentar de nuevo",
  "ooui-dialog-process-continue": "Continuar",
  "ooui-combobox-button-label": "Alternar opciones",
  "ooui-selectfile-button-select": "Selecciona un archivo",
  "ooui-selectfile-button-select-multiple": "Seleccionar archivos",
  "ooui-selectfile-placeholder": "Ningún archivo seleccionado",
  "ooui-selectfile-dragdrop-placeholder": "Suelta el archivo aquí",
  "ooui-selectfile-dragdrop-placeholder-multiple": "Coloca archivos aquí",
  "ooui-popup-widget-close-button-aria-label": "Cerrar",
  "ooui-field-help": "Ayuda",
} satisfies Partial<Record<MessageKey, MessageValue>>;
