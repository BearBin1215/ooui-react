/**
 * 工具栏域的共享模块（对齐原版OO.ui.Tool）：承载ToolView/ToolPopupView的渲染与
 * ToolProps/ToolPopupProps契约、ToolGroup按压流（useToolGroupPressed）等跨工具组逻辑。
 * 与其他组件目录不同，本目录的index.tsx不是单一可独立渲染的组件——Tool在原版即为
 * 「数据+渲染」的抽象基类，由各ToolGroup按声明式配置驱动
 */
import {
  useRef,
  useState,
  type FocusEvent as ReactFocusEvent,
  type KeyboardEvent as ReactKeyboardEvent,
  type MouseEvent as ReactMouseEvent,
  type ReactElement,
  type ReactNode,
  type RefObject,
} from "react";
import clsx from "clsx";
import { omitBy } from "es-toolkit";
import { Icon } from "../../widgets/Icon";
import { IconBase } from "../../widgets/Icon/Base";
import { Popup, type PopupProps } from "../../widgets/Popup";
import { getWidgetClassName, hasLabel } from "../../mixins";
import { useControlledValue, useLatestRef, usePressedState } from "../../hooks";
import { isActivationKey } from "../../utils";
import { useToolbarNarrow, useToolbarPosition } from "../Toolbar/context";
import type { WidgetProps } from "../../widgets/Widget";

/**
 * Popup-layer configuration for a tool (aligning with the original `PopupTool`'s
 * `popup`). Open/close is driven by tool selection (selecting toggles it; the tool
 * stays active while the layer is shown); `open` / `defaultOpen` / `onOpenChange`
 * are an optional controlled channel. Positioning and auto-close are handled by the
 * tool itself, so `container` / `autoClose` / `position` are not overridable here.
 *
 * 弹出工具的浮层配置（对齐原版 `PopupTool` 的 `popup`）：显隐由“选中工具”驱动
 * （选中即开合，浮层显隐期间工具呈激活态）；`open` / `defaultOpen` /
 * `onOpenChange` 为可选受控通道。定位与自动关闭由工具自身接管，故此处不接受
 * `container` / `autoClose` / `position` 覆盖。
 */
export interface ToolPopupProps extends Omit<
  PopupProps,
  | "open"
  | "defaultOpen"
  | "onOpenChange"
  | "autoClose"
  | "autoCloseIgnore"
  | "container"
  | "position"
  | "children"
> {
  /**
   * Popup-layer content (the layer body when `children` is taken).
   *
   * 浮层内容。
   */
  popupContent: ReactNode;

  /**
   * Whether the layer is open (controlled; passing it enables controlled mode).
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
   * Open-state change callback (fires on tool selection, outside click, close
   * button and Escape).
   *
   * 打开态变化回调（选中工具、点击外部、关闭按钮、Escape 均触发）。
   */
  onOpenChange?: (open: boolean) => void;
}

/**
 * Tool definition: pure data props passed declaratively to a tool group (the
 * original uses a class + factory registration and drives active state
 * imperatively; here the active state is controlled by the caller).
 *
 * 工具定义：以声明式纯数据 props 传入工具组（原版为类 + 工厂注册、命令式
 * 驱动激活态；本工程的激活态由调用方受控）。
 */
export interface ToolProps {
  /**
   * Symbol name; contributes the `oo-ui-tool-name-{name}` class (a path form like
   * `'a/b/c'` takes its first two segments, e.g. `'oo-ui-tool-name-a-b'`).
   *
   * 符号名，生成 `oo-ui-tool-name-{name}` 类（路径形式取前两段）。
   */
  name: string;

  /**
   * Visible text of the tool (rendered into the `oo-ui-tool-title` slot). In Bar
   * groups it is hidden by default (icon only) and shown when `displayBothIconAndLabel`
   * is set or there is no icon; List / Menu groups always show it.
   *
   * 工具可见文本（渲染进 `oo-ui-tool-title` 槽位）。Bar 组缺省仅显示图标，
   * `displayBothIconAndLabel` 或无图标时才显示本文本；List / Menu 组恒显示。
   */
  label?: ReactNode;

  /**
   * Tooltip (always a tooltip, never visible text). Bar groups append it to the
   * link's native `title`; List / Menu groups do not.
   *
   * 工具 tooltip（恒为 tooltip、不作可见文本）。Bar 组把它拼进链接的 title
   * 属性；List / Menu 组不拼。
   */
  title?: string;

