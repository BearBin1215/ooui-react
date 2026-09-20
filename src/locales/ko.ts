import type { MessageKey, MessageValue } from "../i18n";

/**
 * 韩语消息包：译文取自原版OOUI dist/i18n/ko.json（0.54.2，译者见原文件@metadata）。
 * 类型为Partial——缺键由英文默认逐键兜底
 */
export default {
  "ooui-copytextlayout-copy": "복사",
  "ooui-outline-control-move-down": "항목을 아래로 이동",
  "ooui-outline-control-move-up": "항목을 위로 이동",
  "ooui-outline-control-remove": "항목 제거",
  "ooui-toolgroup-expand": "더 보기",
  "ooui-toolgroup-collapse": "덜 보기",
  "ooui-item-remove": "제거",
  "ooui-dialog-message-accept": "확인",
  "ooui-dialog-message-reject": "취소",
  "ooui-dialog-process-error": "무언가가 잘못되었습니다",
  "ooui-dialog-process-back": "뒤로",
  "ooui-dialog-process-dismiss": "숨기기",
  "ooui-dialog-process-retry": "다시 시도하세요",
  "ooui-dialog-process-continue": "계속",
  "ooui-combobox-button-label": "토글 선택",
  "ooui-selectfile-button-select": "파일을 선택하세요",
  "ooui-selectfile-button-select-multiple": "파일 선택",
  "ooui-selectfile-placeholder": "선택한 파일 없음",
  "ooui-selectfile-dragdrop-placeholder": "여기에 파일을 놓으세요",
  "ooui-selectfile-dragdrop-placeholder-multiple": "여기에 파일을 놓으세요",
  "ooui-popup-widget-close-button-aria-label": "닫기",
  "ooui-field-help": "도움말",
} satisfies Partial<Record<MessageKey, MessageValue>>;
