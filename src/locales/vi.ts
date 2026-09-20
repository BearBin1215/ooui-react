import type { MessageKey, MessageValue } from "../i18n";

/**
 * 越南语消息包：译文取自原版OOUI dist/i18n/vi.json（0.54.2，译者见原文件@metadata）。
 * 类型为Partial——缺键由英文默认逐键兜底
 */
export default {
  "ooui-copytextlayout-copy": "Sao chép",
  "ooui-outline-control-move-down": "Chuyển mục xuống",
  "ooui-outline-control-move-up": "Chuyển mục lên",
  "ooui-outline-control-remove": "Xóa mục",
  "ooui-toolgroup-expand": "Mở rộng",
  "ooui-toolgroup-collapse": "Rút gọn",
  "ooui-item-remove": "Loại bỏ",
  "ooui-dialog-message-accept": "OK",
  "ooui-dialog-message-reject": "Hủy bỏ",
  "ooui-dialog-process-error": "Đã xảy ra sự cố",
  "ooui-dialog-process-dismiss": "Bỏ qua",
  "ooui-dialog-process-retry": "Thử lại",
  "ooui-dialog-process-continue": "Tiếp tục",
  "ooui-combobox-button-label": "Bật/tắt tùy chọn",
  "ooui-selectfile-button-select": "Chọn tập tin",
  "ooui-selectfile-button-select-multiple": "Chọn các tập tin",
  "ooui-selectfile-placeholder": "Không có tập tin nào được chọn",
  "ooui-selectfile-dragdrop-placeholder": "Thả tập tin vào đây",
  "ooui-selectfile-dragdrop-placeholder-multiple": "Thả các tập tin vào đây",
  "ooui-popup-widget-close-button-aria-label": "Đóng",
  "ooui-field-help": "Trợ giúp",
} satisfies Partial<Record<MessageKey, MessageValue>>;
