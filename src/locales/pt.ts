import type { MessageKey, MessageValue } from "../i18n";

/**
 * 葡萄牙语消息包：译文取自原版OOUI dist/i18n/pt.json（0.54.2，译者见原文件@metadata）。
 * 类型为Partial——缺键由英文默认逐键兜底
 */
export default {
  "ooui-copytextlayout-copy": "Copiar",
  "ooui-outline-control-move-down": "Mover item para baixo",
  "ooui-outline-control-move-up": "Mover item para cima",
  "ooui-outline-control-remove": "Remover item",
  "ooui-toolgroup-expand": "Mais",
  "ooui-toolgroup-collapse": "Menos",
  "ooui-item-remove": "Remover",
  "ooui-dialog-message-accept": "OK",
  "ooui-dialog-message-reject": "Cancelar",
  "ooui-dialog-process-error": "Algo correu mal",
  "ooui-dialog-process-dismiss": "Ignorar",
  "ooui-dialog-process-retry": "Tentar novamente",
  "ooui-dialog-process-continue": "Continuar",
  "ooui-combobox-button-label": "Opções de alternância",
  "ooui-selectfile-button-select": "Selecionar um ficheiro",
  "ooui-selectfile-button-select-multiple": "Selecionar ficheiros",
  "ooui-selectfile-placeholder": "Nenhum ficheiro selecionado",
  "ooui-selectfile-dragdrop-placeholder": "Largue aqui o ficheiro",
  "ooui-selectfile-dragdrop-placeholder-multiple": "Largar aqui os ficheiros",
  "ooui-popup-widget-close-button-aria-label": "Fechar",
  "ooui-field-help": "Ajuda",
} satisfies Partial<Record<MessageKey, MessageValue>>;
