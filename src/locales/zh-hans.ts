import type { MessageKey, MessageValue } from "../i18n";

/**
 * 简体中文消息包：译文取自原版OOUI dist/i18n/zh-hans.json（0.54.2，译者见原文件@metadata），
 * 与MediaWiki站点mw.msg的同名消息一致。类型为Partial——缺键由英文默认逐键兜底
 */
export default {
  "ooui-copytextlayout-copy": "复制",
  "ooui-outline-control-move-down": "向下移动一项",
  "ooui-outline-control-move-up": "向上移动一项",
  "ooui-outline-control-remove": "移除项目",
  "ooui-toolgroup-expand": "更多",
  "ooui-toolgroup-collapse": "更少",
  "ooui-item-remove": "移除",
  "ooui-dialog-message-accept": "确定",
  "ooui-dialog-message-reject": "取消",
  "ooui-dialog-process-error": "发生了一些错误",
  "ooui-dialog-process-back": "返回",
  "ooui-dialog-process-dismiss": "关闭",
  "ooui-dialog-process-retry": "重试",
  "ooui-dialog-process-continue": "继续",
  "ooui-combobox-button-label": "切换选项",
  "ooui-selectfile-button-select": "选择一个文件",
  "ooui-selectfile-button-select-multiple": "选择文件",
  "ooui-selectfile-placeholder": "没有选定文件",
  "ooui-selectfile-dragdrop-placeholder": "拖放文件到这里",
  "ooui-selectfile-dragdrop-placeholder-multiple": "拖放文件到这里",
  "ooui-popup-widget-close-button-aria-label": "关闭",
  "ooui-field-help": "帮助",
} satisfies Partial<Record<MessageKey, MessageValue>>;
