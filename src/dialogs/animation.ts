/**
 * 弹窗开关动画时序（ms），对齐主题CSS的window动画。
 * 由Dialog与命令式弹窗宿主（imperative.tsx）共用，故独立为无依赖的叶子模块
 */
export const DIALOG_ANIMATION = {
  /** 打开动画：置active（frame以scale(0.5)+透明呈现）后，进入setup态（scale→1+淡入）的延时 */
  setupDelay: 60,
  /** 打开动画：进入ready终态（打开动画结束）的延时，自打开起算 */
  readyDelay: 120,
  /** 关闭动画：移除setup/ready后播放缩小淡出，此时长后移除active彻底隐藏 */
  closeDuration: 250,
} as const;
