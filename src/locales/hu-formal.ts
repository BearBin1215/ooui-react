import type { MessageKey, MessageValue } from "../i18n";

/**
 * 匈牙利语（敬语）消息包：译文取自原版OOUI dist/i18n/hu-formal.json（0.54.2，译者见原文件@metadata）。
 * 类型为Partial——缺键由英文默认逐键兜底
 */
export default {
  "ooui-outline-control-move-down": "Elem mozgatása lefelé",
  "ooui-outline-control-move-up": "Elem mozgatása felfelé",
  "ooui-outline-control-remove": "Elem eltávolítása",
  "ooui-toolgroup-expand": "Tovább",
  "ooui-toolgroup-collapse": "Kevesebb",
  "ooui-dialog-message-accept": "Rendben",
  "ooui-dialog-message-reject": "Mégse",
  "ooui-dialog-process-error": "Valami elromlott.",
  "ooui-dialog-process-dismiss": "Mégse",
  "ooui-dialog-process-retry": "Próbálja újra",
  "ooui-dialog-process-continue": "Folytatás",
  "ooui-selectfile-placeholder": "Nincs fájl kiválasztva",
} satisfies Partial<Record<MessageKey, MessageValue>>;
