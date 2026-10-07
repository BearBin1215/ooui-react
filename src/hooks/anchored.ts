import { useEffect, useLayoutEffect, useRef, useState, type RefObject } from "react";
import { isEqual } from "es-toolkit";
import { useDir, useViewportSpacing } from "../config";
import {
  findScrollableContainer,
  getFirstFocusable,
  getElementDir,
  getClipBounds,
  getVisibleBounds,
  resolveElement,
  resolveFlipSide,
  type VisibleBounds,
} from "../utils";
import { useLatestRef } from "./refs";

/** 浮层定位（锚定面板布局/对齐侧选择）与面板自动聚焦 */

/**
 * 浮层水平对齐侧（逻辑值）：start为起始边（LTR左缘/RTL右缘）、end为终止边、center为居中、
 * fill为铺满容器（原版降级顺序的末步，铺满是物理跨度、不随RTL翻转）
 */
type PanelAlignSide = "start" | "end" | "center" | "fill";

/**
 * 面板三个对齐侧的可用宽度（`resolvePanelAlignSide` 的入参口径，px）。`bounds`为**已内缩的
 * clip边界**（原始可视边界计入视口留白与clip buffer，见utils的`getClipBounds`）。
 * `start`/`end` 为逻辑侧：以锚点相应缘为基准、向该侧展开可用的宽度（LTR 的 start 自锚点左缘
 * 向右展开、RTL 的 start 自锚点右缘向左展开）；`center` 为居中时的可用总宽。
 *
 * `center`按原版center步骤经`clip()`的单侧口径取：center以`left`定位（`computePosition().right`
 * 为空）、`getHorizontalAnchorEdge()`恒落`'left'`，itemRect右缘扩到容器右界后可用宽即
 * `far − max(near, 面板左缘)`（`oojs-ui.js:5857-5870`）——面板左缘在容器内时等价于
 * `2×(far − centerX)`，越出容器左界时退化为整段可视跨距`far − near`。故`panelWidth`是入参
 *
 * start/end两侧空间按锚点相应缘在容器内收口——该缘已在容器外时计 0（放置不做钳制，越出容器的
 * 对齐侧交由末步「铺满容器」承接）：若只按「锚点缘到容器边」的距离估算，容器外的空间会被算进来，
 * 面板放到容器外仍被判为放得下，从而永远轮不到填充末步
 */
export function resolvePanelSideSpaces(
  anchorRect: { left: number; right: number },
  bounds: VisibleBounds,
  panelWidth: number,
  dir: "ltr" | "rtl",
): Record<Exclude<PanelAlignSide, "fill">, number> {
  const near = bounds.left;
  const far = bounds.right;
  // 向右展开（左缘贴锚点左缘）与向左展开（右缘贴锚点右缘）的可用宽
  const rightward = anchorRect.left >= near ? far - anchorRect.left : 0;
  const leftward = anchorRect.right <= far ? Math.max(0, anchorRect.right - near) : 0;
  const centerX = (anchorRect.left + anchorRect.right) / 2;
  // 居中放置时的面板左缘（居中位置由锚点中线决定，面板宽参与判定）
  const centeredLeft = centerX - panelWidth / 2;
  return {
    start: dir === "rtl" ? leftward : rightward,
    end: dir === "rtl" ? rightward : leftward,
    center:
      centeredLeft >= near ? 2 * Math.max(0, far - centerX) : Math.max(0, far - near),
  };
}

/**
 * 按两侧可用空间选择浮层对齐侧（对齐原版`PopupToolGroup.setActive`的降级顺序）：
 * 首选侧放得下即用首选侧，否则试对侧，再试居中；都不足时改为铺满容器。
 * `spaces` 由 `resolvePanelSideSpaces` 给出，`panelWidth` 为面板自然宽度
 */
export function resolvePanelAlignSide(
  preferred: Exclude<PanelAlignSide, "center" | "fill">,
  spaces: Record<Exclude<PanelAlignSide, "fill">, number>,
  panelWidth: number,
): PanelAlignSide {
  if (spaces[preferred] >= panelWidth) {
    return preferred;
  }
  const other = preferred === "start" ? "end" : "start";
  if (spaces[other] >= panelWidth) {
    return other;
  }
  if (spaces.center >= panelWidth) {
    return "center";
  }
  return "fill";
}

