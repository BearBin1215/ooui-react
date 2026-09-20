import {
  forwardRef,
  useLayoutEffect,
  useRef,
  useState,
  useEffect,
  type ReactNode,
  type RefObject,
} from "react";
import { createPortal } from "react-dom";
import clsx from "clsx";
import { LabelBase } from "../Label/Base";
import { IconBase } from "../Icon/Base";
import { Button } from "../Button";
import { useDir, useMessage, useViewportSpacing } from "../../config";
import {
  useControlledValue,
  useDismissablePopover,
  useFloatPortal,
  useMergedRefs,
} from "../../hooks";
import { elementHiddenClasses, getWidgetClassName } from "../../mixins";
import {
  getFocusableElements,
  getClipBounds,
  getElementDir,
  getVisibleBounds,
  resolveElement,
  findScrollableContainer,
  OFFSCREEN_POSITION,
} from "../../utils";
import type { WidgetProps } from "../Widget";
import type { IconElement, LabelElement } from "../../Element";
import {
  EMPTY_RECT,
  clampPopupToBounds,
  getAnchorEdge,
  getClampBounds,
  getPositionSpaces,
  isVerticalPosition,
  measureAnchorShift,
  measureArrowBoxSize,
  placePopup,
  resolveAnchorAdjust,
  resolvePopupPosition,
  type PopupAlign,
  type PopupLayout,
  type PopupPosition,
} from "./popupLayout";

export type { PopupAlign, PopupPosition };

/**
 * Props for the popup: `icon` / `label` / `invisibleLabel` belong to the head.
 *
 * 浮层属性：`icon` / `label` / `invisibleLabel` 属于头部区（head），其余为定位与开合相关。
 */
export interface PopupProps
  extends WidgetProps<HTMLDivElement>, IconElement, LabelElement {
  /**
   * Whether open (controlled; Popup never opens itself).
   *
   * 是否打开（受控，传入即受控模式；Popup 不自行打开）
   */
  open?: boolean;

  /**
   * Initial open state for uncontrolled use
   *
   * 非受控初始打开态
   */
  defaultOpen?: boolean;

  /**
   * Anchor container (`ref` or element); defaults to the body's top-left when omitted.
   *
   * 锚定容器（`ref` 或元素）；缺省定位到 body 左上角
   */
  container?: RefObject<HTMLElement | null> | HTMLElement | null;

  /**
   * Popup direction: `above` / `below` / `before` (left) / `after` (right).
   *
   * 弹出方位：above/below/before（左侧）/after（右侧）
   */
  position?: PopupPosition;

  /**
   * Alignment (logical values flip with RTL; `force-*` stay physical).
   *
   * 对齐方向（逻辑值随 RTL 换侧，`force-*` 恒为物理侧）
   */
  align?: PopupAlign;

  /**
   * Whether to draw the arrow pointing at the anchor
   *
   * 是否画指向锚点的箭头
   */
  anchor?: boolean;

  /**
   * Auto-close on outside click / Escape
   *
   * 点击外部 / Escape 自动关闭
   */
  autoClose?: boolean;

  /**
   * Elements ignored by the auto-close test (e.g. the trigger).
   *
   * 自动关闭的忽略元素（如触发按钮）
   */
  autoCloseIgnore?: RefObject<HTMLElement | null> | HTMLElement | null;

  /**
   * Flip to the opposite side when it doesn't fit
   *
   * 放不下时翻转到对侧
   */
  autoFlip?: boolean;

  /**
   * Temporarily hide while the anchor is scrolled out of view (without changing `open`).
   *
   * 锚点滚出可视区时暂时隐藏（不改 `open`）
   */
  hideWhenOutOfView?: boolean;

  /**
   * Clamp inset (px)
   *
   * 钳制内边距（px）
   */
  containerPadding?: number;

  /**
   * Render a head (icon + label + close button)
   *
   * 渲染头部（icon + label + 关闭按钮）
   */
  head?: boolean;

  /**
   * Hide the close button alongside `head`
   *
   * 配合 `head` 隐藏关闭按钮
   */
  hideCloseButton?: boolean;

  /**
   * Whether the content has padding
   *
   * 内容是否有内边距
   */
  padded?: boolean;

  // 实现说明：width/height落在内容盒.oo-ui-popupWidget-popup上（原版config.width的落点），
  // 弹层根.oo-ui-popupWidget的style.width不改变视觉宽度
  /**
   * Popup width (px)
   *
   * 弹层宽度（px）
   */
  width?: number | string;

  /**
   * Popup height (px)
   *
   * 弹层高度（px）
   */
  height?: number | string;

  /**
   * Bottom-area content
   *
   * 底部区域内容
   */
  footer?: ReactNode;

  /**
   * Open-state change callback (close button / outside click / Escape / tab-out).
   *
   * 开合变化回调（点关闭按钮 / 点外部 / Escape / Tab 越界触发）
   */
  onOpenChange?: (open: boolean) => void;
}

