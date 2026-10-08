import type { MessageKey, MessageValue } from "../i18n";

/**
 * 达格班尼语消息包：译文取自原版OOUI dist/i18n/dag.json（0.54.2，译者见原文件@metadata）。
 * 类型为Partial——缺键由英文默认逐键兜底
 */
export default {
  "ooui-copytextlayout-copy": "Yaama",
  "ooui-outline-control-move-down": "Zaŋmi item maa sɔŋ gbunni",
  "ooui-outline-control-move-up": "Zaŋ mi item duhi zuɣusaa",
  "ooui-outline-control-remove": "Yihimi item maa",
  "ooui-toolgroup-expand": "Din lahi pahi",
  "ooui-toolgroup-collapse": "Biɛla",
  "ooui-item-remove": "Yihima",
  "ooui-dialog-message-accept": "Tɔ",
  "ooui-dialog-message-reject": "Nyahima",
  "ooui-dialog-process-error": "Binshɛli bi chaŋ viɛnyela",
  "ooui-dialog-process-dismiss": "Kpihimma",
  "ooui-dialog-process-retry": "Labi niŋ yaha",
  "ooui-dialog-process-continue": "Tuɣima",
  "ooui-combobox-button-label": "Toggle piibunima",
  "ooui-selectfile-button-select": "Piimi file",
  "ooui-selectfile-button-select-multiple": "Piimi files",
  "ooui-selectfile-placeholder": "File shɛli bi pii",
  "ooui-selectfile-dragdrop-placeholder": "Zaŋ mi file maa sɔŋ kpe",
  "ooui-selectfile-dragdrop-placeholder-multiple": "Zaŋ mi files sɔŋ kpe",
  "ooui-popup-widget-close-button-aria-label": "Kparima",
  "ooui-field-help": "Sɔŋsim",
} satisfies Partial<Record<MessageKey, MessageValue>>;