  /**
   * Accelerator text shown in the tool's accel slot; Bar groups also append it to
   * the tooltip.
   *
   * 快捷键提示文案，渲染在工具的 accel 槽位；Bar 组另拼入 tooltip。
   */
  accelerator?: string;

  /**
   * Tool icon.
   *
   * 工具图标。
   */
  icon?: string;

  /**
   * Narrow-mode overrides: when the toolbar is narrow, the **defined** keys replace
   * the tool's `displayBothIconAndLabel` / visible text (label) / `icon`; restored
   * on leaving narrow mode.
   *
   * 窄栏配置：工具栏处于窄栏时以其**已定义**字段替换工具的
   * `displayBothIconAndLabel` / 可见文本（label）/ `icon`，退出窄栏还原。
   */
  narrowConfig?: {
    displayBothIconAndLabel?: boolean;
    label?: ReactNode;
    icon?: string;
  };

  /**
   * Show both icon and label in Bar groups (default: icon only, or label only when
   * there is no icon).
   *
   * Bar 组中同时展示图标与标签（默认仅图标，无图标时仅标签）。
   */
  displayBothIconAndLabel?: boolean;

  /**
   * Whether the tool is disabled.
   *
   * 是否禁用。
   */
  disabled?: boolean;

  /**
   * Whether the tool is active (controlled; Menu groups compose the handle label
   * from the active tool; each group shows the pressed look).
   *
   * 是否激活（受控；Menu 组按 active 工具合成组标签，各组展示按压选中态样式）。
   */
  active?: boolean;

  /**
   * Selection callback (fires on click or keyboard Enter / Space).
   *
   * 选择回调（点击或键盘 Enter / 空格触发）。
   */
  onSelect?: () => void;

  /**
   * Popup layer (aligning with the original `PopupTool`): when present, the tool
   * becomes a popup tool whose layer toggles on selection; the tool stays active
   * while the layer is shown. `onSelect` still fires on selection.
   *
   * 弹出浮层（对齐原版 `PopupTool`）：存在时该工具为弹出工具，选中即开合浮层，
   * 浮层显隐期间工具呈激活态。`onSelect` 仍在选中时触发。
   */
  popup?: ToolPopupProps;

  /**
   * Nested tool group (aligning with the original `ToolGroupTool`): the tool slot
   * renders this group instead of the tool link — the handle and panel come from
   * the nested group, which also owns selection and active state, so
   * `title` / `icon` / `active` / `onSelect` do not apply to this tool. Give a
   * group element that carries `tools`; when both `popup` and `group` are given,
   * `group` wins.
   *
   * 内嵌工具组（对齐原版 `ToolGroupTool`）：工具位渲染为该工具组而非工具链接——
   * 把手与面板由内嵌组提供，选中与激活态也由其处理，故 `title` / `icon` /
   * `active` / `onSelect` 对本工具不生效。须传入带 `tools` 的工具组元素；与
   * `popup` 同时给出时本项优先。
   */
  group?: ReactElement<ToolGroupBaseProps>;
}

/** 路径形式符号名的类名转换（'a/b/c'→'oo-ui-tool-name-a-b'） */
export const getToolNameClassName = (name: string): string =>
  `oo-ui-tool-name-${name.replace(/^([^/]+)\/([^/]+).*$/, "$1-$2")}`;

/**
 * 全部工具禁用时组自动禁用，驱动组容器的disabled-tools类。
 * 空组同样判为禁用——对齐原版`updateDisabled`（items为空时循环不执行，allDisabled保持true），
 * 空组另有`oo-ui-toolGroup-empty`整体隐藏（见各工具组）
 */
export const isGroupAutoDisabled = (tools: ToolProps[], disabled?: boolean): boolean =>
  !!disabled || tools.every((tool) => tool.disabled);

export interface ToolViewProps {
  tool: ToolProps;

  /** 鼠标/键盘按压中（由组级按压流驱动） */
  pressed?: boolean;

  /** 是否以tooltip形式展示标题（原版static.titleTooltips：Bar组为true，其余为false） */
  tooltip?: boolean;

  /** 是否把快捷键文案拼入tooltip（原版static.accelTooltips：Bar组为true，其余为false） */
  accelTooltip?: boolean;

