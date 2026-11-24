import {
  forwardRef,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  type KeyboardEvent as ReactKeyboardEvent,
  type ReactNode,
} from "react";
import { createPortal } from "react-dom";
import clsx from "clsx";
import { IconBase } from "../../widgets/Icon/Base";
import { IndicatorBase } from "../../widgets/Indicator/Base";
import type { Indicators } from "../../Element";
import { LabelBase } from "../../widgets/Label/Base";
import { elementHiddenClasses, getWidgetClassName, resolveTitle } from "../../mixins";
import { isActivationKey, OFFSCREEN_POSITION } from "../../utils";
import {
  useAnchoredPanelLayout,
  useControlledValue,
  useDismissablePopover,
  useFloatPortal,
  useLatestRef,
  useMergedRefs,
} from "../../hooks";
import {
  normalizePromotableSets,
  promotionSignature,
  type PromoteToBar,
} from "../promotion";
import {
  ToolbarPromotionProvider,
  usePromotedToolNames,
  useToolbarGroupOrder,
  useToolbarNarrow,
  useToolbarPosition,
  useToolbarPromotion,
  type ToolbarPromotableGroupInfo,
} from "../Toolbar/context";
import {
  ToolView,
  applyNarrowConfig,
  getToolHoverHandlers,
  isGroupAutoDisabled,
  useToolGroupPressed,
  type ToolGroupBaseProps,
  type ToolProps,
} from "../Tool";

/** keepOpenToolNames的缺省空数组（模块级常量，避免每渲染新建字面量使memo失效） */
const NO_KEEP_OPEN_TOOLS: string[] = [];

export interface PopupToolGroupBaseProps extends ToolGroupBaseProps {
  /**
   * Handle label.
   *
   * handle标签。
   */
  label?: ReactNode;

  /**
   * Handle icon.
   *
   * handle图标。
   */
  icon?: string;

  /**
   * Handle label visually hidden but kept as the accessible name.
   *
   * handle标签视觉隐藏（保留可访问名称）。
   */
  invisibleLabel?: boolean;

  /**
   * Narrow-mode overrides: when the toolbar is narrow, the **defined** keys replace
   * the handle's `invisibleLabel` / `label` / `icon`; restored on leaving narrow mode.
   *
   * 窄栏配置：工具栏处于窄栏时以其**已定义**字段替换handle的
   * `invisibleLabel` / `label` / `icon`，退出窄栏还原。
   */
  narrowConfig?: {
    invisibleLabel?: boolean;
    label?: ReactNode;
    icon?: string;
  };

  /**
   * Handle indicator (defaults flip with toolbar position: `up` for a bottom
   * toolbar, `down` otherwise).
   *
   * handle指示器（缺省随工具栏位置翻转：bottom 时 up、其余 down）。
   */
  indicator?: Indicators;

  /**
   * Handle tooltip.
   *
   * handle tooltip。
   */
  title?: string;

  /**
   * Explanatory text at the top of the panel.
   *
   * 面板顶部说明文字。
   */
  header?: ReactNode;

  /**
   * Tools shown outside the popup (before the group) when the toolbar has room.
   * A string promotes one tool; a nested array promotes a whole set together (only
   * when all of its tools fit). Promoted tools render in `BarToolGroup` form
   * (`title` and `accelerator` become part of the tooltip) and return to the panel
   * as space runs out; nothing is promoted in narrow mode.
   *
   * 提升到工具栏的工具：宽度充足时这些工具从面板移到组前的平铺容器（按 Bar 组
   * 形态展示，`title` 与快捷键进 tooltip），空间不足时收回面板；窄栏形态下不提升。
   * 字符串为单个工具，嵌套数组为一组整体提升（容得下整组才提升）。
   */
  promoteToBar?: PromoteToBar;

  /**
   * Selecting a declared tool with one of these names does not close the panel.
   * Appended `extraTools` (ListToolGroup's More / Fewer) never close it.
   *
   * 选中这些符号名的声明工具后不收起面板（附加的 `extraTools`——List 组的
   * More / Fewer——本就不收起）。
   */
  keepOpenToolNames?: string[];

  /**
   * Extra class on the tools container (for CSS customization).
   *
   * 工具容器附加类（供 CSS 定制外观）。
   */
  toolsClassName?: string;

