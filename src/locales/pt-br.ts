import type { MessageKey, MessageValue } from "../i18n";

/**
 * 巴西葡萄牙语消息包：译文取自原版OOUI dist/i18n/pt-br.json（0.54.2，译者见原文件@metadata）。
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
  "ooui-dialog-process-error": "Algo deu errado",
  "ooui-dialog-process-back": "Voltar",
  "ooui-dialog-process-dismiss": "Dispensar",
  "ooui-dialog-process-retry": "Tente novamente",
  "ooui-dialog-process-continue": "Continuar",
  "ooui-combobox-button-label": "Opções de alternância",
  "ooui-selectfile-button-select": "Selecionar um arquivo",
  "ooui-selectfile-button-select-multiple": "Selecionar arquivos",
  "ooui-selectfile-placeholder": "Nenhum arquivo selecionado",
  "ooui-selectfile-dragdrop-placeholder": "Arraste o arquivo para cá",
  "ooui-selectfile-dragdrop-placeholder-multiple": "Solte os arquivos aqui",
  "ooui-popup-widget-close-button-aria-label": "Fechar",
  "ooui-field-help": "Ajuda",
} satisfies Partial<Record<MessageKey, MessageValue>>;