  /** 组级禁用（组disabled或全部工具禁用）下发到链接：不可Tab聚焦且aria-disabled */
  groupDisabled?: boolean;
}

/**
 * 弹出工具的浮层（对齐原版PopupTool的PopupElement）：锚定并忽略工具元素自身
 * （原版`$floatableContainer`/`$autoCloseIgnore`均为`this.$element`），故点击工具只触发
 * 开合、不触发自动关闭；方位按工具栏位置取below/above（原版构造期按toolbar.position设置）
 */
function ToolPopupView({
  config,
  anchorRef,
  open,
  setOpen,
  position,
  narrow,
}: {
  /** 浮层配置 */
  config: ToolPopupProps;
  /** 工具根元素（浮层的定位锚点与自动关闭忽略目标） */
  anchorRef: RefObject<HTMLSpanElement | null>;
  /** 当前打开态 */
  open: boolean;
  /** 切换打开态 */
  setOpen: (next: boolean | ((prev: boolean) => boolean)) => void;
  /** 工具栏位置 */
  position: "top" | "bottom";
  /** 工具栏窄栏态（浮层内容里的窄栏后代选择器须由本浮层承接，见下方className） */
  narrow: boolean;
}) {
  const {
    popupContent,
    // 受控三项由ToolView消费（驱动工具激活态），不透传给Popup
    open: _open,
    defaultOpen: _defaultOpen,
    onOpenChange: _onOpenChange,
    autoFlip,
    className,
    ...popupProps
  } = config;
  return (
    <Popup
      {...popupProps}
      // 窄栏载体：原版浮层挂在$popups（带oo-ui-toolbar-narrow）内，本工程portal出工具栏子树后
      // 失去该祖先，故把窄栏类落在浮层根上，使浮层内容里的窄栏后代选择器同样命中
      className={clsx(
        "oo-ui-popupTool-popup",
        narrow && "oo-ui-toolbar-narrow",
        className,
      )}
      open={open}
      container={anchorRef}
      autoClose
      autoCloseIgnore={anchorRef}
      // 对齐原版构造期的setAutoFlip(false)：工具栏内浮层不随空间翻转
      autoFlip={autoFlip ?? false}
      position={position === "bottom" ? "above" : "below"}
      onOpenChange={setOpen}
    >
      {popupContent}
    </Popup>
  );
}

/**
 * 应用窄栏配置（对齐原版`Tool.onToolbarResize`/`PopupToolGroup.onToolbarResize`）：窄栏时
 * 以`narrowConfig`里**已定义**的字段覆盖`base`的同名字段，退出窄栏即还原。
 * 工具（displayBothIconAndLabel/label/icon）与弹出工具组的把手（invisibleLabel/label/icon）
 * 共用本函数，两者的窄栏字段集不同故经泛型由调用方给出字段基对象
 * @param base 宽栏态的基础对象（工具自身的props，或把手字段的局部对象）
 * @param narrowConfig 窄栏配置，键为base字段的子集
 * @param narrow 是否处于窄栏
 */
export function applyNarrowConfig<T extends object>(
  base: T,
  narrowConfig: Partial<T> | undefined,
  narrow: boolean,
): T {
  const config = narrow ? narrowConfig : undefined;
  if (!config) {
    return base;
  }
  // 未定义的字段不参与覆盖：窄栏配置是部分覆盖，留空即沿用宽栏值
  return { ...base, ...omitBy(config, (value) => value === undefined) };
}

