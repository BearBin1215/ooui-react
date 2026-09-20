import type { MessageKey, MessageValue } from "../i18n";

/**
 * 日语消息包：译文取自原版OOUI dist/i18n/ja.json（0.54.2，译者见原文件@metadata）。
 * 类型为Partial——缺键由英文默认逐键兜底
 */
export default {
  "ooui-copytextlayout-copy": "コピー",
  "ooui-outline-control-move-down": "項目を下に移動させる",
  "ooui-outline-control-move-up": "項目を上に移動させる",
  "ooui-outline-control-remove": "項目を除去",
  "ooui-toolgroup-expand": "続き",
  "ooui-toolgroup-collapse": "折り畳む",
  "ooui-item-remove": "削除",
  "ooui-dialog-message-accept": "OK",
  "ooui-dialog-message-reject": "キャンセル",
  "ooui-dialog-process-error": "エラーが発生しました…",
  "ooui-dialog-process-back": "戻る",
  "ooui-dialog-process-dismiss": "閉じる",
  "ooui-dialog-process-retry": "もう一度試す",
  "ooui-dialog-process-continue": "続行",
  "ooui-combobox-button-label": "オプションの切り替え",
  "ooui-selectfile-button-select": "ファイルを選択",
  "ooui-selectfile-button-select-multiple": "ファイルを選択",
  "ooui-selectfile-placeholder": "ファイルが選択されていません",
  "ooui-selectfile-dragdrop-placeholder": "ファイルをここにドロップ",
  "ooui-selectfile-dragdrop-placeholder-multiple": "ファイルをここにドロップしてください",
  "ooui-popup-widget-close-button-aria-label": "閉じる",
  "ooui-field-help": "ヘルプ",
} satisfies Partial<Record<MessageKey, MessageValue>>;
