import type { MessageKey, MessageValue } from "../i18n";

/**
 * 皮埃蒙特语消息包：译文取自原版OOUI dist/i18n/pms.json（0.54.2，译者见原文件@metadata）。
 * 类型为Partial——缺键由英文默认逐键兜底
 */
export default {
  "ooui-copytextlayout-copy": "Copié",
  "ooui-outline-control-move-down": "Fé calé giù l'element",
  "ooui-outline-control-move-up": "Fé monté l'element",
  "ooui-outline-control-remove": "Gavé j'element",
  "ooui-toolgroup-expand": "Pi",
  "ooui-toolgroup-collapse": "Men",
  "ooui-dialog-message-accept": "Va bin",
  "ooui-dialog-message-reject": "Scancelé",
  "ooui-dialog-process-error": "Quaicòs a l'é andà mal",
  "ooui-dialog-process-dismiss": "Stërmé",
  "ooui-dialog-process-retry": "Preuva torna",
  "ooui-dialog-process-continue": "Continua",
  "ooui-selectfile-placeholder": "Gnun archivi selessionà",
} satisfies Partial<Record<MessageKey, MessageValue>>;
