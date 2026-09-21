import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { acquireScrollLock, releaseScrollLock } from "./scrollLock";

/**
 * 滚动锁的契约测试：登记计数与类同步即主题CSS的选择器契约
 * （body/html的oo-ui-windowManager-modal-active(-fullscreen)），逐项对齐原版
 * WindowManager.toggleGlobalEvents的栈语义；iOS触摸滚动兜底（原版togglePreventIosScrolling）
 * 的施加条件、类落点与滚动位置还原同在此锁定。vitest为node环境，以桩document/navigator承载断言。
 * 登记表是模块级单例——每个用例经vi.resetModules + 动态import拿到全新模块实例，
 * 用例间顺序无关（静态import下前序用例的登记会泄漏到后续用例）。
 */

let acquire: typeof acquireScrollLock;
let release: typeof releaseScrollLock;
/** 桩根滚动元素：iOS兜底记录/还原scrollTop的载体 */
let scrollRoot: { scrollTop: number };

/** 可断言classList的桩元素 */
function createFakeElement() {
  const classes = new Set<string>();
  return {
    classes,
    classList: {
      toggle(name: string, force?: boolean) {
        const next = force === undefined ? !classes.has(name) : force;
        if (next) {
          classes.add(name);
        } else {
          classes.delete(name);
        }
      },
    },
  };
}

/** 从桩document读取当前锁类状态 */
function lockState() {
  const body = (document as unknown as { body: ReturnType<typeof createFakeElement> })
    .body;
  const html = (
    document as unknown as { documentElement: ReturnType<typeof createFakeElement> }
  ).documentElement;
  return {
    bodyLocked: body.classes.has("oo-ui-windowManager-modal-active"),
    htmlLocked: html.classes.has("oo-ui-windowManager-modal-active"),
    bodyFullscreen: body.classes.has("oo-ui-windowManager-modal-active-fullscreen"),
    htmlFullscreen: html.classes.has("oo-ui-windowManager-modal-active-fullscreen"),
  };
}

/** 从桩document读取iOS兜底类是否落在body与html两处（主题规则须同时命中两者） */
function iosState() {
  const body = (document as unknown as { body: ReturnType<typeof createFakeElement> })
    .body;
  const html = (
    document as unknown as { documentElement: ReturnType<typeof createFakeElement> }
  ).documentElement;
  return {
    body: body.classes.has("oo-ui-windowManager-ios-modal-ready"),
    html: html.classes.has("oo-ui-windowManager-ios-modal-ready"),
  };
}