/**
 * 按上下两侧可用空间选择浮层的展开方向（对齐原版`MenuSelectWidget.toggle`的翻转：
 * 首选方向放不下就切`static.flippedPositions`的对侧，对侧也放不下时取更高的那一侧
 * ——`dist/oojs-ui.js:8940-8957`）。
 * 定侧内核收敛为utils的`resolveFlipSide`（与`Popup`的`resolvePopupPosition`共用）：
 * 一次按预计算空间定侧，不做「先定位再测量」
 * @param spaces 上下两侧的可用高（锚点缘到可视边界，已扣视口留白与offset）
 * @param panelHeight 面板自然高（未钳高）
 */
export function resolvePanelVerticalSide(
  preferred: "above" | "below",
  spaces: Record<"above" | "below", number>,
  panelHeight: number,
): "above" | "below" {
  return resolveFlipSide(
    preferred,
    (side) => (side === "below" ? "above" : "below"),
    (side) => spaces[side],
    panelHeight,
  );
}

/** 锚定浮层布局结果（页面坐标，portal出控件子树后使用） */
interface AnchoredPanelLayout {
  /** 面板上缘的页面纵坐标 */
  top: number;
  /** 面板左缘的页面横坐标 */
  left: number;
  /** 需要写入的宽度；matchAnchorWidth（贴合锚点）或铺满容器时给出 */
  width?: number;
  /** 内容需裁剪时的maxHeight（px）；undefined表示清除裁剪 */
  maxHeight?: number;
  /** 锚点滚出视口（仅hideWhenOutOfView时判定） */
  outOfView: boolean;
  /** 面板有效文本方向（Provider.dir覆盖锚点继承方向），供浮层根设置dir属性 */
  dir: "ltr" | "rtl";
}

/**
 * 锚定浮层的定位与视口钳高（MenuSelect/PopupToolGroup共用）：
 * 面板按页面坐标定位于锚点正下/正上方（页面坐标随滚动自然跟随），水平对齐锚点起始边
 * （RTL下为右缘，对齐原版horizontalPosition:'start'的语义；`horizontalFit`开启时按左右
 * 可用空间选侧，见该参数注释），空间不足时将内容钳至可用高度并改为内部滚动；
 * 开启/滚动/缩放及面板尺寸变化（ResizeObserver观察panelRef，覆盖工具增减、文案换行等
 * 内容驱动的尺寸变化）时重算。
 * `flip`开启时按上下两侧可用空间改选展开方向，与对齐侧一样在打开时定一次、滚动重算沿用
 * （与Popup的滚动重判口径不同，见dev-docs/DEVIATIONS.md「增强」的Popup条）。
 * 返回布局供调用方写入style（React受控渲染或命令式均可）
 */
