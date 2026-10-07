import {
  Children,
  forwardRef,
  isValidElement,
  useEffect,
  useRef,
  useState,
  type ReactNode,
  type SyntheticEvent,
} from "react";
import clsx from "clsx";
import { useMergedRefs } from "../../hooks";
import { withTemporaryClasses } from "../../utils";
import type { ElementProps } from "../../Element";
import type { ToolGroupBaseProps } from "../Tool";
import { ToolbarNarrowProvider, ToolbarPositionProvider } from "./context";

/**
 * 窄栏类名：state派生与测量期临时增删共用同一常量，避免字面量分叉
 */
const NARROW_CLASS = "oo-ui-toolbar-narrow";

export interface ToolbarProps extends ElementProps<HTMLDivElement> {
  /**
   * Tool groups (`BarToolGroup`, `ListToolGroup`, `MenuToolGroup`, etc.).
   *
   * 工具组集合
   */
  children?: ReactNode;

  /**
   * Toolbar position; affects popup direction and class names.
   *
   * 工具栏位置，影响弹出面板的展开方向与类名
   *
   * @default 'top'
   */
  position?: "top" | "bottom";

  /**
   * Content of the separate actions area on the right.
   *
   * 右侧独立动作区内容
   */
  actions?: ReactNode;
}

// 实现说明：对齐原版OO.ui.Toolbar——窄栏模式下按narrowConfig切换把手与工具的图标/文本
// （对齐setNarrow/onToolbarResize）。工具组经声明式props传入，不经原版的
// ToolFactory/ToolGroupFactory注册，见dev-docs/DEVIATIONS.md「舍弃」
/**
 * A toolbar: a horizontal bar arranging several tool groups, with tools living
 * inside the groups.
 *
 * 工具栏：一条横栏容器，内部排列若干工具组，工具由工具组承载。
 *
 * @see https://bearbin1215.github.io/ooui-react/components/toolbar/index.html
 */