/**
 * 锚点偏移样式：上下锚为横向偏移（left），左右锚为纵向偏移（top）
 */
function getAnchorStyle(
  layout: PopupLayout | null,
): { left?: number } | { top?: number } | undefined {
  if (!layout) {
    return undefined;
  }
  return layout.anchorEdge === "top" || layout.anchorEdge === "bottom"
    ? { left: layout.anchorOffset }
    : { top: layout.anchorOffset };
}

// 实现说明：对齐原版OO.ui.PopupWidget（浮动定位+锚点箭头+自动翻转+自动关闭+ClippableElement
// 裁剪+Tab边界关闭）。容器探测从锚点回溯（浮层portal出控件子树），见dev-docs/DEVIATIONS.md
/**
 * A floating panel anchored to an element, with automatic positioning and flipping —
 * suited to on-demand content such as annotations and tooltips; for button-triggered
 * cases use PopupButton directly.
 *
 * 浮动面板：锚定到某个元素、自动定位与翻转的浮层，适合注解、Tooltip 一类的按需展示内容；
 * 按钮触发的场景可直接用 PopupButton。
 *
 * @see https://bearbin1215.github.io/ooui-react/components/popup/index.html
 */
export const Popup = forwardRef<HTMLDivElement, PopupProps>(
  (
    {
      open: openProp,
      defaultOpen = false,
      container,
      position: positionProp = "below",
      align: alignProp = "center",
      anchor = true,
      autoClose,
      autoCloseIgnore,
      autoFlip = true,
      hideWhenOutOfView = true,
      containerPadding = 10,
      head,
      hideCloseButton,
      padded,
      invisibleLabel,
      width = 320,
      height,
      footer,
      onOpenChange,
      icon,
      label,
      children,
      className,
      dir: dirProp,
      disabled,
      style,
      ...rest
    },
    ref,
  ) => {
    // 打开态受控/非受控统一管线：显隐由调用方驱动（open传入即受控），弹层内部的关闭
    // 请求（关闭按钮/点外部/Escape/焦点圈闭）经setOpen发出并回调onOpenChange
    const { value: open, commit: setOpen } = useControlledValue<boolean>(
      { value: openProp, defaultValue: defaultOpen },
      onOpenChange,
    );
    // portal根（外层div）：autoClose的内部判定范围连同浮层壳与箭头一起排除
    const rootRef = useRef<HTMLDivElement>(null);
    const setRootRef = useMergedRefs(rootRef, ref);
    const popupRef = useRef<HTMLDivElement>(null);
    const [layout, setLayout] = useState<PopupLayout | null>(null);
    // 锚定容器滚出可视区时的表现层隐藏（不改变open）
    const [outOfView, setOutOfView] = useState(false);
    // 关闭按钮的无障碍标签（对齐原版ooui-popup-widget-close-button-aria-label消息）
    const closeAriaLabel = useMessage("ooui-popup-widget-close-button-aria-label");
    // 浮层文本方向覆盖与视口留白（全局配置）
    const configDir = useDir();
    const spacing = useViewportSpacing();
    // 浮层portal容器：宿主配置优先，弹窗子树内回落该弹窗的管理器根，其余document.body
    const { getContainer, dialogZIndex } = useFloatPortal();
    const portalTarget = getContainer(resolveElement(container));

    const classes = clsx(
      className,
      getWidgetClassName({ disabled, label, invisibleLabel }, "popup"),
      anchor &&
        layout &&
        `oo-ui-popupWidget-anchored oo-ui-popupWidget-anchored-${layout.anchorEdge}`,
      elementHiddenClasses(!open || outOfView),
    );

    // 对齐原版FloatableElement.position()：重定位、滚出隐藏（hideWhenOutOfView）与裁剪
    // （ClippableElement.clip）由同一监听集（滚动/缩放/壳尺寸变化）触发、按序完成——
    // 先切换滚出类、再写computePosition()结果、最后clip（`oojs-ui.js:5364-5380`），监听分别
    // 绑在togglePositioning（`:5241-5244`）与toggleClipping（`:5636-5638`）。本工程同型收敛为
    // 单个effect：每轮回调内「重算布局→应用可视边界」，布局以compute()返回值就地传递、不经
    // layout state接力（state接力的旧形态会让滚动先按过期布局裁剪一轮、重渲染后再算一遍）。
    // 影响布局的props变化时须重新计算（含open期间切换container/anchor），对齐原版
    // setFloatableContainer/setPosition等setter的即时重定位语义
    useLayoutEffect(() => {
      if (!open) {
        setOutOfView(false);
        return;
      }
      const popup = popupRef.current;
      if (!popup) {
        return;
      }
      const containerEl = resolveElement(container);
      // 弹层方向：本组件声明的dir（原版Element config.dir的对应物）> Provider.dir > 锚点继承方向。
      // dir prop按HTMLAttributes收为string，非ltr/rtl的取值（如auto）不参与解析、交回下层来源
      const dir =
        (dirProp === "ltr" || dirProp === "rtl" ? dirProp : configDir) ??
        getElementDir(containerEl);
      // 就近滚动容器：翻转/钳制/裁剪/滚出判定的公共基准，随container在本effect运行期内不变
      const scroller = findScrollableContainer(containerEl);
      // body内联裁剪样式的复位：测量前清基、可整显时清除、effect清理，三处同型收敛
      const resetBodyClip = () => {
        const body = popupRef.current?.querySelector<HTMLElement>(
          ".oo-ui-popupWidget-body",
        );
        if (body) {
          body.style.overflow = "";
          body.style.height = "";
          body.style.width = "";
        }
      };
      // 对齐原版computePosition：按container与popup尺寸计算绝对定位与锚点偏移（页面坐标，
      // portal出控件子树）。测量前先清上一轮裁剪，以未裁剪的自然尺寸为基准（裁剪基于自然
      // 尺寸计算，避免逐轮收缩振荡）
      const compute = (): PopupLayout | null => {
        if (!popupRef.current) {
          return null;
        }
        const scrollX = window.scrollX;
        const scrollY = window.scrollY;
        resetBodyClip();
        const base = containerEl?.getBoundingClientRect() ?? EMPTY_RECT;
        const pw = popupRef.current.offsetWidth;
        const ph = popupRef.current.offsetHeight;
        // 方位与对齐为逻辑值，物理侧按方向解析（对齐原版FloatableElement按direction取start/end）
        const rtl = dir === "rtl";

        // 翻转判定：常态方向放不下时翻转到对侧（autoFlip关闭时保持声明方位）。
        // 基准与钳制同源（锚点就近滚动容器，对齐原版翻转判定走isClipped*的
        // $clippableScrollableContainer），并按原版clip()口径取内缩后的clip边界
        const clipBounds = getClipBounds(getVisibleBounds(scroller), scroller, spacing);
        const position = autoFlip
          ? resolvePopupPosition(positionProp, getPositionSpaces(base, clipBounds, rtl), {
              width: pw,
              height: ph,
            })
          : positionProp;
        // 箭头两处几何量运行时实测（随主题自适应）：占位量与箭头盒，见popupLayout的
        // measureAnchorShift / measureArrowBoxSize
        const anchorEl = anchor
          ? rootRef.current?.querySelector<HTMLElement>(".oo-ui-popupWidget-anchor")
          : undefined;
        const anchorShift = anchor ? measureAnchorShift(rootRef.current) : 0;
        const { top, left } = placePopup({
          base,
          position,
          align: alignProp,
          rtl,
          anchored: anchor,
          anchorShift,
          scrollX,
          scrollY,
          popupWidth: pw,
          popupHeight: ph,
        });

        const anchorEdge = getAnchorEdge(position);
        // above/below弹层的锚点与钳制沿水平轴，before/after沿垂直轴（对齐原版sizeProp的取轴）
        const anchorAxisX = isVerticalPosition(position);
        const popupStart = anchorAxisX ? left : top;
        const popupSize = anchorAxisX ? pw : ph;
        // 锚点指向container中线（记录未调整的原始偏移，随弹层平移）
        const rawAnchorOffset = anchorAxisX
          ? base.left + base.width / 2 + scrollX - popupStart
          : base.top + base.height / 2 + scrollY - popupStart;

        // 对齐原版两段positionAdjustment：1) 锚点距弹层两端不足2*箭头盒尺寸时平移弹层为其腾出空间
        // （anchored的backwards以'before'起手，靠这一步拉到「锚点中线距终止端2×箭头盒」的稳态）；
        // 2) 容器边界钳制（就近滚动容器，缺省视口）内缩containerPadding
        const arrowBoxSize = measureArrowBoxSize(anchorEl, anchorAxisX);
        const arrowAdjust = anchor
          ? resolveAnchorAdjust(rawAnchorOffset, popupSize, arrowBoxSize)
          : 0;
        const bounds = getClampBounds(
          scroller,
          anchorAxisX,
          { x: scrollX, y: scrollY },
          spacing,
        );
        const totalAdjust =
          arrowAdjust +
          clampPopupToBounds(
            popupStart + arrowAdjust,
            popupSize,
            bounds,
            containerPadding,
          );

        return {
          // 钳制/腾挪沿被钳制的轴施加：纵向弹层平移left，横向弹层平移top
          top: anchorAxisX ? top : top + totalAdjust,
          left: anchorAxisX ? left + totalAdjust : left,
          anchorEdge,
          // 对齐原版：锚点偏移按总调整量反向修正，钳制/腾挪后箭头仍指向触发器中心
          anchorOffset: rawAnchorOffset - totalAdjust,
          // 裁剪轴上的自然尺寸，供裁剪计算使用（裁剪会改变实际rect，不能以实际rect为基准）
          unclippedSize: anchorAxisX ? ph : pw,
          dir,
        };
      };
      // 滚出隐藏与裁剪（对齐原版position()中computePosition之后的滚出类切换与clip调用）：
      // 布局取本轮compute的结果而非layout state，与重算同批完成
      const applyVisualBounds = (current: PopupLayout | null) => {
        const body = popupRef.current?.querySelector<HTMLElement>(
          ".oo-ui-popupWidget-body",
        );
        // 可视区边界统一经getVisibleBounds解析（元素容器扣滚动条沟槽、RTL在左，视口为
        // clientWidth/Height口径），与useAnchoredPanelLayout同一口径
        const visible = getVisibleBounds(scroller);
        // 滚出隐藏：锚定容器与可视区（就近滚动容器，缺省视口）无交集时隐藏
        if (hideWhenOutOfView && containerEl) {
          const cr = containerEl.getBoundingClientRect();
          const out =
            cr.bottom < visible.top ||
            cr.top > visible.bottom ||
            cr.right < visible.left ||
            cr.left > visible.right;
          setOutOfView(out);
          if (out) {
            return;
          }
        } else {
          setOutOfView(false);
        }
        if (!body || !current) {
          return;
        }
        // 裁剪：body超出可视区时压至可用尺寸。
        // itemRect以未裁剪自然尺寸为基准（实际rect会随裁剪收缩，直接使用会逐轮振荡）。
        // vp取内缩后的clip边界（视口留白仅视口分支、buffer恒计，见getClipBounds）；
        // 前述滚出隐藏判定用的visible保持原始边界（不内缩）
        const vp = getClipBounds(visible, scroller, spacing);
        const popupRect = popup.getBoundingClientRect();
        const bodyRect = body.getBoundingClientRect();
        const verticalClip =
          current.anchorEdge === "top" || current.anchorEdge === "bottom";
        const startVP = verticalClip ? popupRect.top : popupRect.left;
        const size = current.unclippedSize;
        // itemRect向锚点反方向扩展至可视区边界（对齐原版按anchorEdge扩展itemRect）：
        // anchor top/bottom（above/below弹层）：远离锚点的一端扩展到vp边界，靠近锚点的一端取自身位置
        let availSize: number;
        if (current.anchorEdge === "top") {
          availSize = vp.bottom - startVP;
        } else if (current.anchorEdge === "bottom") {
          availSize = startVP + size - vp.top;
        } else if (current.anchorEdge === "start") {
          availSize = vp.right - startVP;
        } else {
          availSize = startVP + size - vp.left;
        }
        availSize = Math.max(0, availSize);
        // extra为弹层壳（头部/边框）尺寸：壳不随裁剪收缩，用当前rect差值稳定
        const extraSize = verticalClip
          ? popupRect.height - bodyRect.height
          : popupRect.width - bodyRect.width;
        // 钳0：锚点贴近视口边缘时availSize不足以覆盖弹层壳，alloted为负是非法CSS值
        // 会被浏览器丢弃导致裁剪静默失效（与MenuSelect的钳0口径一致）
        const alloted = Math.max(0, Math.ceil(availSize - extraSize));
        const natural = verticalClip ? body.scrollHeight : body.scrollWidth;
        if (alloted < natural) {
          body.style.overflow = "auto";
          if (verticalClip) {
            body.style.height = `${alloted}px`;
          } else {
            body.style.width = `${alloted}px`;
          }
        } else {
          resetBodyClip();
        }
      };
      const initial = compute();
      setLayout(initial);
      applyVisualBounds(initial);
      // 滚动/缩放/壳尺寸变化后整体重算（重定位+滚出隐藏+裁剪）。壳尺寸变化（open期间切换
      // head/footer、内容增减）经ResizeObserver触发：head/footer是内联JSX、每渲染都是新引用，
      // 进deps会导致每渲染重定位，故改观察壳尺寸。裁剪引起的壳尺寸回流会在下一轮回调内先清基
      // 再测量，重算后净DOM变化为零，不会形成观察循环
      const recompute = () => {
        const next = compute();
        setLayout(next);
        applyVisualBounds(next);
      };
      const shellObserver = new ResizeObserver(recompute);
      shellObserver.observe(popup);
      window.addEventListener("resize", recompute);
      document.addEventListener("scroll", recompute, true);
      return () => {
        shellObserver.disconnect();
        window.removeEventListener("resize", recompute);
        document.removeEventListener("scroll", recompute, true);
        resetBodyClip();
      };
    }, [
      open,
      positionProp,
      alignProp,
      autoFlip,
      width,
      height,
      containerPadding,
      container,
      anchor,
      dirProp,
      configDir,
      spacing,
      hideWhenOutOfView,
    ]);

    // 对齐原版onDocumentMouseDown/onDocumentKeyDown：点击popup与忽略元素之外、或按Escape时
    // 请求关闭。Escape捕获阶段处理并stopPropagation，嵌套Dialog等冒泡处理器时不误关外层；
    // 复用useDismissablePopover（comparison-guide约定浮层关闭统一走该hook）
    useDismissablePopover({
      enabled: open && !!autoClose,
      onClose: () => setOpen(false),
      ignore: [rootRef, autoCloseIgnore],
      // 弹层类同绑click（对齐原版PopupWidget.bindDocumentMouseDownListener，iOS Safari所需）
      dismissOnClick: true,
    });

    // 对齐原版toggle中的焦点圈闭：autoClose时，Tab走出最后一个焦点元素（或Shift+Tab走出第一个）即关闭弹层
    useEffect(() => {
      if (!open || !autoClose) {
        return;
      }
      const root = popupRef.current;
      if (!root) {
        return;
      }
      const focusables = getFocusableElements(root);
      const first = focusables[0];
      const last = focusables[focusables.length - 1];
      const handleFirst = (event: KeyboardEvent) => {
        if (event.shiftKey && event.key === "Tab") {
          event.preventDefault();
          setOpen(false);
        }
      };
      const handleLast = (event: KeyboardEvent) => {
        if (!event.shiftKey && event.key === "Tab") {
          event.preventDefault();
          setOpen(false);
        }
      };
      first?.addEventListener("keydown", handleFirst);
      last?.addEventListener("keydown", handleLast);
      return () => {
        first?.removeEventListener("keydown", handleFirst);
        last?.removeEventListener("keydown", handleLast);
      };
      // first/last为打开时的快照，对齐原版在toggle(show)时绑定一次的时机；layout滚动时高频
      // 变化，不能作为依赖（否则每次滚动都重新查询并重绑监听）
    }, [open, autoClose, setOpen]);

    return createPortal(
      <div
        {...rest}
        className={classes}
        // dir取弹层有效方向（RTL站点/Provider.dir配置下浮层文本方向正确）
        dir={layout?.dir}
        // 调用方style与定位样式合并：定位键（每轮重算的position/top/left/zIndex）以组件为准，
        // 其余键（原版没有的字段）透传生效
        style={{
          ...style,
          position: "absolute",
          top: layout?.top ?? OFFSCREEN_POSITION,
          left: layout?.left ?? OFFSCREEN_POSITION,
          // 弹窗子树内与所属弹窗同层（见useFloatPortal）；其余情形交回主题CSS
          zIndex: dialogZIndex,
        }}
        ref={setRootRef}
      >
        <div className="oo-ui-popupWidget-popup" style={{ width, height }} ref={popupRef}>
          {head && (
            <div className="oo-ui-popupWidget-head">
              {/* 原版head图标是IconElement裸span（非IconWidget）：带widget盒子类会撑高head */}
              <IconBase icon={icon} />
              <LabelBase invisible={invisibleLabel}>{label}</LabelBase>
              {!hideCloseButton && (
                <Button
                  framed={false}
                  icon="close"
                  className="oo-ui-popupWidget-closeButton"
                  aria-label={closeAriaLabel}
                  onClick={() => setOpen(false)}
                />
              )}
            </div>
          )}
          <div
            className={clsx(
              "oo-ui-popupWidget-body",
              padded && "oo-ui-popupWidget-body-padded",
            )}
          >
            {children}
          </div>
          {footer && <div className="oo-ui-popupWidget-footer">{footer}</div>}
        </div>
        {anchor && (
          <div className="oo-ui-popupWidget-anchor" style={getAnchorStyle(layout)} />
        )}
      </div>,
      portalTarget,
    );
  },
);

Popup.displayName = "Popup";
