import { describe, expect, it } from "vitest";
import {
  POPUP_ANCHOR_BOX_SIZE,
  placePopup,
  resolveAlign,
  resolveAnchorAdjust,
  type PopupAlign,
  type PopupPosition,
  type PopupRect,
} from "./popupLayout";

/**
 * Popup定位纯函数契约，靶心是原版`PopupWidget.computePosition`：
 * - `resolveAlign`把`force-left`/`force-right`按方向归一为等价逻辑值（`alignMap`，`dist/oojs-ui.js:6488-6497`）。
 *   该配置的JSDoc（`:6001-6002`）两行描述的是同一条映射、与代码相悖，以代码为准，见comparison-guide§2.4。
 * - `placePopup`按`hPosMap`/`vPosMap`（`:6504-6513`）给落点：对齐作用于`above/below`的横轴，`before/after`
 *   作用于纵轴（纵轴不读方向、也不读是否有箭头）；终止端对齐带箭头时落到`'before'`，由`resolveAnchorAdjust`
 *   的腾挪（`:6583-6596`）拉到「锚点中线距终止端2×箭头盒」的稳态。
 */
describe("resolveAlign", () => {
  it("forwards/center/backwards 原样透传", () => {
    expect(resolveAlign("forwards", false)).toBe("forwards");
    expect(resolveAlign("forwards", true)).toBe("forwards");
    expect(resolveAlign("center", false)).toBe("center");
    expect(resolveAlign("center", true)).toBe("center");
    expect(resolveAlign("backwards", false)).toBe("backwards");
    expect(resolveAlign("backwards", true)).toBe("backwards");
  });

  it("force-left：LTR 归为 backwards、RTL 归为 forwards（两方向都把弹层体放到锚点物理左侧）", () => {
    expect(resolveAlign("force-left", false)).toBe("backwards");
    expect(resolveAlign("force-left", true)).toBe("forwards");
  });

  it("force-right：LTR 归为 forwards、RTL 归为 backwards（两方向都把弹层体放到锚点物理右侧）", () => {
    expect(resolveAlign("force-right", false)).toBe("forwards");
    expect(resolveAlign("force-right", true)).toBe("backwards");
  });
});

describe("placePopup：align 的起手落点", () => {
  // 锚点位于 (100, 50, 80×20)，弹层 200×100，滚动量置 0
  const base: PopupRect = {
    top: 50,
    left: 100,
    right: 180,
    bottom: 70,
    width: 80,
    height: 20,
  };
  const POPUP_WIDTH = 200;
  const POPUP_HEIGHT = 100;

  const place = (
    align: PopupAlign,
    rtl: boolean,
    position: PopupPosition = "below",
    anchored = false,
  ) =>
    placePopup({
      base,
      position,
      align,
      rtl,
      anchored,
      anchorShift: 0,
      scrollX: 0,
      scrollY: 0,
      popupWidth: POPUP_WIDTH,
      popupHeight: POPUP_HEIGHT,
    });

  it("无箭头：起始端对齐贴锚点起始端，终止端对齐贴锚点终止端（两端随RTL换物理侧）", () => {
    expect(place("forwards", false)).toEqual({ top: base.bottom, left: base.left });
    expect(place("forwards", true)).toEqual({
      top: base.bottom,
      left: base.right - POPUP_WIDTH,
    });
    expect(place("backwards", false)).toEqual({
      top: base.bottom,
      left: base.right - POPUP_WIDTH,
    });
    expect(place("backwards", true)).toEqual({ top: base.bottom, left: base.left });
  });

  it("无箭头：物理别名不随方向翻转（force-left/force-right 两方向同坐标），且等价于对应方向的逻辑值", () => {
    expect(place("force-left", false)).toEqual(place("force-left", true));
    expect(place("force-right", false)).toEqual(place("force-right", true));
    expect(place("force-left", false)).toEqual(place("backwards", false));
    expect(place("force-left", true)).toEqual(place("forwards", true));
    expect(place("force-right", false)).toEqual(place("forwards", false));
    expect(place("force-right", true)).toEqual(place("backwards", true));
  });

  it("带箭头：终止端对齐落到'before'（弹层终止端贴锚点起始端），起始端对齐不受影响", () => {
    expect(place("backwards", false, "below", true)).toEqual({
      top: base.bottom,
      left: base.left - POPUP_WIDTH,
    });
    expect(place("backwards", true, "below", true)).toEqual({
      top: base.bottom,
      left: base.right,
    });
    expect(place("forwards", false, "below", true)).toEqual(place("forwards", false));
    expect(place("forwards", true, "below", true)).toEqual(place("forwards", true));
  });

  it("center 不受别名与箭头影响", () => {
    const centered = {
      top: base.bottom,
      left: base.left + (base.width - POPUP_WIDTH) / 2,
    };
    expect(place("center", false)).toEqual(centered);
    expect(place("force-left", false)).not.toEqual(centered);
    expect(place("center", false, "below", true)).toEqual(centered);
  });

  it("before/after：对齐改作用纵轴，箭头与否同落点（原版vPosMap不读anchored）", () => {
    expect(place("backwards", false, "before")).toEqual({
      top: base.bottom - POPUP_HEIGHT,
      left: base.left - POPUP_WIDTH,
    });
    expect(place("backwards", false, "before", true)).toEqual(
      place("backwards", false, "before"),
    );
    expect(place("force-left", false, "before")).toEqual(
      place("backwards", false, "before"),
    );
    expect(place("force-left", true, "before")).toEqual(
      place("forwards", true, "before"),
    );
  });
});

