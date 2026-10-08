import type { MessageKey, MessageValue } from "../i18n";

/**
 * 科隆语消息包：译文取自原版OOUI dist/i18n/ksh.json（0.54.2，译者见原文件@metadata）。
 * 类型为Partial——缺键由英文默认逐键兜底
 */
export default {
  "ooui-outline-control-move-down": "Öm eine Plaz noh onge schiehbe",
  "ooui-outline-control-move-up": "Öm eine Plaz noh bovve schiehbe",
  "ooui-outline-control-remove": "Dä Plaz läddesch maache → fott domet!",
  "ooui-toolgroup-expand": "Mih",
  "ooui-toolgroup-collapse": "Winnijer",
  "ooui-dialog-message-accept": "Lohß Jonn!",
  "ooui-dialog-message-reject": "Ophühre",
  "ooui-dialog-process-error": "Öhnsjädd es scheif jejange",
  "ooui-dialog-process-dismiss": "Maach fott, ha_sch jelässe",
  "ooui-dialog-process-retry": "Norr_ens versöhke",
  "ooui-dialog-process-continue": "Wigger maache",
  "ooui-selectfile-button-select": "Söhg en Dattei uß",
  "ooui-selectfile-placeholder": "Kein Dattei es ußjewählt",
} satisfies Partial<Record<MessageKey, MessageValue>>;
