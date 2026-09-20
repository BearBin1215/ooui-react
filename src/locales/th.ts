import type { MessageKey, MessageValue } from "../i18n";

/**
 * 泰语消息包：译文取自原版OOUI dist/i18n/th.json（0.54.2，译者见原文件@metadata）。
 * 类型为Partial——缺键由英文默认逐键兜底
 */
export default {
  "ooui-copytextlayout-copy": "คัดลอก",
  "ooui-outline-control-move-down": "ย้ายรายการลง",
  "ooui-outline-control-move-up": "ย้ายรายการขึ้น",
  "ooui-outline-control-remove": "เอารายการออก",
  "ooui-toolgroup-expand": "เพิ่มเติม",
  "ooui-toolgroup-collapse": "น้อยลง",
  "ooui-item-remove": "เอาออก",
  "ooui-dialog-message-accept": "ตกลง",
  "ooui-dialog-message-reject": "ยกเลิก",
  "ooui-dialog-process-error": "มีบางอย่างผิดพลาด",
  "ooui-dialog-process-dismiss": "รับทราบ",
  "ooui-dialog-process-retry": "ลองอีกครั้ง",
  "ooui-dialog-process-continue": "ดำเนินการต่อ",
  "ooui-combobox-button-label": "สลับตัวเลือก",
  "ooui-selectfile-button-select": "เลือกไฟล์",
  "ooui-selectfile-button-select-multiple": "เลือกไฟล์",
  "ooui-selectfile-placeholder": "ไม่ได้เลือกไฟล์ใด",
  "ooui-selectfile-dragdrop-placeholder": "หย่อนไฟล์ลงที่นี่",
  "ooui-selectfile-dragdrop-placeholder-multiple": "หย่อนไฟล์ที่นี่",
  "ooui-popup-widget-close-button-aria-label": "ปิด",
  "ooui-field-help": "วิธีใช้",
} satisfies Partial<Record<MessageKey, MessageValue>>;