export function useAnchoredPanelLayout({
  open,
  anchor,
  panelRef,
  position = "below",
  matchAnchorWidth = false,
  hideWhenOutOfView = false,
  offset = 0,
  horizontalFit = false,
  preferredSide = "start",
  flip = false,
}: {
  /** 是否展开：关闭时清空布局并还原裁剪 */
  open: boolean;
  /** 锚点元素或其ref（MenuSelect的container可为元素） */
  anchor: RefObject<HTMLElement | null> | HTMLElement | null | undefined;
  /** 面板元素引用：测量自然尺寸、写入钳高与还原裁剪的对象 */
  panelRef: RefObject<HTMLElement | null>;
  /** 展开方向：below为锚点下方，above为锚点上方 */
  position?: "above" | "below";
  /** 面板宽度是否取锚点宽度（下拉菜单对齐输入框宽度） */
  matchAnchorWidth?: boolean;
  /** 锚点滚出视口时是否上报outOfView（并跳过裁剪） */
  hideWhenOutOfView?: boolean;
  /**
   * 面板与锚点之间的间距（px），对齐原版`FloatableElement` config.spacing：
   * 计入可用空间，故贴边时钳高会相应减少
   */
  offset?: number;
  /**
   * 面板宽度放不下时按左右空间改选对齐侧（对齐原版`PopupToolGroup.setActive`的降级顺序：
   * 首选侧→对侧→居中→铺满容器）。对齐侧在打开时定一次、关闭时重置（滚动重算沿用，
   * 避免面板左右跳动——原版同样只在`setActive(true)`时选侧）。
   * 缺省false：贴合锚点宽度的菜单类浮层无需选侧
   */
  horizontalFit?: boolean;
  /** 首选对齐侧（仅horizontalFit时参与选侧）；对齐原版ToolGroup.align：before→start、after→end */
  preferredSide?: Exclude<PanelAlignSide, "center" | "fill">;
  /**
   * 空间不足时是否改选上下方向（对齐原版MenuSelectWidget的翻转，缺省false）。
   * 菜单类传true；工具栏面板按原版`PopupToolGroup.setAutoFlip(false)`的口径不传
   */
  flip?: boolean;
}): AnchoredPanelLayout | null {
  const [layout, setLayout] = useState<AnchoredPanelLayout | null>(null);
  const configDir = useDir();
  const spacing = useViewportSpacing();
  // 打开期间缓存的对齐侧与展开方向：关闭时重置，使每次打开重新按空间选侧/选向
  // （滚动重算沿用，避免面板跳动——原版同样只在打开时定一次）
  const sideRef = useRef<PanelAlignSide | null>(null);
  const verticalSideRef = useRef<"above" | "below" | null>(null);

  useLayoutEffect(() => {
    const panel = panelRef.current;
    if (!open) {
      setLayout(null);
      sideRef.current = null;
      verticalSideRef.current = null;
      // 关闭时还原裁剪，避免收起后仍留着钳制样式
      if (panel) {
        panel.style.maxHeight = "";
        panel.style.overflowY = "";
      }
      return;
    }
    // 方向按锚点元素缓存：滚动/缩放重算不改文本方向，避免每次重算都触发样式重算
    // （getElementDir读取computed style，在滚动高频路径上会形成同步布局开销）
    let dirAnchorEl: HTMLElement | null = null;
    let cachedDir: "ltr" | "rtl" = "ltr";
    const compute = (): AnchoredPanelLayout | null => {
      const el = panelRef.current;
      const anchorEl = resolveElement(anchor);
      if (!el || !anchorEl) {
        return null;
      }
      // 面板方向：Provider.dir覆盖锚点元素的继承方向（对齐原版Element config.dir优先）
      let dir = configDir;
      if (dir === undefined) {
        if (dirAnchorEl !== anchorEl) {
          dirAnchorEl = anchorEl;
          cachedDir = getElementDir(anchorEl);
        }
        dir = cachedDir;
      }
      const rect = anchorEl.getBoundingClientRect();
      const scrollX = window.scrollX;
      const scrollY = window.scrollY;
      // 裁剪/钳高与滚出判定以锚点就近的可滚动容器为准（对齐原版$floatableClosestScrollable），
      // 无则回退视口；滚出判定用原始可视边界，裁剪/翻转/选侧用clip边界（见getClipBounds）
      const scroller = findScrollableContainer(anchorEl);
      const bounds = getVisibleBounds(scroller);
      const clipBounds = getClipBounds(bounds, scroller, spacing);
      const outOfView =
        hideWhenOutOfView &&
        (rect.bottom < bounds.top ||
          rect.top > bounds.bottom ||
          rect.right < bounds.left ||
          rect.left > bounds.right);
      // maxHeight为content-box高度：需扣除面板上下border，否则钳高后面板边缘仍越界视口。
      // 自然高取scrollHeight + border——max-height钳制不改变scrollHeight，无需清除内联样式
      // 后重测；清除会让DOM与React持有的style失配，重算结果与上一轮相同（值不变）时React
      // 比对后跳过写回，已清除的钳高会静默丢失。borderHeight = offsetHeight − clientHeight
      // （钳高只作用于content box，该差值恒为上下border）
      const borderHeight = el.offsetHeight - el.clientHeight;
      const naturalHeight = el.scrollHeight + borderHeight;
      // 两侧可用高（锚点缘到clip边界，已扣视口留白、buffer与offset——翻转与钳高同源于
      // isClipped*的判定基准）：翻转判定的输入，与钳高同源
      const spaces = {
        above: Math.max(0, rect.top - clipBounds.top - offset),
        below: Math.max(0, clipBounds.bottom - rect.bottom - offset),
      };
      // 展开方向：flip时按两侧空间选（打开时定一次，滚动沿用），否则沿用声明方向
      const verticalSide = flip
        ? (verticalSideRef.current ??= resolvePanelVerticalSide(
            position,
            spaces,
            naturalHeight,
          ))
        : position;
      let top: number;
      let maxHeight: number | undefined;
      if (verticalSide === "above") {
        const available = spaces.above;
        // 钳高后底缘停在锚点顶缘上方offset处，即向上收缩
        const clampedHeight = Math.min(naturalHeight, available);
        top = rect.top + scrollY - offset - clampedHeight;
        if (naturalHeight > available) {
          maxHeight = Math.max(0, available - borderHeight);
        }
      } else {
        top = rect.bottom + scrollY + offset;
        if (!outOfView) {
          const available = spaces.below;
          if (naturalHeight > available) {
            maxHeight = Math.max(0, available - borderHeight);
          }
        }
      }
      // 可用空间以面板宽（offsetWidth）为基准，容器边界取clip边界（已含视口留白、已扣沟槽）
      const panelWidth = el.offsetWidth;
      const anchorCenterX = rect.left + rect.width / 2;
      if (horizontalFit && !matchAnchorWidth) {
        sideRef.current ??= resolvePanelAlignSide(
          preferredSide,
          resolvePanelSideSpaces(rect, clipBounds, panelWidth, dir),
          panelWidth,
        );
      }
      const alignSide = sideRef.current ?? "start";
      let left: number;
      /** 需要写入面板的宽度（贴合锚点或铺满容器），其余情形不写 */
      let width: number | undefined;
      if (matchAnchorWidth) {
        left = rect.left + scrollX;
      } else if (alignSide === "fill") {
        // 原版setActive的末步：铺满容器（toggleClipping(false) + 起始边对齐 + 写width/min-width）。
        // 铺满是物理跨度（不随RTL翻转）：左缘取容器左缘、宽度取容器可用宽。视口分支按原版取
        // documentElement.clientWidth（不含滚动条沟槽），元素容器用可视区边界（已扣沟槽）
        const isViewport = scroller === document.documentElement;
        width = isViewport
          ? document.documentElement.clientWidth
          : bounds.right - bounds.left;
        left = (isViewport ? 0 : bounds.left) + scrollX;
      } else {
        switch (alignSide) {
          case "end":
            left = (dir === "rtl" ? rect.left : rect.right - panelWidth) + scrollX;
            break;
          case "center":
            left = anchorCenterX - panelWidth / 2 + scrollX;
            break;
          default:
            left = (dir === "rtl" ? rect.right - panelWidth : rect.left) + scrollX;
        }
      }
      return {
        top,
        left,
        width: matchAnchorWidth ? rect.width : width,
        maxHeight,
        outOfView,
        dir,
      };
    };

    // 高频重算（document捕获级scroll监听下任何滚动容器的每个滚动事件都会触发）的等值跳过：
    // compute()恒产出新对象，直接setLayout会让布局值未变的滚动也重渲染整个浮层子树；逐字段
    // 比对后沿用上一引用，React按Object.is跳过重渲染，下游style也因值不变跳过写回
    const applyLayout = (next: AnchoredPanelLayout | null) => {
      setLayout((prev) => (isEqual(prev, next) ? prev : next));
    };

    applyLayout(compute());
    const recompute = () => applyLayout(compute());
    window.addEventListener("resize", recompute);
    document.addEventListener("scroll", recompute, true);
    // 面板尺寸变化（工具增减、文案换行等真实内容变化）时重算。钳高写入maxHeight引起的尺寸
    // 变化会再次触发RO，但max-height只压缩可视盒、不改变scrollHeight与offsetWidth这两个测量
    // 入参，重算结果与已应用的值相同，React比对后跳过写回、净DOM变化为零，观察链到此终止
    // （Popup的壳尺寸RO同款论证；与Popup的「逐轮收缩」问题不同源——本hook的钳高不会反过来
    // 改变自然尺寸的测量基准）
    const panelObserver = new ResizeObserver(recompute);
    if (panel) {
      panelObserver.observe(panel);
    }
    return () => {
      panelObserver.disconnect();
      window.removeEventListener("resize", recompute);
      document.removeEventListener("scroll", recompute, true);
    };
  }, [
    open,
    anchor,
    panelRef,
    position,
    matchAnchorWidth,
    hideWhenOutOfView,
    offset,
    horizontalFit,
    preferredSide,
    flip,
    configDir,
    spacing,
  ]);

  return layout;
}

