/**
 * Popup的几何域（便于单测）：翻转判定、方位/对齐→页面坐标、箭头腾挪与容器边界钳制，以及箭头
 * 两处几何量的实测（占位margin与箭头盒溢出，随主题自适应）。除实测与容器探测外为纯函数。
 * 与`useAnchoredPanelLayout`（MenuSelect/PopupToolGroup）分工不同：后者只处理上下方位与钳高，
 * 本模块覆盖四方位、箭头对齐与钳制
 */

import { resolveFlipSide } from "../../utils";

/**
 * Popup direction (logical values; the physical side is resolved by text direction).
 *
 * 弹出方位（逻辑值，物理侧按文本方向解析）。
 */
export type PopupPosition = "above" | "below" | "before" | "after";

/**
 * Alignment on the anchor. `forwards` / `backwards` are logical (the popup body
 * sits toward the end / start of the writing direction and swaps physical side
 * under RTL); `force-left` / `force-right` are physical (the popup body always
 * sits to the given physical side and does not flip with direction).
 *
 * 对齐方向。`forwards` / `backwards` 是逻辑值（弹层体朝书写方向的终止 / 起始侧，
 * 随 RTL 换物理侧）；`force-left` / `force-right` 是物理值（弹层体恒在锚点的
 * 物理左 / 右侧，不随方向翻转）。
 */
export type PopupAlign =
  | "forwards"
  | "center"
  | "backwards"
  | "force-left"
  | "force-right";

/** 归一化后的对齐方向（逻辑值，交给 {@link placePopup} 走既有分支） */
type ResolvedPopupAlign = "forwards" | "center" | "backwards";

/**
 * `force-left`/`force-right` 按当前方向解析为等价的逻辑对齐值：物理别名取「弹层体恒在锚点物理
 * 左/右侧」的口径，故 `force-left` 在 LTR 等价 `backwards`、在 RTL 等价 `forwards`，`force-right` 相反。
 * 与原版 `PopupWidget.computePosition` 的 `alignMap` 逐字一致（`dist/oojs-ui.js:6488-6497`）。
 * 该配置的 JSDoc（`:6001-6002`）两行描述的是同一条映射、与代码相悖，以代码为准，
 * 分析见 dev-docs/comparison-guide.md §2.4。
 */
export function resolveAlign(align: PopupAlign, rtl: boolean): ResolvedPopupAlign {
  if (align === "force-left") {
    return rtl ? "forwards" : "backwards";
  }
  if (align === "force-right") {
    return rtl ? "backwards" : "forwards";
  }
  return align;
}

/** 弹层锚点边（对应CSS类`oo-ui-popupWidget-anchored-{edge}`与箭头定位轴） */
export type PopupAnchorEdge = "top" | "bottom" | "start" | "end";

/** 元素位置与尺寸（getBoundingClientRect的最小结构） */
export interface PopupRect {
  top: number;
  left: number;
  right: number;
  bottom: number;
  width: number;
  height: number;
}

/** 弹层定位结果（页面坐标） */
export interface PopupLayout {
  top: number;
  left: number;
  anchorEdge: PopupAnchorEdge;
  anchorOffset: number;
  /** 裁剪轴上的自然尺寸（above/below为高度，before/after为宽度） */
  unclippedSize: number;
  /** 弹层有效文本方向（写入浮层根dir属性；锚点继承方向，可被Provider.dir覆盖） */
  dir: "ltr" | "rtl";
}

/**
 * 箭头占位尺寸的兜底常量（px）：生效占位是主题CSS落在弹层根上的margin（运行时经computed
 * style实测，见 {@link measureAnchorShift}），wikimediaui为9（`oojs-ui-wikimediaui.css:1214-1270`
 * 的四个`anchored-{top,bottom,start,end}`类各设一边）、apex为6。实测读不到时（anchored类未挂的
 * 首帧、无主题样式的测试环境）按wikimediaui兜底。仅{@link measureAnchorShift}内部使用
 */
const POPUP_ANCHOR_SIZE = 9;

/**
 * 箭头盒溢出尺寸的兜底常量（px）：生效值是锚点元素伪元素边框溢出形成的scroll量（运行时按
 * 当前轴实测，对齐原版`this.$anchor[0]['scroll'+sizeProp]`，`dist/oojs-ui.js:6584`）——原版
 * 以此为锚点腾挪的基准：锚点中线距弹层两端不足`2×anchorSize`时平移弹层。箭头盒自身是0×0
 * （原版注释「width()/height() returns 0 because of the CSS trickery」），尺寸全来自伪元素
 * 边框的溢出：wikimediaui（`oojs-ui-wikimediaui.css:1217-1230`）两轴实测均为11，apex为8。
 * 实测读不到时（无主题样式的测试环境）按wikimediaui兜底
 */
export const POPUP_ANCHOR_BOX_SIZE = 11;

