import type { MessageKey, MessageValue } from "../i18n";

/**
 * 法语消息包：译文取自原版OOUI dist/i18n/fr.json（0.54.2，译者见原文件@metadata）。
 * 类型为Partial——缺键由英文默认逐键兜底
 */
export default {
  "ooui-copytextlayout-copy": "Copier",
  "ooui-outline-control-move-down": "Descendre l’élément",
  "ooui-outline-control-move-up": "Monter l’élément",
  "ooui-outline-control-remove": "Supprimer l’élément",
  "ooui-toolgroup-expand": "Plus",
  "ooui-toolgroup-collapse": "Moins",
  "ooui-item-remove": "Retirer",
  "ooui-dialog-message-accept": "OK",
  "ooui-dialog-message-reject": "Annuler",
  "ooui-dialog-process-error": "Quelque chose s’est mal passé",
  "ooui-dialog-process-back": "Retour",
  "ooui-dialog-process-dismiss": "Fermer",
  "ooui-dialog-process-retry": "Réessayer",
  "ooui-dialog-process-continue": "Continuer",
  "ooui-combobox-button-label": "Basculer les options",
  "ooui-selectfile-button-select": "Sélectionner un fichier",
  "ooui-selectfile-button-select-multiple": "Sélectionnez les fichiers",
  "ooui-selectfile-placeholder": "Aucun fichier sélectionné",
  "ooui-selectfile-dragdrop-placeholder": "Déposer le fichier ici",
  "ooui-selectfile-dragdrop-placeholder-multiple": "Glissez les fichiers ici",
  "ooui-popup-widget-close-button-aria-label": "Fermer",
  "ooui-field-help": "Aide",
} satisfies Partial<Record<MessageKey, MessageValue>>;