/** 工具渲染，对齐原版Tool的DOM：span.oo-ui-tool > a.oo-ui-tool-link > checkIcon+icon+title+accel */
export function ToolView({
  tool,
  pressed = false,
  tooltip = false,
  accelTooltip = false,
  groupDisabled,
}: ToolViewProps) {
  const linkDisabled = !!tool.disabled || !!groupDisabled;
  const narrow = useToolbarNarrow();
  // 窄栏配置：窄栏时替换icon/label/displayBothIconAndLabel（对齐原版Tool.onToolbarResize）
  const effective = applyNarrowConfig(tool, tool.narrowConfig, narrow);
  // tooltip按原版Tool.updateTitle拼接：title与快捷键各由对应开关放行、空串不入列，
  // 两者都不入时移除title属性（title恒为tooltip源，可见文本走children、不参与此处）
  const tooltipParts = [
    tooltip ? effective.title : undefined,
    accelTooltip ? effective.accelerator : undefined,
  ].filter((part): part is string => typeof part === "string" && part.length > 0);
  // 工具根元素：弹出工具的浮层锚点与自动关闭忽略目标（见ToolPopupView）
  const anchorRef = useRef<HTMLSpanElement>(null);
  const { value: popupOpen, commit: setPopupOpen } = useControlledValue<boolean>(
    { value: tool.popup?.open, defaultValue: tool.popup?.defaultOpen ?? false },
    (next) => tool.popup?.onOpenChange?.(next),
  );
  const position = useToolbarPosition();

  // 内嵌工具组（ToolGroupTool）：工具位不渲染链接，把手与面板由内嵌工具组自行提供。
  // 内嵌组的禁用态取"内嵌组自身disabled或组内工具全禁用"与"工具自身+外层组禁用"的或，
  // 对齐原版onToolGroupDisable：内嵌组的disable事件回写到工具位（工具随内嵌组呈现禁用）；
  // 该同步是单向的——工具自身的disabled不下发给内嵌组，需在内嵌组的元素上自行声明
  if (tool.group) {
    // 元素props为any（JSX元素类型不约束具体工具组），未给tools的元素兜底空集
    const nestedTools: ToolProps[] = tool.group.props.tools ?? [];
    const nestedDisabled = isGroupAutoDisabled(
      nestedTools,
      tool.group.props.disabled || tool.disabled || groupDisabled,
    );
    return (
      <span
        className={clsx(
          getWidgetClassName({ disabled: nestedDisabled }),
          "oo-ui-tool",
          "oo-ui-toolGroupTool",
          getToolNameClassName(tool.name),
        )}
        aria-disabled={nestedDisabled || undefined}
      >
        {tool.group}
      </span>
    );
  }

  const classes = clsx(
    getWidgetClassName({ disabled: tool.disabled, icon: effective.icon }),
    "oo-ui-tool",
    getToolNameClassName(tool.name),
    effective.icon && "oo-ui-tool-with-icon",
    hasLabel(effective.label) &&
      effective.displayBothIconAndLabel &&
      "oo-ui-tool-with-label",
    // 浮层开启期间工具呈激活态（对齐原版onPopupToggle的setActive）
    (pressed || tool.active || (!!tool.popup && popupOpen)) && "oo-ui-tool-active",
    tool.popup && "oo-ui-popupTool",
  );

  return (
    <span className={classes} aria-disabled={tool.disabled || undefined} ref={anchorRef}>
      <a
        className="oo-ui-tool-link"
        role="button"
        tabIndex={linkDisabled ? -1 : 0}
        aria-disabled={linkDisabled || undefined}
        title={tooltipParts.length > 0 ? tooltipParts.join(" ") : undefined}
        data-tool-name={tool.name}
        // 弹出工具的开合走工具自身的点击/按键：原版onSelect即popup.toggle()，
        // 而本工程的onSelect是调用方回调，按压流不会把它转成浮层显隐
        onClick={() => {
          if (tool.popup && !linkDisabled) {
            setPopupOpen((prev) => !prev);
          }
        }}
        onKeyUp={(e) => {
          if (tool.popup && !linkDisabled && isActivationKey(e.key)) {
            setPopupOpen((prev) => !prev);
          }
        }}
      >
        {/* checkIcon为完整IconWidget（对齐原版），工具图标为IconElement裸span */}
        <Icon icon="check" className="oo-ui-tool-checkIcon" />
        <IconBase icon={effective.icon} />
        <span className="oo-ui-tool-title">{effective.label}</span>
        {/* 快捷键文案槽位：对齐原版$accel（文案由宿主经ToolProps.accelerator给出，
          对应原版Toolbar.getToolAccelerator钩子；lang/dir按原版固定） */}
        <span className="oo-ui-tool-accel" dir="ltr" lang="en">
          {effective.accelerator}
        </span>
      </a>
      {tool.popup && (
        <ToolPopupView
          config={tool.popup}
          anchorRef={anchorRef}
          open={popupOpen}
          setOpen={setPopupOpen}
          position={position}
          narrow={narrow}
        />
      )}
    </span>
  );
}

/**
 * 组级按压流，对齐原版ToolGroup.onMouseKeyDown/onDocumentMouseKeyUp：
 * 左键在可用工具上按下进入按压态（oo-ui-tool-active），松开仍落在发起工具上时触发onSelect；
 * 工具链接的keydown/keyup（Enter/空格）同流程。按压流的进入/复位/document级监听由
 * usePressedState统一承担，本hook仅补充工具组的按压目标解析与视觉抑制
 */