/**
 * 箭头占位量的实测（px）：占位在主题CSS里写成弹层根`anchored-{edge}`类的margin——above/before
 * 侧原版以`bottom`/`right`定位、该margin自动生效，本工程统一用`top`/`left`定位，须按等量手补
 * （见 {@link placePopup} 的`anchorShift`）。取四边computed margin的最大值而非按当前边读：
 * 边类由上一轮`layout.anchorEdge`渲染，翻转时DOM里仍是旧边，按当前边读会读到未生效的一侧（0）；
 * 每个edge类只置一边，故最大值即生效值。读不到时按 {@link POPUP_ANCHOR_SIZE} 兜底。
 * 调用方经`className`/`style`给弹层根加的`margin-*`会被一并读入，勿用margin微调位置
 */
export function measureAnchorShift(rootEl: HTMLElement | null | undefined): number {
  if (!rootEl) {
    return POPUP_ANCHOR_SIZE;
  }
  const style = getComputedStyle(rootEl);
  const shift = Math.max(
    parseFloat(style.marginTop) || 0,
    parseFloat(style.marginBottom) || 0,
    parseFloat(style.marginLeft) || 0,
    parseFloat(style.marginRight) || 0,
  );
  return shift || POPUP_ANCHOR_SIZE;
}

/**
 * 箭头盒在给定轴上的实测尺寸（px）：仅在主题CSS生效时可信——`.oo-ui-popupWidget-anchor`是无内容
 * 的绝对定位盒、自身0×0，箭头由`::before/::after`的边框画出（`oojs-ui-wikimediaui.css:1142-1156`），
 * 故scroll量即溢出尺寸；无样式环境下它是撑满父宽的普通块盒，scroll量非箭头溢出，
 * 按 {@link POPUP_ANCHOR_BOX_SIZE} 兜底
 */
export function measureArrowBoxSize(
  anchorEl: HTMLElement | null | undefined,
  anchorAxisX: boolean,
): number {
  const styled = !!anchorEl && anchorEl.offsetWidth === 0 && anchorEl.offsetHeight === 0;
  if (!styled) {
    return POPUP_ANCHOR_BOX_SIZE;
  }
  const overflow = anchorAxisX ? anchorEl.scrollWidth : anchorEl.scrollHeight;
  return overflow || POPUP_ANCHOR_BOX_SIZE;
}

/** 视口缺省矩形（锚点未挂载时的兜底，使弹层定位在视口左上） */
export const EMPTY_RECT: PopupRect = {
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  width: 0,
  height: 0,
};

const OPPOSITE: Record<PopupPosition, PopupPosition> = {
  below: "above",
  above: "below",
  before: "after",
  after: "before",
};

/** 方位是否为纵向（above/below）；纵向弹层的箭头腾挪与钳制沿水平轴 */
export function isVerticalPosition(position: PopupPosition): boolean {
  return position === "above" || position === "below";
}

/**
 * 锚点四侧可用空间（按逻辑方位求值，before/after随RTL换侧），供翻转判定。
 * `bounds`为可视区边界（与钳制同源的就近滚动容器，见{@link getClampBounds}），
 * 已按原版clip()口径扣视口留白与7px buffer
 */
export function getPositionSpaces(
  base: PopupRect,
  bounds: { top: number; left: number; right: number; bottom: number },
  rtl: boolean,
): Record<PopupPosition, number> {
  return {
    below: bounds.bottom - base.bottom,
    above: base.top - bounds.top,
    before: rtl ? bounds.right - base.right : base.left - bounds.left,
    after: rtl ? base.left - bounds.left : bounds.right - base.right,
  };
}

/**
 * 翻转判定（对齐原版toggle的翻转逻辑）：常态方向放不下时翻转到对侧；
 * 对侧也放不下时保留空间更大的一侧（两侧都不足时不翻转）。
 * 定侧内核收敛为utils的`resolveFlipSide`（与`useAnchoredPanelLayout`的
 * `resolvePanelVerticalSide`共用）；所需空间随方位取轴（纵向算高、横向算宽），
 * 故`required`按首选侧求得、两侧共用
 */
export function resolvePopupPosition(
  position: PopupPosition,
  spaces: Record<PopupPosition, number>,
  popup: { width: number; height: number },
): PopupPosition {
  return resolveFlipSide(
    position,
    (side) => OPPOSITE[side],
    (side) => spaces[side],
    isVerticalPosition(position) ? popup.height : popup.width,
  );
}

/** 锚点边：above→bottom、below→top、before→end、after→start（箭头指向锚点中线） */
export function getAnchorEdge(position: PopupPosition): PopupAnchorEdge {
  if (position === "above") {
    return "bottom";
  }
  if (position === "below") {
    return "top";
  }
  return position === "before" ? "end" : "start";
}

/**
 * 方位与对齐→弹层左上角页面坐标（未含箭头腾挪与容器钳制）。
 * `anchorShift`为箭头占位：below/after以top/left定位时CSS margin自动生效，
 * above/before需手动补足（本工程统一以top/left定位，原版用bottom/right）。
 * `anchored`为是否显示指向锚点的箭头，决定原版`hPosMap`的 backwards 落到`'before'`还是`'end'`
 * （`dist/oojs-ui.js:6504-6508`）：anchored 时以`'before'`起手（弹层终止端贴锚点起始端），
 * 随后由 {@link resolveAnchorAdjust} 拉回到「锚点中线距终止端2×箭头盒」的位置
 */
