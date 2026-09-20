import {
  forwardRef,
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
  useMergedRefs,
} from "../../hooks";
import { useToolbarNarrow, useToolbarPosition } from "../Toolbar/context";
import {
  ToolView,
  applyNarrowConfig,
  getToolHoverHandlers,
  isGroupAutoDisabled,
  useToolGroupPressed,
  type ToolGroupBaseProps,
  type ToolProps,
} from "../Tool";

/** keepOpenToolNames的缺省空数组（模块级常量，避免每渲染新建字面量使useMemo失效） */
const NO_KEEP_OPEN_TOOLS: string[] = [];

export interface PopupToolGroupBaseProps extends ToolGroupBaseProps {
  /**
   * Handle label.
   *
   * 把手标签。
   */
  label?: ReactNode;

  /**
   * Handle icon.
   *
   * 把手图标。
   */
  icon?: string;

  /**
   * Handle label visually hidden but kept as the accessible name.
   *
   * 把手标签视觉隐藏（保留可访问名称）。
   */
  invisibleLabel?: boolean;

  /**
   * Narrow-mode overrides: when the toolbar is narrow, the **defined** keys replace
   * the handle's `invisibleLabel` / `label` / `icon`; restored on leaving narrow mode.
   *
   * 窄栏配置：工具栏处于窄栏时以其**已定义**字段替换把手的
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
   * 把手指示器（缺省随工具栏位置翻转：bottom 时 up、其余 down）。
   */
  indicator?: Indicators;

  /**
   * Handle tooltip.
   *
   * 把手 tooltip。
   */
  title?: string;

  /**
   * Explanatory text at the top of the panel.
   *
   * 面板顶部说明文字。
   */
  header?: ReactNode;

  /**
   * Selecting a tool with one of these names does not close the panel (the List
   * group's more-fewer tool).
   *
   * 选中这些符号名的工具后不收起面板（List 组的 more-fewer 工具）。
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
   * 打开态变化回调（把手切换、选中工具收起、点外部、Escape 均触发）。
   */
  onOpenChange?: (open: boolean) => void;
}

/**
 * 弹出工具组基类（对齐原版OO.ui.PopupToolGroup，List/Menu组的公共实现，不对外导出）：
 * 把手（图标+标签+指示器）点击开合工具面板，面板portal出控件子树后定位在把手正下方，
 * 宽度放不下时按原版setActive的降级顺序处理——首选侧→对侧→居中→铺满容器
 * （见useAnchoredPanelLayout的horizontalFit），视口下方空间不足时钳高内部滚动；
 * 面板开合经`open`/`defaultOpen`/`onOpenChange`受控（库内浮层统一通道）；
 * 点击面板与把手之外或选中工具（keepOpenToolNames除外）收起
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
      ...rest
    },
    ref,
  ) => {
    // 面板开合受控/非受控统一管线（库内浮层统一通道）：内部各关闭路径经setOpen发出并回调onOpenChange
    const { value: open, commit: setOpen } = useControlledValue<boolean>(
      { value: openProp, defaultValue: defaultOpen },
      onOpenChange,
    );
    const position = useToolbarPosition();
    // 工具栏窄栏态：面板内工具链接的窄栏样式为后代选择器（原版setNarrow同步到$popups），
    // portal出工具栏子树的面板经窄栏载体承接（对齐原版$popups.toggleClass）
    const narrow = useToolbarNarrow();
    const rootRef = useRef<HTMLDivElement>(null);
    const mergedRef = useMergedRefs(rootRef, ref);
    const handleRef = useRef<HTMLSpanElement>(null);
    const toolsRef = useRef<HTMLDivElement>(null);
    const groupDisabled = isGroupAutoDisabled(tools, disabled);
    const effectiveIndicator = indicator ?? (position === "bottom" ? "up" : "down");
    // 窄栏配置：窄栏时替换把手字段（对齐原版PopupToolGroup.onToolbarResize），退出窄栏即还原
    const {
      icon: effectiveIcon,
      label: effectiveLabel,
      invisibleLabel: effectiveInvisibleLabel,
    } = applyNarrowConfig({ icon, label, invisibleLabel }, narrowConfig, narrow);

    /** 工具选中后收起面板（keepOpenToolNames除外），并转发onSelect */
    const wrappedTools = useMemo(
      () =>
        tools.map((tool) => ({
          ...tool,
          onSelect: () => {
            tool.onSelect?.();
            onToolSelect?.(tool);
            if (!keepOpenToolNames.includes(tool.name)) {
              setOpen(false);
            }
          },
        })),
      [tools, onToolSelect, keepOpenToolNames, setOpen],
    );
    const { pressedName, onMouseKeyDown, onToolKeyDown, onToolHoverChange } =
      useToolGroupPressed(wrappedTools, groupDisabled);

    // 定位与钳高（open变化/滚动/缩放/面板尺寸变化时重算）：bottom工具栏的面板向上展开
    // （对齐原版verticalPosition:'above'），其余向下；面板portal至body（宿主配置的容器，
    // 或弹窗子树内为该弹窗的管理器根，锚点为把手），经页面坐标定位
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

    // 点击面板与把手之外、或按Escape时收起（Escape捕获阶段处理，嵌套于Dialog时不误关弹窗）。
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
    );

    return (
      <div
        {...rest}
        className={classes}
        // title落在组根元素：对齐原版PopupToolGroup混入的TitledElement（$titled为$element）；
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
          // 双类对齐原版构造期的$handle.addClass：主题的把手尺寸/内边距规则均挂在
          // .oo-ui-popupToolGroup .oo-ui-toolGroup-handle后代选择器上，缺toolGroup-handle
          // 会全部不命中（把手塌缩、内容溢出重叠）
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
              // dir取把手有效方向（RTL站点/Provider.dir配置下面板文本方向正确）
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
                // 对齐原版onMouseKeyDown的Tab流转：首项Shift+Tab回把手；末项Tab回把手并收起
                // （末项不preventDefault：焦点已移至把手，浏览器默认Tab自把手继续）
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
              {wrappedTools.map((tool) => (
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
    );
  },
);

PopupToolGroupBase.displayName = "PopupToolGroupBase";