export function useToolGroupPressed(tools: ToolProps[], disabled?: boolean) {
  // 工具集经ref读取最新：mousedown→mouseup期间props更新（active/onSelect变化）后
  // 仍取新值，对齐原版经实例属性（this.pressed等）的活引用，避免闭包捕获渲染时的过期tools
  const toolsRef = useLatestRef(tools);
  // 按压视觉是否已被指针/焦点移出抑制（对齐原版onMouseOutBlur：仅清除视觉，不结束按压流，
  // 移回同一工具或在其上松开仍会触发选择）
  const [pressedBlurred, setPressedBlurred] = useState(false);

  /** 从事件目标解析工具符号名（经`[data-tool-name]`就近向上匹配） */
  const findToolName = (node: EventTarget | null): string | null => {
    if (!(node instanceof Element)) {
      return null;
    }
    const link = node.closest("[data-tool-name]");
    return link?.getAttribute("data-tool-name") ?? null;
  };

  const { pressedTarget, onMouseDown, onKeyDown } = usePressedState<string>({
    disabled,
    resolveTarget: findToolName,
    canPress: (name) => {
      const tool = toolsRef.current.find((item) => item.name === name);
      return !!tool && !tool.disabled;
    },
    onTrigger: (name) => {
      toolsRef.current.find((item) => item.name === name)?.onSelect?.();
    },
    // 对齐原版onMouseKeyDown返回false：阻止默认（拖动选中文本/焦点转移）
    preventDefaultOnPress: true,
  });

  /**
   * 指针/焦点进出工具时切换按压视觉（对齐原版onMouseOverFocus/onMouseOutBlur）：
   * 仅作用于当前按压中的工具，`over`为进入与否
   */
  const onToolHoverChange = (node: EventTarget | null, over: boolean) => {
    const name = findToolName(node);
    if (name && name === pressedTarget) {
      setPressedBlurred(!over);
    }
  };

  // 按压开始时清除上一次按压流残留的视觉抑制；按压被拒绝（非工具/禁用工具）时清除无副作用
  // （抑制态仅在按压中可见，此时pressedTarget为null）
  const onMouseKeyDown = (e: ReactMouseEvent<HTMLDivElement>) => {
    setPressedBlurred(false);
    onMouseDown(e);
  };

  const onToolKeyDown = (e: ReactKeyboardEvent<HTMLDivElement>) => {
    setPressedBlurred(false);
    onKeyDown(e);
  };

  // 按压视觉名：被移出抑制时不上报按压态，使组件的pressed类随之清除
  return {
    pressedName: pressedBlurred ? null : pressedTarget,
    onMouseKeyDown,
    onToolKeyDown,
    onToolHoverChange,
  };
}

/**
 * 组容器上委托的指针/焦点进出处理器（对齐原版ToolGroup把focus/blur/mouseover/mouseout
 * 一并绑定在$group上）。经事件委托识别工具，Bar/Popup两组共用
 */
export function getToolHoverHandlers(
  onToolHoverChange: (node: EventTarget | null, over: boolean) => void,
) {
  return {
    onMouseOver: (e: ReactMouseEvent<HTMLDivElement>) =>
      onToolHoverChange(e.target, true),
    onMouseOut: (e: ReactMouseEvent<HTMLDivElement>) =>
      onToolHoverChange(e.target, false),
    onFocus: (e: ReactFocusEvent<HTMLDivElement>) => onToolHoverChange(e.target, true),
    onBlur: (e: ReactFocusEvent<HTMLDivElement>) => onToolHoverChange(e.target, false),
  };
}

/**
 * Shared props of the tool-group containers.
 *
 * 工具组容器的共用参数。
 */
export interface ToolGroupBaseProps extends Omit<
  WidgetProps<HTMLDivElement>,
  "children"
> {
  /**
   * The tools.
   *
   * 工具集。
   */
  tools: ToolProps[];

  /**
   * Group alignment: `before` (default) keeps the group in declaration order on
   * the left; `after` moves it to the right-side actions container.
   *
   * 工具组位置：`before` 按声明顺序排在工具栏左侧，`after` 排到右侧的动作区。
   *
   * @default 'before'
   */
  align?: "before" | "after";
}
