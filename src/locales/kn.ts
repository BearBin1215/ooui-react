import type { MessageKey, MessageValue } from "../i18n";

/**
 * 卡纳达语消息包：译文取自原版OOUI dist/i18n/kn.json（0.54.2，译者见原文件@metadata）。
 * 类型为Partial——缺键由英文默认逐键兜底
 */
export default {
  "ooui-outline-control-move-down": "ವಸ್ತುವನ್ನು ಕೆಳಗೆ ಸರಿಸು",
  "ooui-outline-control-move-up": "ವಸ್ತುವನ್ನು ಮೇಲೆ ಸರಿಸು",
  "ooui-outline-control-remove": "ವಸ್ತುವನ್ನು ತೆಗೆ",
  "ooui-toolgroup-expand": "ಇನ್ನಷ್ಟು",
  "ooui-toolgroup-collapse": "ಕೆಲವೇ ಕೆಲವು",
  "ooui-dialog-message-accept": "ಸರಿ",
  "ooui-dialog-message-reject": "ರದ್ದುಮಾಡಿ",
  "ooui-dialog-process-error": "ಏನೋ ಎಡವಟ್ಟಾಗಿದೆ....",
  "ooui-dialog-process-dismiss": "ತೆಗೆದುಹಾಕು",
  "ooui-dialog-process-retry": "ಮತ್ತೆ ಪ್ರಯತ್ನಿಸಿ",
  "ooui-dialog-process-continue": "ಮುಂದುವರೆಸು",
  "ooui-selectfile-button-select": "ಕಡತವನ್ನು ಆಯ್ಕೆಮಾಡಿ",
  "ooui-selectfile-placeholder": "ಕಡತವು ಆಯ್ಕೆಯಾಗಿಲ್ಲ",
  "ooui-selectfile-dragdrop-placeholder": "ಇಲ್ಲಿ ಕಡತವನ್ನು ಬಿಡಿ",
} satisfies Partial<Record<MessageKey, MessageValue>>;
