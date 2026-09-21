import { describe, expect, it } from "vitest";
import {
  resolvePanelAlignSide,
  resolvePanelSideSpaces,
  resolvePanelVerticalSide,
} from "./anchored";

// 入参是「已内缩的clip边界」（原始可视边界 + 视口留白 + CLIP_BUFFER 7px，见utils.getClipBounds）：
// 原始 {0,0,500,400} 与留白 {5,5} 内缩后为 [12,12,488,388]，留白全 0 时内缩为 [7,7,393,393]
const CLIP_BOUNDS = { top: 12, left: 12, right: 488, bottom: 388 };
const CLIP_BOUNDS_NO_SPACING = { top: 7, left: 7, right: 393, bottom: 393 };

describe("resolvePanelSideSpaces（对齐侧可用空间）", () => {
  it("锚点在容器内：各侧为锚点相应缘到clip边界的距离", () => {
    const spaces = resolvePanelSideSpaces(
      { left: 100, right: 200 },
      CLIP_BOUNDS,
      150,
      "ltr",
    );
    // 向右展开：clip右界488 − 锚点左缘100；向左展开：锚点右缘200 − clip左界12
    expect(spaces.start).toBe(388);
    expect(spaces.end).toBe(188);
    // 居中：面板左缘75在容器内，取物理右侧余量（488−中心150）的两倍
    expect(spaces.center).toBe(676);
  });

  it("RTL：start/end互换（起始边在锚点右缘）", () => {
    const spaces = resolvePanelSideSpaces(
      { left: 100, right: 200 },
      CLIP_BOUNDS,
      150,
      "rtl",
    );
    expect(spaces.start).toBe(188);
    expect(spaces.end).toBe(388);
  });

  it("锚点越出容器左缘：向右展开计0（放置不钳制，交给铺满容器承接）", () => {
    const spaces = resolvePanelSideSpaces(
      { left: -40, right: 60 },
      CLIP_BOUNDS,
      150,
      "ltr",
    );
    expect(spaces.start).toBe(0);
    expect(spaces.end).toBe(48);
  });

  it("锚点越出容器右缘：向左展开与居中均计0/收口", () => {
    const spaces = resolvePanelSideSpaces(
      { left: 470, right: 560 },
      CLIP_BOUNDS,
      150,
      "ltr",
    );
    expect(spaces.start).toBe(18);
    expect(spaces.end).toBe(0);
    expect(spaces.center).toBe(0);
  });

  it("center按原版单侧口径不随锚点偏侧收缩：偏左锚点两侧余量不等时仍以右侧余量计", () => {
    // clip边界收口[7,393]，300宽面板居中后左缘−110已越出左界，可用宽退化为整段可视跨距386
    // （对应原版clip()把itemRect左缘钳到容器左界）；386≥300故停在居中，而对称口径
    // （2×min(两侧余量)=106）会误判为放不下、跳到铺满
    const spaces = resolvePanelSideSpaces(
      { left: 20, right: 60 },
      CLIP_BOUNDS_NO_SPACING,
      300,
      "ltr",
    );
    expect(spaces.start).toBe(373);
    expect(spaces.end).toBe(53);
    expect(spaces.center).toBe(386);
  });

  it("center在面板宽于容器可视跨距时不为居中放行：衔接降级末步的铺满", () => {
    // 同样偏左的锚点，面板宽500 > 可视跨距386：可用宽386 < 500，居中判为放不下
    const spaces = resolvePanelSideSpaces(
      { left: 20, right: 60 },
      CLIP_BOUNDS_NO_SPACING,
      500,
      "ltr",
    );
    expect(spaces.center).toBe(386);
    expect(resolvePanelAlignSide("start", spaces, 500)).toBe("fill");
  });
});

describe("resolvePanelAlignSide（面板对齐侧的降级顺序）", () => {
  it("首选侧放得下时用首选侧", () => {
    expect(
      resolvePanelAlignSide("start", { start: 200, end: 100, center: 300 }, 150),
    ).toBe("start");
    expect(resolvePanelAlignSide("end", { start: 100, end: 200, center: 300 }, 150)).toBe(
      "end",
    );
  });

  it("首选侧放不下时改试对侧", () => {
    expect(
      resolvePanelAlignSide("start", { start: 100, end: 200, center: 300 }, 150),
    ).toBe("end");
    expect(resolvePanelAlignSide("end", { start: 200, end: 100, center: 300 }, 150)).toBe(
      "start",
    );
  });

  it("两侧都放不下但居中放得下时取居中", () => {
    expect(
      resolvePanelAlignSide("start", { start: 100, end: 100, center: 150 }, 150),
    ).toBe("center");
    expect(resolvePanelAlignSide("end", { start: 100, end: 100, center: 150 }, 150)).toBe(
      "center",
    );
  });

  it("都不足时改为铺满容器（对齐原版setActive的末步）", () => {
    expect(
      resolvePanelAlignSide("start", { start: 100, end: 120, center: 100 }, 150),
    ).toBe("fill");
    expect(resolvePanelAlignSide("end", { start: 120, end: 100, center: 100 }, 150)).toBe(
      "fill",
    );
  });

  it('可用空间等于面板宽度时视为放得下（等价于原版的"不裁剪"判定）', () => {
    expect(resolvePanelAlignSide("start", { start: 150, end: 0, center: 0 }, 150)).toBe(
      "start",
    );
  });
});

describe("resolvePanelVerticalSide（上下翻转，对齐MenuSelectWidget.toggle）", () => {
  it("首选方向放得下时保持首选方向（不翻转）", () => {
    expect(resolvePanelVerticalSide("below", { below: 300, above: 50 }, 200)).toBe(
      "below",
    );
    expect(resolvePanelVerticalSide("above", { below: 50, above: 300 }, 200)).toBe(
      "above",
    );
  });

  it("首选方向放不下时翻到对侧", () => {
    expect(resolvePanelVerticalSide("below", { below: 80, above: 300 }, 200)).toBe(
      "above",
    );
    expect(resolvePanelVerticalSide("above", { below: 300, above: 80 }, 200)).toBe(
      "below",
    );
  });

  it("两侧都放不下时取空间更大的一侧（原版比较钳后高度）", () => {
    expect(resolvePanelVerticalSide("below", { below: 120, above: 60 }, 200)).toBe(
      "below",
    );
    expect(resolvePanelVerticalSide("below", { below: 60, above: 120 }, 200)).toBe(
      "above",
    );
  });

  it("可用空间等于面板高度时视为放得下（等价原版不裁剪）", () => {
    expect(resolvePanelVerticalSide("below", { below: 200, above: 0 }, 200)).toBe(
      "below",
    );
  });
});