  /**
   * Tool-selection callback.
   *
   * 工具选择回调。
   */
  onToolSelect?: (tool: ToolProps) => void;

  /**
   * Whether the panel is open (controlled; passing it enables controlled mode).
   *
   * 是否打开（受控，传入即受控模式）。
   */
  open?: boolean;

  /**
   * Initial open state for uncontrolled use.
   *
   * 非受控初始打开态。
   */
  defaultOpen?: boolean;

  /**
   * Open-state change callback (handle toggle, choosing a tool that closes the
   * panel, outside click and Escape all fire it).
   *
   * 打开态变化回调（handle切换、选中工具收起、点外部、Escape 均触发）。
   */
  onOpenChange?: (open: boolean) => void;

  /**
   * Internal: tool names rendered in the panel but hidden in the current state
   * (ListToolGroup's collapsed tools). They still count as group items for
   * promotion (`allPromoted`, item order, width subtraction).
   *
   * 内部：面板中隐藏的工具名（List 组未展开的折叠项）。它们仍计入组内工具与提升计算。
   */
  hiddenToolNames?: string[];

  /**
   * Internal: extra panel-only tools appended after `tools` (ListToolGroup's
   * More / Fewer toggle). They join the press flow and reach `onToolSelect`, but
   * are not group items, never close the panel and cannot be promoted.
   *
   * 内部：面板末尾的附加工具（List 组的 More / Fewer 切换项）。参与按压流并经
   * `onToolSelect` 派发，但不是组内工具、选中不收起面板、不可提升。
   */
  extraTools?: ToolProps[];

  /**
   * Internal: promotion registry key. ListToolGroup creates and shares it to read
   * the promoted names (More / Fewer visibility). Defaults to a per-instance key.
   *
   * 内部：提升注册键。List 组生成并共享，用于读取提升态（决定 More / Fewer 去留）；
   * 不给时使用组件实例自持的键。
   */
  promotionGroupKey?: object;
}

/**
 * 弹出工具组基类（对齐原版OO.ui.PopupToolGroup，List/Menu组的公共实现，不对外导出）：
 * handle（图标+标签+指示器）点击开合工具面板，面板portal出控件子树后定位在handle正下方，
 * 宽度放不下时按原版setActive的降级顺序处理——首选侧→对侧→居中→铺满容器
 * （见useAnchoredPanelLayout的horizontalFit），视口下方空间不足时钳高内部滚动；
 * 面板开合经`open`/`defaultOpen`/`onOpenChange`受控（库内浮层统一通道）；
 * 点击面板与handle之外或选中工具（keepOpenToolNames除外）收起。
 * `promoteToBar`声明的工具在工具栏宽度充足时由Toolbar提升到组前的平铺容器
 * （对齐原版setPromotedTools；提升容器是组根元素的前置兄弟节点）
 */