export const Toolbar = forwardRef<HTMLDivElement, ToolbarProps>(
  ({ children, position = "top", actions, className, ...rest }, ref) => {
    const rootRef = useRef<HTMLDivElement>(null);
    const mergedRef = useMergedRefs(rootRef, ref);
    const barRef = useRef<HTMLDivElement>(null);
    const toolsRef = useRef<HTMLDivElement>(null);
    const afterRef = useRef<HTMLDivElement>(null);
    const actionsRef = useRef<HTMLDivElement>(null);
    // 窄栏判定经state参与className（对齐原版onWindowResize加/移除oo-ui-toolbar-narrow）：
    // classList单改会被下一次受控className覆盖（className/position变化而children引用稳定时丢失），
    // state才是权威源；measure()内临时remove/add与setNarrow同源，仅用于取未压缩宽度
    const [narrow, setNarrow] = useState(false);
    const rafRef = useRef(0);
    // measure可能在React提交前再次触发，故以narrowRef读写最新窄栏态；
    // 渲染期同步赋值用于兜底StrictMode重挂载（state存续而ref重建）
    const narrowRef = useRef(narrow);
    narrowRef.current = narrow;
    // 窄栏判定基准（宽栏内容总宽）缓存，仅宽栏态重测
    const thresholdRef = useRef<number | null>(null);

    /**
     * 对齐原版onPointerDown（原版mousedown/keydown共用同一handler）：事件目标不在任何子
     * .oo-ui-widget内（点在工具栏空白处）或与工具栏自身同属一个widget时，返回false等效的
     * preventDefault+stopPropagation
     */
    const handlePointerDown = (ev: SyntheticEvent) => {
      const target = ev.target;
      if (!(target instanceof Element)) {
        return;
      }
      const closestWidget = target.closest(".oo-ui-widget");
      const ownWidget = rootRef.current?.closest(".oo-ui-widget") ?? null;
      if (!closestWidget || closestWidget === ownWidget) {
        ev.preventDefault();
        ev.stopPropagation();
      }
    };

    // actions容器的在位状态（内容变化由MutationObserver承接，见下方effect注释）
    const hasActions = !!actions;

    useEffect(() => {
      // 窄栏判定：栏宽不足以容纳内容总宽时进入窄栏。内容基准阈值按getNarrowThreshold缓存，
      // effect重跑（actions容器挂卸/position/className变化）时重置重测（重置时机与
      // 原版的差异见dev-docs/DEVIATIONS.md「增强」）
      thresholdRef.current = null;
      const measure = () => {
        const bar = barRef.current;
        const root = rootRef.current;
        if (!bar || !root) {
          return;
        }
        // narrow类会压缩工具组宽度（主题CSS有多处.narrow规则），以压缩后宽度为基准会
        // 误判；且窄栏态下narrowConfig已替换把手/工具文本，重测会以窄栏内容为基准导致
        // 无法退出窄栏（退出须以宽栏内容宽度为准）。故仅宽栏态重测基准（测量期临时
        // 移除该类取自然宽度，withTemporaryClasses保证恢复），窄栏态复用缓存
        if (!narrowRef.current || thresholdRef.current === null) {
          let contentWidth = 0;
          withTemporaryClasses(root, { remove: [NARROW_CLASS] }, () => {
            contentWidth =
              (toolsRef.current?.offsetWidth ?? 0) +
              (afterRef.current?.offsetWidth ?? 0) +
              (actionsRef.current?.offsetWidth ?? 0);
          });
          thresholdRef.current = contentWidth;
        }
        const next = bar.clientWidth <= thresholdRef.current;
        // classList同步写回：与下方由state派生的className同值，仅为免去等待React提交的闪烁
        root.classList.toggle(NARROW_CLASS, next);
        narrowRef.current = next;
        setNarrow(next);
      };
      measure();
      // RO回调内经rAF排队测量：measure会改narrow类引发布局变化，同步执行在RO回调内
      // 会触发"ResizeObserver loop"错误通知；rAF将其移出RO交付周期，且天然按帧合并
      const scheduleMeasure = () => {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = requestAnimationFrame(measure);
      };
      // 栏宽变化由RO(bar)承接；内容宽度变化（工具组/动作区增减、文本更新）由
      // MutationObserver承接——tools容器为display:inline不可被RO观察，而childList/
      // characterData变化正是窄栏判定内容项的真实变化源，也免去children引用入deps
      // 导致的每渲染强制布局。measure仅切换根上narrow类（attribute变化），不会反过来
      // 触发本观察器，无观察循环
      const observer = new ResizeObserver(scheduleMeasure);
      const contentObserver = new MutationObserver(scheduleMeasure);
      if (barRef.current) {
        observer.observe(barRef.current);
      }
      for (const el of [toolsRef.current, afterRef.current, actionsRef.current]) {
        if (el) {
          contentObserver.observe(el, {
            childList: true,
            characterData: true,
            subtree: true,
          });
        }
      }
      return () => {
        cancelAnimationFrame(rafRef.current);
        observer.disconnect();
        contentObserver.disconnect();
      };
      // children每渲染新引用故不入deps（内容变化由MutationObserver承接）；
      // actions同为ReactNode、内联JSX时每渲染都是新引用，入deps会让每次父渲染都清零
      // 阈值重测并重建双观察器，故以hasActions布尔承载容器挂卸（条件渲染）；
      // position/className变化亦重测，避免引用稳定时narrow判定过期
    }, [hasActions, position, className]);

    // 按工具组的align分发到左侧工具区或右侧after容器（对齐原版insertItemElements对
    // align:'after'的处理）。工具组为React元素，仅按其props.align分组，不改变组内顺序
    const beforeGroups: ReactNode[] = [];
    const afterGroups: ReactNode[] = [];
    Children.forEach(children, (child) => {
      if (isValidElement<ToolGroupBaseProps>(child) && child.props.align === "after") {
        afterGroups.push(child);
      } else {
        beforeGroups.push(child);
      }
    });

    return (
      <div
        {...rest}
        className={clsx(
          className,
          "oo-ui-toolbar",
          `oo-ui-toolbar-position-${position}`,
          narrow && NARROW_CLASS,
        )}
        onMouseDown={handlePointerDown}
        onKeyDown={handlePointerDown}
        ref={mergedRef}
      >
        <ToolbarPositionProvider value={position}>
          <ToolbarNarrowProvider value={narrow}>
            <div ref={barRef} className="oo-ui-toolbar-bar">
              <div ref={toolsRef} className="oo-ui-toolbar-tools">
                {beforeGroups}
              </div>
              <div ref={afterRef} className="oo-ui-toolbar-tools oo-ui-toolbar-after">
                {afterGroups}
              </div>
              {actions && (
                <div ref={actionsRef} className="oo-ui-toolbar-actions">
                  {actions}
                </div>
              )}
              <div style={{ clear: "both" }} />
            </div>
          </ToolbarNarrowProvider>
        </ToolbarPositionProvider>
      </div>
    );
  },
);

Toolbar.displayName = "Toolbar";