describe("锚点腾挪后别名的稳态", () => {
  // 与Popup组件的组合一致：placePopup取起点，resolveAnchorAdjust按箭头盒腾挪，再据以定弹层起点
  const compose = (
    base: PopupRect,
    align: PopupAlign,
    rtl: boolean,
    anchored: boolean,
  ) => {
    const { left } = placePopup({
      base,
      position: "below",
      align,
      rtl,
      anchored,
      anchorShift: 0,
      scrollX: 0,
      scrollY: 0,
      popupWidth: 200,
      popupHeight: 100,
    });
    const rawAnchorOffset = base.left + base.width / 2 - left;
    const adjust = anchored
      ? resolveAnchorAdjust(rawAnchorOffset, 200, POPUP_ANCHOR_BOX_SIZE)
      : 0;
    return { start: left + adjust, anchorOffset: rawAnchorOffset - adjust };
  };

  const anchors = [80, 320].map((width): PopupRect => ({
    top: 50,
    left: 100,
    right: 100 + width,
    bottom: 70,
    width,
    height: 20,
  }));

  it("带箭头的终止端对齐（backwards）：锚点中线距弹层终止端恒为2×箭头盒，与锚点宽度、方向无关", () => {
    for (const base of anchors) {
      for (const rtl of [false, true]) {
        const { start } = compose(base, "backwards", rtl, true);
        const anchorCenter = base.left + base.width / 2;
        // 终止端在LTR为物理右缘、RTL为物理左缘
        const endGap = rtl ? anchorCenter - start : start + 200 - anchorCenter;
        expect(endGap).toBe(2 * POPUP_ANCHOR_BOX_SIZE);
      }
    }
  });

  it("物理别名落到对应方向的逻辑值（同一物理侧）：LTR force-left≡backwards、RTL force-left≡forwards", () => {
    for (const base of anchors) {
      for (const rtl of [false, true]) {
        const left = compose(base, "force-left", rtl, true);
        const right = compose(base, "force-right", rtl, true);
        expect(left).toEqual(
          rtl
            ? compose(base, "forwards", rtl, true)
            : compose(base, "backwards", rtl, true),
        );
        expect(right).toEqual(
          rtl
            ? compose(base, "backwards", rtl, true)
            : compose(base, "forwards", rtl, true),
        );
        // 弹层体恒在锚点物理左/右侧：force-left 的终止端不越过锚点终止端、起点在锚点中线之左
        const anchorCenter = base.left + base.width / 2;
        expect(left.start + 200 - base.right).toBeLessThanOrEqual(0);
        expect(left.start - anchorCenter).toBeLessThan(0);
        expect(right.start - base.left).toBeGreaterThanOrEqual(0);
        expect(right.start + 200 - anchorCenter).toBeGreaterThan(0);
      }
    }
  });

  it("无箭头：腾挪不参与（对齐原版 if (this.anchored) 守卫），锚点外缘与弹层终止端齐平", () => {
    // 宽锚点（320）下与带箭头形态明显分叉：带箭头时锚点中线距终止端仅2×箭头盒
    const base: PopupRect = {
      top: 50,
      left: 100,
      right: 420,
      bottom: 70,
      width: 320,
      height: 20,
    };
    for (const rtl of [false, true]) {
      const { start } = compose(base, "backwards", rtl, false);
      const anchorCenter = base.left + base.width / 2;
      expect(rtl ? anchorCenter - start : start + 200 - anchorCenter).toBe(
        base.width / 2,
      );
    }
  });
});
