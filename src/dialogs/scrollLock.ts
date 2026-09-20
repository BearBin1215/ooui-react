/**
 * 弹窗滚动锁：弹窗处于打开周期时给body/html加类锁定背景滚动，叠加打开时按登记表计数，
 * 最后一个弹窗teardown后解锁。另承担满屏且ready时的iOS触摸滚动兜底（加类前记录根滚动
 * 位置、摘类后还原——类生效期间文档高度被收掉，scrollTop写不进去）。
 * 类规则由主题CSS承接，本模块不写样式；同形的登记表形态另见isolation.ts。
 * 与原版`WindowManager.toggleGlobalEvents`/`togglePreventIosScrolling`的差异（触发判定、
 * 施加范围、滚动根元素）见dev-docs/DEVIATIONS.md「等效替代」。
 */

/**
 * 本模块写入body/html的类名，即主题CSS的选择器契约（勿在别处另抄字面量；
 * `theme-contract.node.test.ts`直接消费本表核对上游未改名）
 */
export const SCROLL_LOCK_CLASSES = {
  /** 打开周期内锁定背景滚动（主题：`body{overflow:hidden}`；html非满屏`scrollbar-gutter:stable`） */
  active: "oo-ui-windowManager-modal-active",
  /** 任一弹窗为实际满屏态（比原版getSize()的视口判定更宽松地覆盖叠加场景） */
  activeFullscreen: "oo-ui-windowManager-modal-active-fullscreen",
  /** iOS触摸滚动兜底（主题：`height:100%;overflow:hidden`，同时落在body与html两处） */
  iosModalReady: "oo-ui-windowManager-ios-modal-ready",
} as const;

/** 处于打开周期的弹窗登记表：key为弹窗实例的登记句柄，value为其当前满屏态与ready态 */
const openedDialogs = new Map<object, { full: boolean; ready: boolean }>();

/** iOS兜底施加前记录的根滚动位置（加类会把文档滚动高度收掉、scrollTop被钳到0） */
let iosOrigScrollTop = 0;

/** 当前是否已施加iOS兜底（驱动「加类前记录、摘类后还原」的一次性配对） */
let iosLockApplied = false;

/** 是否按iOS触摸滚动兜底处理（能力判定，差异说明见dev-docs/DEVIATIONS.md「等效替代」） */
const isTouchDevice = (): boolean => navigator.maxTouchPoints > 0;

/** 根滚动元素；`document.scrollingElement`是原版`getRootScrollableElement`的标准等价物 */
const getScrollRoot = (): Element =>
  document.scrollingElement ?? document.documentElement;

/** 依据登记表同步body/html的滚动锁与iOS兜底类 */
function syncScrollLockClasses(): void {
  const entries = [...openedDialogs.values()];
  const locked = entries.length > 0;
  const fullscreen = entries.some(({ full }) => full);
  const body = document.body;
  const html = document.documentElement;
  body.classList.toggle(SCROLL_LOCK_CLASSES.active, locked);
  body.classList.toggle(SCROLL_LOCK_CLASSES.activeFullscreen, locked && fullscreen);
  html.classList.toggle(SCROLL_LOCK_CLASSES.active, locked);
  html.classList.toggle(SCROLL_LOCK_CLASSES.activeFullscreen, locked && fullscreen);

  const iosWanted =
    locked && isTouchDevice() && entries.some(({ full, ready }) => full && ready);
  // 记录必须早于落类（落类后读scrollTop已被钳成0）
  if (iosWanted && !iosLockApplied) {
    iosOrigScrollTop = getScrollRoot().scrollTop;
  }
  body.classList.toggle(SCROLL_LOCK_CLASSES.iosModalReady, iosWanted);
  html.classList.toggle(SCROLL_LOCK_CLASSES.iosModalReady, iosWanted);
  // 还原必须晚于摘类（类生效期间文档高度被收掉，scrollTop写不进去）
  if (!iosWanted && iosLockApplied) {
    getScrollRoot().scrollTop = iosOrigScrollTop;
  }
  iosLockApplied = iosWanted;
}

/**
 * 登记弹窗进入打开周期并同步滚动锁；已登记时为幂等更新（full/ready翻转后重新登记）
 * @param handle 弹窗实例的稳定句柄对象，作为登记表key
 * @param state 当前满屏态（含窄屏自动满屏）与ready态，两者均参与iOS兜底的判定
 */
export function acquireScrollLock(
  handle: object,
  state: { full: boolean; ready: boolean },
): void {
  openedDialogs.set(handle, state);
  syncScrollLockClasses();
}

/** 注销弹窗的滚动锁登记（teardown完成或组件卸载时调用），最后一个注销时解锁；未登记时为空操作 */
export function releaseScrollLock(handle: object): void {
  if (openedDialogs.delete(handle)) {
    syncScrollLockClasses();
  }
}