export function placePopup({
  base,
  position,
  align: alignIn,
  rtl,
  anchored,
  anchorShift,
  scrollX,
  scrollY,
  popupWidth,
  popupHeight,
}: {
  base: PopupRect;
  position: PopupPosition;
  align: PopupAlign;
  rtl: boolean;
  anchored: boolean;
  anchorShift: number;
  scrollX: number;
  scrollY: number;
  popupWidth: number;
  popupHeight: number;
}): { top: number; left: number } {
  // force-left/force-right 是物理侧别名，先归一到逻辑值再走既有对齐分支
  const align = resolveAlign(alignIn, rtl);
  let top = 0;
  let left = 0;
  if (position === "below") {
    top = base.bottom + scrollY;
  } else if (position === "above") {
    top = base.top + scrollY - popupHeight - anchorShift;
  } else if (position === "before") {
    // before为容器起始侧（LTR左/RTL右）
    left = rtl ? base.right + scrollX : base.left + scrollX - popupWidth - anchorShift;
  } else {
    // after为容器结束侧（LTR右/RTL左）
    left = rtl ? base.left + scrollX - popupWidth - anchorShift : base.right + scrollX;
  }
  if (isVerticalPosition(position)) {
    if (align === "center") {
      left = base.left + scrollX + (base.width - popupWidth) / 2;
    } else if (align === "forwards") {
      // 起始端对齐：弹层起始端贴锚点起始端（起始端随RTL换物理侧）
      left = rtl ? base.right + scrollX - popupWidth : base.left + scrollX;
    } else if (anchored) {
      // 终止端对齐 + 箭头：以'before'起手，弹层终止端贴锚点起始端（终止端随RTL换物理侧）
      left = rtl ? base.right + scrollX : base.left + scrollX - popupWidth;
    } else {
      // 终止端对齐 + 无箭头：弹层终止端贴锚点终止端
      left = rtl ? base.left + scrollX : base.right + scrollX - popupWidth;
    }
  } else if (align === "center") {
    // 纵向对齐沿物理轴，不随RTL翻转
    top = base.top + scrollY + (base.height - popupHeight) / 2;
  } else if (align === "forwards") {
    top = base.top + scrollY;
  } else {
    top = base.bottom + scrollY - popupHeight;
  }
  return { top, left };
}

/**
 * 箭头腾挪量：锚点距弹层两端不足`2×anchorSize`时平移弹层，为箭头留出指向空间
 * （对齐原版`PopupWidget.computePosition`的`positionAdjustment`两分支，`dist/oojs-ui.js:6583-6596`；
 * 原版还叠加箭头元素的`margin`，但主题CSS未给该元素设 margin，故此处与之等价）。
 * `anchorSize`取箭头盒在给定轴上的实测溢出量（{@link measureArrowBoxSize}），非箭头占位。
 */
export function resolveAnchorAdjust(
  rawAnchorOffset: number,
  popupSize: number,
  anchorSize: number,
): number {
  if (rawAnchorOffset < 2 * anchorSize) {
    return rawAnchorOffset - 2 * anchorSize;
  }
  if (rawAnchorOffset > popupSize - 2 * anchorSize) {
    return rawAnchorOffset - (popupSize - 2 * anchorSize);
  }
  return 0;
}

/**
 * 钳制边界（页面坐标，沿弹层被钳制的轴）：就近滚动容器内沿，缺省视口。
 * 视口分支取`documentElement.clientWidth/Height`（`$container.innerWidth()`口径，不含滚动条）
 * 并计入视口留白（对齐原版computePosition的container钳制分支，`oojs-ui.js:6602-6610`；
 * 该分支无clip buffer）；元素容器为rect页面坐标+clientWidth，不计视口留白（同原版）
 */
export function getClampBounds(
  scroller: HTMLElement,
  anchorAxisX: boolean,
  scroll: { x: number; y: number },
  spacing: { top: number; right: number; bottom: number; left: number },
): { near: number; far: number } {
  if (scroller === document.documentElement) {
    return anchorAxisX
      ? { near: spacing.left, far: document.documentElement.clientWidth - spacing.right }
      : {
          near: spacing.top,
          far: document.documentElement.clientHeight - spacing.bottom,
        };
  }
  const sr = scroller.getBoundingClientRect();
  const near = anchorAxisX ? sr.left + scroll.x : sr.top + scroll.y;
  return {
    near,
    far: near + (anchorAxisX ? scroller.clientWidth : scroller.clientHeight),
  };
}

/** 容器边界钳制：起点越过任一内缩边界时返回补足位移，使弹层落入容器内（对齐原版$container逻辑） */
export function clampPopupToBounds(
  start: number,
  size: number,
  bounds: { near: number; far: number },
  padding: number,
): number {
  if (start < bounds.near + padding) {
    return bounds.near + padding - start;
  }
  if (start + size > bounds.far - padding) {
    return bounds.far - padding - (start + size);
  }
  return 0;
}
