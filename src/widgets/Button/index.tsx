import {
  forwardRef,
  type HTMLAttributes,
  type KeyboardEventHandler,
  type KeyboardEvent,
  type MouseEvent,
  type ReactNode,
  type Ref,
} from "react";
import clsx from "clsx";
import {
  buttonElementClasses,
  getButtonIconClasses,
  getWidgetClassName,
  mergeAriaLabelledBy,
  resolveTabIndex,
  resolveTitle,
  toFlagArray,
} from "../../mixins";
import { useAccessKeyLabel } from "../../config";
import { useFieldAccessKey, useFieldLabelFocus, usePressedState } from "../../hooks";
import { useButtonGroupDisabled } from "../ButtonGroup/context";
import { isActivationKey } from "../../utils";
import type {
  AccessKeyedElement,
  ButtonFlag,
  IconElement,
  IndicatorElement,
} from "../../Element";
import type { WidgetProps } from "../Widget";
import type { IconBaseProps } from "../Icon/Base";
import type { IndicatorBaseProps } from "../Indicator/Base";
import { ButtonSlots } from "./slots";

/**
 * The event passed to a button's click handler: a MouseEvent for pointer
 * clicks, or a KeyboardEvent when fired by Enter / Space.
 *
 * 按钮点击回调接收的事件：鼠标点击为 MouseEvent，Enter / 空格触发时为 KeyboardEvent。
 */
export type ButtonClickEvent =
  | MouseEvent<HTMLSpanElement>
  | KeyboardEvent<HTMLSpanElement>;

/**
 * Props for the button. Undeclared props are passed through to the root `<span>`;
 * the inner `<a>` is reached through `anchorProps` / `anchorRef`.
 *
 * 按钮属性：未声明的属性透传到根 `<span>`，内部 `<a>` 走 `anchorProps` / `anchorRef`。
 */
export interface ButtonProps
  extends
    Omit<WidgetProps<HTMLSpanElement>, "onClick" | "rel">,
    AccessKeyedElement,
    IconElement,
    IndicatorElement {
  /**
   * Whether the button is in the active state.
   *
   * 是否为激活状态
   */
  active?: boolean;

  /**
   * Whether it has a border.
   *
   * 是否带边框。
   */
  framed?: boolean;

  /**
   * Label visually hidden but kept as the accessible name.
   *
   * 标签视觉隐藏（保留可访问名称）
   */
  invisibleLabel?: boolean;

  /**
   * Extra flags (color and button-specific form).
   *
   * 附加标志（色彩与按钮专属形态）
   */
  flags?: ButtonFlag | ButtonFlag[];

  /**
   * Link target, written on the inner `<a>`.
   *
   * 链接地址（写在内部 `<a>` 上）
   *
   * **Security**: this component does not sanitize `href` (bypassing the original
   * `OO.ui.isSafeUrl` allowlist) and React does not block dangerous schemes such as
   * `javascript:` at runtime either — validate the protocol yourself for untrusted
   * values, or use the exported `sanitizeUrl`.
   *
   * **安全**：本组件不净化 `href`（越过原版 `OO.ui.isSafeUrl` 的协议白名单），React 运行期
   * 也不拦截 `javascript:` 一类危险协议，故来源不可信的 `href` 须由调用方先校验协议，
   * 否则构成 XSS；需要组件层净化时用导出的 `sanitizeUrl`。
   */
  href?: string;

  /**
   * Where the link opens
   *
   * 链接打开位置
   */
  target?: string;

  /**
   * The inner `<a>`'s `rel`; an array is joined by spaces.
   *
   * 内部 `<a>` 的 `rel`（数组以空格拼接）
   */
  rel?: string | string[];

  /**
   * Tooltip text for the inner `<a>`
   *
   * 内部 `<a>` 的提示文本
   */
  title?: string;

  /**
   * Extra props for the icon element (forwarded through ButtonSlots).
   *
   * 图标元素的附加属性（经 ButtonSlots 透传）
   */
  iconProps?: Omit<IconBaseProps, "icon">;

  /**
   * Extra props for the indicator element (forwarded through ButtonSlots).
   *
   * 指示器元素的附加属性（经 ButtonSlots 透传）
   */
  indicatorProps?: Omit<IndicatorBaseProps, "indicator">;

  /**
   * Controlled pressed state, OR-ed with the internal press flow.
   *
   * 受控按压态（与内部按压流取或）
   */
  pressed?: boolean;

  /**
   * Click handler; also fired by Enter / Space.
   *
   * 点击回调（Enter / 空格同样触发）
   */
  onClick?: (ev: ButtonClickEvent) => void;

  /**
   * Ref to the inner `<a>` element (the component ref points at the outer `<span>`).
   *
   * 内部 `<a>` 元素的引用（组件 ref 指向外层 `span`）
   */
  anchorRef?: Ref<HTMLAnchorElement>;

  /**
   * Extra props for the inner `<a>`; `role`, `tabIndex`, `aria-disabled` etc. are
   * taken over by the component and take priority.
   *
   * 内部 `<a>` 的附加属性；`role`、`tabIndex`、`aria-disabled` 等由组件接管、优先
   */
  anchorProps?: HTMLAttributes<HTMLAnchorElement>;

  /**
   * Internal channel: extra content inside the anchor (rendered after the icon /
   * label / indicator), for placing a native control within the button — the
   * theme CSS selects it as a direct child of the anchor (e.g.
   * SelectFileInputWidget's `<input type="file">` overlay).
   *
   * 内部通道：锚点内的附加内容（渲染在图标 / 标签 / 指示器之后），供需要把
   * 原生控件挂进锚点的场景使用——主题 CSS 以该锚点为直接父元素做选择（如
   * SelectFileInputWidget 的 `<input type="file">` 覆盖层）。
   */
  anchorContent?: ReactNode;
}