beforeEach(async () => {
  // 重置模块注册表后再动态import：被测模块（含其模块级登记表）随用例重建
  vi.resetModules();
  ({ acquireScrollLock: acquire, releaseScrollLock: release } =
    await import("./scrollLock"));
  scrollRoot = { scrollTop: 0 };
  vi.stubGlobal("document", {
    body: createFakeElement(),
    documentElement: createFakeElement(),
    scrollingElement: scrollRoot,
  });
  // 缺省非触摸设备（iOS兜底不生效）；触摸用例内另行stub
  vi.stubGlobal("navigator", { maxTouchPoints: 0 });
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("滚动锁登记", () => {
  it("登记后body/html加锁类，无满屏变体", () => {
    acquire({}, { full: false, ready: false });
    expect(lockState()).toEqual({
      bodyLocked: true,
      htmlLocked: true,
      bodyFullscreen: false,
      htmlFullscreen: false,
    });
  });

  it("注销最后一个登记后解锁", () => {
    const handle = {};
    acquire(handle, { full: false, ready: false });
    release(handle);
    expect(lockState()).toEqual({
      bodyLocked: false,
      htmlLocked: false,
      bodyFullscreen: false,
      htmlFullscreen: false,
    });
  });

  it("叠加登记按计数解锁：注销其一仍锁定，全部注销才解锁", () => {
    const handleA = {};
    const handleB = {};
    acquire(handleA, { full: false, ready: false });
    acquire(handleB, { full: false, ready: false });
    release(handleA);
    expect(lockState().bodyLocked).toBe(true);
    release(handleB);
    expect(lockState().bodyLocked).toBe(false);
  });

  it("任一登记满屏时输出fullscreen变体，满屏者注销后变体随之移除", () => {
    const handleA = {};
    const handleB = {};
    acquire(handleA, { full: false, ready: false });
    acquire(handleB, { full: true, ready: false });
    expect(lockState().bodyFullscreen).toBe(true);
    expect(lockState().htmlFullscreen).toBe(true);
    release(handleB);
    expect(lockState().bodyFullscreen).toBe(false);
    expect(lockState().bodyLocked).toBe(true);
  });

  it("重复登记为幂等更新，可翻转满屏态", () => {
    const handle = {};
    acquire(handle, { full: false, ready: false });
    acquire(handle, { full: true, ready: false });
    expect(lockState().htmlFullscreen).toBe(true);
    release(handle);
    expect(lockState().htmlLocked).toBe(false);
  });

  it("注销未登记句柄为空操作，不影响现有锁", () => {
    const handleA = {};
    const handleB = {};
    acquire(handleA, { full: false, ready: false });
    expect(() => release(handleB)).not.toThrow();
    expect(lockState().bodyLocked).toBe(true);
  });

  it("前序用例的登记不泄漏：平衡登记/注销后即解锁", () => {
    // 若模块未随用例重建（前序用例泄漏登记），本用例的注销后仍会残留锁类
    const handle = {};
    acquire(handle, { full: false, ready: false });
    release(handle);
    expect(lockState().bodyLocked).toBe(false);
  });
});

describe("iOS触摸滚动兜底", () => {
  it("触摸设备的满屏弹窗在ready后加类（body与html两处）", () => {
    vi.stubGlobal("navigator", { maxTouchPoints: 5 });
    const handle = {};
    acquire(handle, { full: true, ready: false });
    expect(iosState()).toEqual({ body: false, html: false });
    acquire(handle, { full: true, ready: true });
    expect(iosState()).toEqual({ body: true, html: true });
  });

  it("满屏与ready须同时满足：任一不满足即不加类", () => {
    vi.stubGlobal("navigator", { maxTouchPoints: 5 });
    const notReady = {};
    const notFull = {};
    acquire(notReady, { full: true, ready: false });
    acquire(notFull, { full: false, ready: true });
    expect(iosState()).toEqual({ body: false, html: false });
    release(notReady);
    expect(iosState()).toEqual({ body: false, html: false });
  });

  it("非触摸设备不加类（能力判定的门槛，原版在UA不匹配时同样跳过）", () => {
    acquire({}, { full: true, ready: true });
    expect(iosState()).toEqual({ body: false, html: false });
  });

  it("加类前记录滚动位置、摘类后还原（类生效期间scrollTop会被钳到0）", () => {
    vi.stubGlobal("navigator", { maxTouchPoints: 5 });
    const handle = {};
    scrollRoot.scrollTop = 240;
    acquire(handle, { full: true, ready: true });
    // 记录不改动当前位置
    expect(scrollRoot.scrollTop).toBe(240);
    // 模拟类生效期间浏览器收掉文档高度、把scrollTop钳到0
    scrollRoot.scrollTop = 0;
    release(handle);
    expect(iosState()).toEqual({ body: false, html: false });
    expect(scrollRoot.scrollTop).toBe(240);
  });

  it("叠加：满屏弹窗仍在时不摘类，满屏者注销后摘类并还原", () => {
    vi.stubGlobal("navigator", { maxTouchPoints: 5 });
    const full = {};
    const medium = {};
    scrollRoot.scrollTop = 90;
    acquire(full, { full: true, ready: true });
    acquire(medium, { full: false, ready: true });
    expect(iosState().html).toBe(true);
    // 注销非满屏的那个不改动兜底
    release(medium);
    expect(iosState().html).toBe(true);
    scrollRoot.scrollTop = 0;
    release(full);
    expect(iosState().html).toBe(false);
    expect(scrollRoot.scrollTop).toBe(90);
  });
});