export const PopupToolGroupBase = forwardRef<HTMLDivElement, PopupToolGroupBaseProps>(
  (
    {
      tools,
      label,
      icon,
      invisibleLabel,
      narrowConfig,
      indicator,
      title,
      header,
      promoteToBar,
      keepOpenToolNames = NO_KEEP_OPEN_TOOLS,
      toolsClassName,
      className,
      disabled,
      // align由Toolbar读取后决定挂载位置，本体不渲染（解构掉避免落成DOM属性）；
      // 此处另用于面板的首选对齐侧（对齐原版PopupToolGroup.setActive的before→start、其余→end）
      align = "before",
      onToolSelect,
      open: openProp,
      defaultOpen = false,
      onOpenChange,
      hiddenToolNames,
      extraTools,
      promotionGroupKey,
      ...rest
    },
    ref,
  ) => {
    // 面板开合受控/非受控共用同一套流程（库内浮层统一通道）：内部各关闭路径经setOpen发出并回调onOpenChange
    const { value: open, commit: setOpen } = useControlledValue<boolean>(
      { value: openProp, defaultValue: defaultOpen },
      onOpenChange,
    );
    const position = useToolbarPosition();
    // 工具栏窄栏态：面板内工具链接的窄栏样式为后代选择器（原版setNarrow同步到$popups），
    // portal出工具栏子树的面板经窄栏载体承接（对齐原版$popups.toggleClass）
    const narrow = useToolbarNarrow();
    // 工具提升：Toolbar测量后经context下发本组的提升名单（无Toolbar时为null=不提升）
    const promotion = useToolbarPromotion();
    const registerPromotableGroup = promotion?.register;
    const requestPromotionUpdate = promotion?.requestUpdate;
    const ownPromotionKey = useRef({}).current;
    const groupPromotionKey = promotionGroupKey ?? ownPromotionKey;
    const promotedNames = usePromotedToolNames(groupPromotionKey);
    const rootRef = useRef<HTMLDivElement>(null);
    const mergedRef = useMergedRefs(rootRef, ref);
    const promotedRootRef = useRef<HTMLDivElement>(null);
    const promotedToolsRef = useRef<HTMLDivElement>(null);
    const handleRef = useRef<HTMLSpanElement>(null);
    const toolsRef = useRef<HTMLDivElement>(null);
    const groupDisabled = isGroupAutoDisabled(tools, disabled);
    const effectiveIndicator = indicator ?? (position === "bottom" ? "up" : "down");
    // 窄栏配置：窄栏时替换handle字段（对齐原版PopupToolGroup.onToolbarResize），退出窄栏即还原
    const {
      icon: effectiveIcon,
      label: effectiveLabel,
      invisibleLabel: effectiveInvisibleLabel,
    } = applyNarrowConfig({ icon, label, invisibleLabel }, narrowConfig, narrow);

    // 可提升工具集（按声明顺序、按组内工具过滤去重）：登记给Toolbar用于宽度测量与提升决策
    const itemNames = tools.map((tool) => tool.name);
    const promotableSets = normalizePromotableSets(promoteToBar, itemNames);
    const hasPromotable = promotableSets.length > 0;
    // 声明序号：提升优先级的依据（Toolbar 按 children 顺序下发，align 分发不影响）
    const groupOrder = useToolbarGroupOrder();
    const promotionInfoRef = useLatestRef({
      order: groupOrder,
      sets: promotableSets,
      itemNames,
    });
    // 提升容器内的工具根元素（Toolbar量外宽用）：只认提升容器的直接子工具，
    // 内嵌工具组内部的工具不属于本组工具。带 data-tool-name 的节点有两种形态——
    // 普通工具在链接上，内嵌工具组工具（无链接）在工具位本身，故按属性查名、
    // 再取就近的 .oo-ui-tool 根
    const findPromotedToolElement = useCallback((name: string): HTMLElement | null => {
      const container = promotedToolsRef.current;
      if (!container) {
        return null;
      }
      const named = container.querySelectorAll<HTMLElement>("[data-tool-name]");
      for (const element of named) {
        if (element.getAttribute("data-tool-name") !== name) {
          continue;
        }
        const toolElement = element.closest<HTMLElement>(".oo-ui-tool");
        if (toolElement?.parentElement === container) {
          return toolElement;
        }
      }
      return null;
    }, []);
    const getPromotionInfo = useCallback(
      (): ToolbarPromotableGroupInfo => ({
        order: promotionInfoRef.current.order,
        sets: promotionInfoRef.current.sets,
        itemNames: promotionInfoRef.current.itemNames,
        rootElement: rootRef.current,
        promotedElement: promotedRootRef.current,
        getToolElement: findPromotedToolElement,
      }),
      [promotionInfoRef, findPromotedToolElement],
    );

    // 向Toolbar登记本组（无promoteToBar时注销）：Toolbar经getter读取最新工具集与元素
    useEffect(() => {
      if (!registerPromotableGroup || !hasPromotable) {
        return;
      }
      return registerPromotableGroup(groupPromotionKey, getPromotionInfo);
    }, [registerPromotableGroup, hasPromotable, groupPromotionKey, getPromotionInfo]);

    // 工具集、提升配置或声明顺序变化时请求重测（原版只在initialize与窗口resize时重算，
    // 按内容变化重测是本工程增强，见dev-docs/DEVIATIONS.md的dev-toolbar-promote-to-bar）；
    // 以共享的内容签名比较值，内联数组每渲染新引用不会造成重测循环
    const promotionContentSignature = promotionSignature({
      order: groupOrder,
      itemNames,
      sets: promotableSets,
    });
    useEffect(() => {
      if (!requestPromotionUpdate || !hasPromotable) {
        return;
      }
      requestPromotionUpdate();
    }, [requestPromotionUpdate, hasPromotable, promotionContentSignature]);

    const hiddenNames = new Set(hiddenToolNames);
    const panelTools = tools.filter(
      (tool) => !promotedNames.has(tool.name) && !hiddenNames.has(tool.name),
    );
    const promotedTools = tools.filter((tool) => promotedNames.has(tool.name));
    // 全部工具都被提升：组整体隐藏（对齐原版allToolsPromoted，主题display:none）
    const allPromoted = tools.length > 0 && promotedTools.length === tools.length;

    /**
     * 工具选中：转发工具自身onSelect与组级onToolSelect；面板内的声明工具另按约定收起面板
     * （closeAfterSelect=false 的附加工具只切换自身状态，如 More / Fewer）
     */
    const wrapTool = useCallback(
      (tool: ToolProps, closeAfterSelect: boolean): ToolProps => ({
        ...tool,
        onSelect: () => {
          tool.onSelect?.();
          onToolSelect?.(tool);
          // 提升到工具栏的工具可在面板收起时被选中：仅面板打开时才请求收起
          // （对齐原版PopupToolGroup.onMouseKeyUp的isActive分支）
          if (closeAfterSelect && open && !keepOpenToolNames.includes(tool.name)) {
            setOpen(false);
          }
        },
      }),
      [onToolSelect, keepOpenToolNames, setOpen, open],
    );
    const wrappedTools = useMemo(
      () => tools.map((tool) => wrapTool(tool, true)),
      [tools, wrapTool],
    );
    // 附加工具（more-fewer）同样转发onSelect与onToolSelect，只是不关闭面板
    // （对齐原版ListToolGroup.onMouseKeyUp跳过PopupToolGroup收起分支后仍走工具的onSelect）
    const wrappedExtraTools = useMemo(
      () => extraTools?.map((tool) => wrapTool(tool, false)),
      [extraTools, wrapTool],
    );
    const wrappedByName = useMemo(
      () => new Map(wrappedTools.map((tool) => [tool.name, tool])),
      [wrappedTools],
    );
    const pressTools = useMemo(
      () =>
        wrappedExtraTools?.length
          ? [...wrappedTools, ...wrappedExtraTools]
          : wrappedTools,
      [wrappedTools, wrappedExtraTools],
    );
    // 面板容器与提升容器各承载一部分工具；归属校验拒绝内嵌工具组冒泡上来的同名工具
    const { pressedName, onMouseKeyDown, onToolKeyDown, onToolHoverChange } =
      useToolGroupPressed(
        pressTools,
        groupDisabled,
        (toolElement) =>
          toolElement.parentElement === toolsRef.current ||
          toolElement.parentElement === promotedToolsRef.current,
      );

    // 定位与钳高（open变化/滚动/缩放/面板尺寸变化时重算）：bottom工具栏的面板向上展开
    // （对齐原版verticalPosition:'above'），其余向下；面板portal至body（宿主配置的容器，
    // 或弹窗子树内为该弹窗的管理器根，锚点为handle），经页面坐标定位
    const { getContainer, dialogZIndex } = useFloatPortal();
    const portalTarget = getContainer(handleRef.current);
    const layout = useAnchoredPanelLayout({
      open,
      anchor: handleRef,
      panelRef: toolsRef,
      position: position === "bottom" ? "above" : "below",
      // 面板宽度放不下时按左右空间改选对齐侧（首选侧随工具组分组：align='after'的右组取终止边），
      // 对齐原版PopupToolGroup.setActive的降级顺序
      horizontalFit: true,
      preferredSide: align === "before" ? "start" : "end",
      // ListToolGroup经More/Fewer增减工具后面板高度变化，由hook内的面板ResizeObserver
      // 捕捉并重新钳高
    });

    // 对齐原版setDisabled：禁用时收起面板
    useEffect(() => {
      if (groupDisabled && open) {
        setOpen(false);
      }
    }, [groupDisabled, open, setOpen]);

    // 对齐原版setPromotedTools：全部工具被提升时组整体隐藏，展开中的面板一并收起
    useEffect(() => {
      if (allPromoted && open) {
        setOpen(false);
      }
    }, [allPromoted, open, setOpen]);

    // 点击面板与handle之外、或按Escape时收起（Escape捕获阶段处理，嵌套于Dialog时不误关弹窗）。
    // 弹层类同时监听click：iOS Safari所需，见useDismissablePopover的dismissOnClick
    useDismissablePopover({
      enabled: open,
      onClose: () => setOpen(false),
      ignore: [rootRef, toolsRef],
      dismissOnClick: true,
    });

    /** 面板内可聚焦工具链接（禁用工具链接tabIndex=-1已被排除） */
    const getPanelFocusables = (): HTMLElement[] =>
      Array.from(
        toolsRef.current?.querySelectorAll<HTMLElement>("a.oo-ui-tool-link") ?? [],
      ).filter((el) => el.tabIndex >= 0);

    const handleHandleKeyDown = (e: ReactKeyboardEvent<HTMLSpanElement>) => {
      if (groupDisabled) {
        return;
      }
      // 对齐原版onHandleMouseKeyDown：面板开启时Tab跳到面板内首个可聚焦工具
      if (e.key === "Tab" && !e.shiftKey && open) {
        const first = getPanelFocusables()[0];
        if (first) {
          e.preventDefault();
          first.focus();
          return;
        }
      }
      if (isActivationKey(e.key)) {
        e.preventDefault();
        setOpen((prev) => !prev);
      }
    };

    // 空组加oo-ui-toolGroup-empty整体隐藏（对齐原版populate末尾的toggleClass）
    const classes = clsx(
      className,
      getWidgetClassName({
        disabled: groupDisabled,
        icon: effectiveIcon,
        indicator: effectiveIndicator,
        label: effectiveLabel,
        invisibleLabel: effectiveInvisibleLabel,
      }),
      "oo-ui-toolGroup",
      "oo-ui-popupToolGroup",
      tools.length === 0 && "oo-ui-toolGroup-empty",
      open && "oo-ui-popupToolGroup-active",
      promotedTools.length > 0 && "oo-ui-popupToolGroup-hasPromotedTools",
      allPromoted && "oo-ui-popupToolGroup-allToolsPromoted",
    );

    return (
      // 组内子树（含内嵌工具组）不拥有提升注册通道：原版Toolbar只遍历顶层items，
      // 内嵌组的promoteToBar不参与外层工具栏的提升
      <ToolbarPromotionProvider value={null}>
        {promotedTools.length > 0 && (
          // 提升容器的挂载位置对齐原版：作为组根的前置兄弟节点、形态如BarToolGroup
          // （$promoted = oo-ui-toolGroup oo-ui-barToolGroup oo-ui-popupToolGroup-promoted）
          <div
            ref={promotedRootRef}
            className={clsx(
              getWidgetClassName({ disabled: groupDisabled }),
              "oo-ui-toolGroup",
              "oo-ui-barToolGroup",
              "oo-ui-popupToolGroup-promoted",
            )}
          >
            <div
              ref={promotedToolsRef}
              className={clsx(
                "oo-ui-toolGroup-tools",
                "oo-ui-barToolGroup-tools",
                groupDisabled
                  ? "oo-ui-toolGroup-disabled-tools"
                  : "oo-ui-toolGroup-enabled-tools",
              )}
              onMouseDown={onMouseKeyDown}
              onKeyDown={onToolKeyDown}
              {...getToolHoverHandlers(onToolHoverChange)}
            >
              {promotedTools.map((tool) => (
                <ToolView
                  key={tool.name}
                  tool={wrappedByName.get(tool.name)!}
                  pressed={pressedName === tool.name}
                  tooltip
                  accelTooltip
                  promoted
                  groupDisabled={groupDisabled}
                />
              ))}
            </div>
          </div>
        )}
        <div
          {...rest}
          className={classes}
          // title写在组根元素：对齐原版PopupToolGroup混入的TitledElement（$titled为$element）；
          // 标签不可见（含窄栏替换）时以label兜底，使窄栏下仍有tooltip
          title={resolveTitle({
            title,
            label: effectiveLabel,
            invisibleLabel: effectiveInvisibleLabel,
          })}
          aria-disabled={groupDisabled || undefined}
          ref={mergedRef}
        >
          <span
            ref={handleRef}
            // 双类对齐原版构造期的$handle.addClass：主题的handle尺寸/内边距规则均挂在
            // .oo-ui-popupToolGroup .oo-ui-toolGroup-handle后代选择器上，缺toolGroup-handle
            // 会全部不命中（handle塌缩、内容溢出重叠）
            className="oo-ui-toolGroup-handle oo-ui-popupToolGroup-handle"
            role="button"
            aria-expanded={open}
            aria-disabled={groupDisabled || undefined}
            tabIndex={groupDisabled ? -1 : 0}
            onClick={() => {
              if (!groupDisabled) {
                setOpen((prev) => !prev);
              }
            }}
            onKeyDown={handleHandleKeyDown}
          >
            <IconBase icon={effectiveIcon} />
            <LabelBase invisible={effectiveInvisibleLabel}>{effectiveLabel}</LabelBase>
            <IndicatorBase indicator={effectiveIndicator} />
          </span>
          {createPortal(
            // 窄栏载体：对齐原版$popups容器（携带oo-ui-toolbar-narrow供面板内后代选择器命中）；
            // 不携带oo-ui-toolbar-popups类——其position:absolute会成为面板的定位上下文，
            // 而本实现面板按页面坐标定位于body
            <div className={clsx(narrow && "oo-ui-toolbar-narrow")}>
              <div
                ref={toolsRef}
                // dir取handle有效方向（RTL站点/Provider.dir配置下面板文本方向正确）
                dir={layout?.dir}
                className={clsx(
                  "oo-ui-toolGroup-tools",
                  "oo-ui-popupToolGroup-tools",
                  toolsClassName,
                  groupDisabled
                    ? "oo-ui-toolGroup-disabled-tools"
                    : "oo-ui-toolGroup-enabled-tools",
                  open && "oo-ui-popupToolGroup-active-tools",
                  elementHiddenClasses(!open),
                )}
                onMouseDown={onMouseKeyDown}
                // 面板自首帧即为绝对定位（定位前置于视口外）：若首帧参与body常规流会撑高文档、
                // 引发布局回流导致锚点位移，使定位读到过期坐标而左右错位
                style={{
                  position: "absolute",
                  top: layout?.top ?? OFFSCREEN_POSITION,
                  left: layout?.left ?? OFFSCREEN_POSITION,
                  // 铺满容器的宽度（对齐原版setActive末步的width/min-width）；其余情形不写
                  width: layout?.width,
                  minWidth: layout?.width,
                  maxHeight: layout?.maxHeight,
                  overflowY: layout?.maxHeight !== undefined ? "auto" : undefined,
                  // 弹窗子树内与所属弹窗同层（见useFloatPortal）；其余情形交回主题CSS
                  zIndex: dialogZIndex,
                }}
                onKeyDown={(e) => {
                  // 对齐原版onMouseKeyDown的Tab流转：首项Shift+Tab回handle；末项Tab回handle并收起
                  // （末项不preventDefault：焦点已移至handle，浏览器默认Tab自handle继续）
                  if (e.key === "Tab") {
                    const focusables = getPanelFocusables();
                    const index = focusables.indexOf(e.target as HTMLElement);
                    if (index !== -1) {
                      if (e.shiftKey && index === 0) {
                        e.preventDefault();
                        handleRef.current?.focus();
                        return;
                      }
                      if (!e.shiftKey && index === focusables.length - 1) {
                        handleRef.current?.focus();
                        setOpen(false);
                      }
                    }
                  }
                  // 工具链接的Enter/空格按压流（useToolGroupPressed内部解析目标，非工具位置无副作用）
                  onToolKeyDown(e);
                }}
                {...getToolHoverHandlers(onToolHoverChange)}
              >
                {header && <span className="oo-ui-popupToolGroup-header">{header}</span>}
                {panelTools.map((tool) => (
                  <ToolView
                    key={tool.name}
                    tool={wrappedByName.get(tool.name)!}
                    pressed={pressedName === tool.name}
                    groupDisabled={groupDisabled}
                  />
                ))}
                {wrappedExtraTools?.map((tool) => (
                  <ToolView
                    key={tool.name}
                    tool={tool}
                    pressed={pressedName === tool.name}
                    groupDisabled={groupDisabled}
                  />
                ))}
              </div>
            </div>,
            portalTarget,
          )}
        </div>
      </ToolbarPromotionProvider>
    );
  },
);

PopupToolGroupBase.displayName = "PopupToolGroupBase";