/**
 * Button的内部组合形态参数（ToggleButton等Button组合形态经相对路径使用，不进公开导出面）：
 * widgetNames为根元素widget名类链（原版继承链顺序，输出`oo-ui-{name}Widget`）——
 * 原版ToggleButtonWidget继承ToggleWidget而非ButtonWidget，根不应有oo-ui-buttonWidget
 * （主题的按钮行距规则不应命中），组合形态经此对齐继承链
 */
export interface ButtonInternalProps extends ButtonProps {
  /**
   * 根元素widget名类链（内部通道），缺省['button']
   */
  widgetNames?: string[];
}

// 实现说明：对齐原版OO.ui.ButtonWidget/ButtonElement，span内嵌a[role=button]；按压态
// 由JS维护并输出oo-ui-buttonElement-pressed（CSS无键盘按压伪类，见usePressedState）
/**
 * The basic button component, and also the button base for ToggleButton,
 * PopupButton and ButtonMenuSelectWidget.
 *
 * 基础按钮组件，同时也是 ToggleButton、PopupButton、ButtonMenuSelectWidget 等组件的按钮基座。
 *
 * @see https://bearbin1215.github.io/ooui-react/components/button/index.html
 */
export const Button = forwardRef<HTMLSpanElement, ButtonInternalProps>(
  (
    {
      active,
      accessKey,
      anchorContent,
      anchorProps,
      children,
      className,
      disabled,
      framed = true,
      invisibleLabel,
      flags = [],
      href,
      target,
      icon,
      iconProps,
      indicator,
      indicatorProps,
      pressed,
      rel = ["nofollow"],
      title,
      tabIndex,
      widgetNames = ["button"],
      "aria-label": ariaLabel,
      "aria-pressed": ariaPressed,
      "aria-labelledby": ariaLabelledBy,
      anchorRef,
      onClick,
      onMouseDown,
      onMouseUp,
      onKeyDown,
      onKeyPress,
      onKeyUp,
      ...rest
    },
    ref,
  ) => {
    // 组级禁用（ButtonGroup经Context下发）与自身禁用取或
    const groupDisabled = useButtonGroupDisabled();
    const isDisabled = disabled || groupDisabled;
    /**
     * 内部按压态，由JS维护并输出`oo-ui-buttonElement-pressed`类，对齐原版ButtonElement：
     * 键盘为Enter/空格按下与抬起（CSS无法实现键盘按压）；鼠标为左键按下加类，
     * mouseup可能发生在按钮外，通过document级capture监听复位（原版onDocumentMouseUp同款）
     */
    const {
      pressed: internalPressed,
      onMouseDown: pressedMouseDown,
      onMouseUp: pressedMouseUp,
      onKeyDown: pressedKeyDown,
      onKeyUp: pressedKeyUp,
    } = usePressedState<boolean, HTMLSpanElement>({
      disabled: isDisabled,
      onMouseDown,
      onMouseUp,
      onKeyDown,
      onKeyUp,
    });
    // FieldLayout标签联动（通道B）：点击标签聚焦按钮元素（对齐原版TabIndexedElement.simulateLabelClick
    // 基线focus()，禁用时不聚焦）
    const { setRef: setAnchorRef, fieldLabelId } = useFieldLabelFocus<HTMLAnchorElement>({
      ref: anchorRef,
      disabled: isDisabled,
    });
    const flagList = toFlagArray(flags);
    const relList = typeof rel === "string" ? [rel] : rel;
    const iconClasses = getButtonIconClasses({
      framed,
      active,
      disabled: isDisabled,
      flags: flagList,
    });
    // title/accessKey同落锚点（原版$titled=$accessKeyed=$button，解析见resolveTitle）；
    // 快捷键文案由宿主解析（未提供时title附原键值）
    const accessKeyLabel = useAccessKeyLabel(accessKey);
    // 快捷键登记给FieldLayout（原版FieldLayout的label tooltip委托字段控件的accessKey）
    useFieldAccessKey(accessKey);
    const resolvedTitle = resolveTitle({
      title,
      label: children,
      invisibleLabel,
      accessKey,
      accessKeyLabel,
    });

    const classes = clsx(
      className,
      getWidgetClassName(
        {
          disabled: isDisabled,
          icon,
          label: children,
          invisibleLabel,
          indicator,
        },
        ...widgetNames,
      ),
      buttonElementClasses({
        framed,
        active,
        disabled: isDisabled,
        pressed: pressed || internalPressed,
        flags: flagList,
      }),
    );

    const handleClick: ButtonProps["onClick"] = (ev) => {
      if (!isDisabled && onClick) {
        onClick(ev);
      }
    };

    /**
     * 对齐原版onKeyPress：Enter/空格触发click，存在click监听时阻止默认行为（空格滚动页面）
     */
    const handleKeyPress: KeyboardEventHandler<HTMLSpanElement> = (ev) => {
      if (!isDisabled && isActivationKey(ev.key)) {
        if (onClick) {
          ev.preventDefault();
        }
        handleClick(ev);
      }
      if (onKeyPress) {
        onKeyPress(ev);
      }
    };

    return (
      <span
        {...rest}
        ref={ref}
        className={classes}
        onClick={handleClick}
        onMouseDown={pressedMouseDown}
        onMouseUp={pressedMouseUp}
        onKeyDown={pressedKeyDown}
        onKeyPress={handleKeyPress}
        onKeyUp={pressedKeyUp}
        aria-disabled={isDisabled || undefined}
      >
        <a
          {...anchorProps}
          className="oo-ui-buttonElement-button"
          role="button"
          ref={setAnchorRef}
          tabIndex={resolveTabIndex(tabIndex, isDisabled)}
          // aria-disabled落在锚点上：原版TabIndexedElement.updateTabIndex写在$tabIndexed
          // （ChromeVox/NVDA不继承父元素的aria-disabled，放外层span会读不到）
          aria-disabled={isDisabled || undefined}
          href={isDisabled ? undefined : href}
          target={target}
          rel={relList.join(" ") || undefined}
          title={resolvedTitle}
          accessKey={accessKey}
          // aria-label/aria-pressed/aria-labelledby须落在可聚焦的<a>上（外层span为generic
          // 元素不可命名）：aria-label供显式命名，aria-pressed供ToggleButton等开关形态，
          // aria-labelledby供FieldLayout标签联动与调用方命名（原版$tabIndexed=$button）
          aria-label={ariaLabel}
          aria-pressed={ariaPressed}
          aria-labelledby={mergeAriaLabelledBy(fieldLabelId, ariaLabelledBy)}
        >
          <ButtonSlots
            icon={icon}
            iconProps={iconProps}
            variantClasses={iconClasses}
            label={children}
            labelInvisible={invisibleLabel}
            indicator={indicator}
            indicatorProps={indicatorProps}
            trailing={anchorContent}
          />
        </a>
      </span>
    );
  },
);

Button.displayName = "Button";