/**
 * 切换激活面板后自动聚焦其内首个可聚焦元素，对齐原版Index/BookletLayout.onStackLayoutSet：
 * 焦点已在该面板内时不重复聚焦。`onBeforeFocus`供调用方在聚焦前执行滚动等动作
 * （每轮激活变化调用一次，含首次）；`skipInitialFocus`用于挂载值不聚焦（IndexLayout行为），
 * 以「激活值是否发生过变化」判定而非「effect是否首跑」——StrictMode的effect双调用会击穿
 * 首跑标记（第二次运行仍属同一挂载值），按值判定在双调用与生产环境下语义一致
 */
export function useAutoFocusPanel({
  activeValue,
  enabled = true,
  rootRef,
  activeSelector,
  skipInitialFocus = false,
  onBeforeFocus,
  onAfterFocus,
  recomputeKey,
}: {
  activeValue: string | number | undefined;
  /** 是否执行聚焦（autoFocus）；false时仍调用onBeforeFocus */
  enabled?: boolean;
  /** 面板容器根节点 */
  rootRef: RefObject<HTMLElement | null>;
  /** 激活面板的选择器（如`.oo-ui-tabPanelLayout-active`） */
  activeSelector: string;
  /** 挂载值不聚焦：激活值首次变化后才聚焦 */
  skipInitialFocus?: boolean;
  /** 聚焦前回调（如continuous模式下滚动至目标页）；入参isFirst标记是否首次生效 */
  onBeforeFocus?: (activePanel: HTMLElement, isFirst: boolean) => void;
  /** 聚焦后回调（如携带事件通知调用方） */
  onAfterFocus?: (activePanel: HTMLElement, focusable: HTMLElement | undefined) => void;
  /** 额外重算触发源（如BookletLayout的continuous变化） */
  recomputeKey?: unknown;
}): void {
  const isFirstRef = useRef(true);
  // skipInitialFocus的判定基准：挂载时的激活值（useRef仅取首值，StrictMode双跑保持不变）
  const initialValueRef = useRef(activeValue);
  const hasChangedRef = useRef(false);
  // 回调经ref读取最新，避免内联函数导致effect反复触发
  const onBeforeFocusRef = useLatestRef(onBeforeFocus);
  const onAfterFocusRef = useLatestRef(onAfterFocus);
  useEffect(() => {
    if (activeValue === undefined) {
      return;
    }
    if (activeValue !== initialValueRef.current) {
      hasChangedRef.current = true;
    }
    const activePanel = rootRef.current?.querySelector<HTMLElement>(activeSelector);
    if (!activePanel) {
      return;
    }
    const isFirst = isFirstRef.current;
    isFirstRef.current = false;
    onBeforeFocusRef.current?.(activePanel, isFirst);
    if (!enabled || (skipInitialFocus && !hasChangedRef.current)) {
      return;
    }
    if (activePanel.contains(document.activeElement)) {
      return;
    }
    const focusable = getFirstFocusable(activePanel);
    focusable?.focus();
    onAfterFocusRef.current?.(activePanel, focusable);
  }, [
    activeValue,
    enabled,
    rootRef,
    activeSelector,
    skipInitialFocus,
    recomputeKey,
    onBeforeFocusRef,
    onAfterFocusRef,
  ]);
}
