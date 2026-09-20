import {
  forwardRef,
  useRef,
  useState,
  type KeyboardEvent as ReactKeyboardEvent,
} from "react";
import clsx from "clsx";
import { Button, type ButtonProps } from "../Button";
import { MenuSelect, type MenuSelectProps } from "../MenuSelect";
import type { SelectOptionProps } from "../Select";
import { isComposingKeyEvent, type ChangeHandler } from "../../utils";

/**
 * Option type of the command menu (same as `Select`'s).
 *
 * 命令菜单的选项类型（与 `Select` 相同）。
 */
export type ButtonMenuSelectWidgetOptionProps = SelectOptionProps;
import {
  createMenuOptionTextLookup,
  useCleanId,
  useControlledValue,
  useMenuPopup,
  useMergedRefs,
  useSelectableValues,
} from "../../hooks";

export interface ButtonMenuSelectWidgetProps extends Omit<ButtonProps, "onClick"> {
  /**
   * Menu option set (**required**).
   *
   * 菜单选项集（**必填**）
   */
  options: SelectOptionProps[];

  /**
   * Whether the menu is open (controlled)
   *
   * 菜单是否打开（受控）
   */
  open?: boolean;

  /**
   * Initial open state for uncontrolled use
   *
   * 非受控初始打开态
   */
  defaultOpen?: boolean;

  /**
   * Menu open-state callback
   *
   * 菜单开合回调
   */
  onOpenChange?: (open: boolean) => void;

  /**
   * Click callback (fires before the menu is toggled)
   *
   * 点击回调（在切换菜单开合前触发）
   */
  onClick?: ButtonProps["onClick"];

  /**
   * Choose callback; the menu is a **command menu** — every choice fires it and the
   * menu then closes.
   *
   * 选定回调（对齐原版 `choose` 事件）。菜单是**命令菜单**：每次选定都回调，选定后菜单收起
   */
  onChoose?: ChangeHandler<string | number>;

  /**
   * Whether to clear the menu's selection after choosing (default `true`): `true`
   * makes it a pure command menu with no lingering selected look; `false` keeps the
   * last chosen item selected.
   *
   * 选定后是否清除菜单选中态（缺省 true）：置 true 时菜单为纯命令菜单，选过的项不留
   * 选中态；置 false 时保留最后选定项
   */
  clearOnSelect?: boolean;

  /**
   * Gap between menu and button (px)
   *
   * 菜单与按钮的间距（px）
   */
  menuSpacing?: number;

  /**
   * Menu prop overrides (`open` / `container` / `options` / `onChoose` / `id` /
   * `spacing` / `clearOnChoose` / `value` / `highlightedValue` /
   * `onHighlightedChange` are taken over by this component; `focusOwnerRef` is
   * anchored to this component's button anchor and not exposed).
   *
   * 菜单属性覆盖（`open`/`container`/`options`/`onChoose`/`id`/`spacing`/`clearOnChoose`/
   * `matchAnchorWidth`/`value`/`highlightedValue`/`onHighlightedChange` 由本组件接管；
   * `focusOwnerRef` 锚定本组件按钮锚点、不外放）
   */
  menuProps?: Omit<
    MenuSelectProps,
    | "open"
    | "container"
    | "options"
    | "onChoose"
    | "id"
    | "spacing"
    | "clearOnChoose"
    | "matchAnchorWidth"
    | "value"
    | "highlightedValue"
    | "onHighlightedChange"
    | "focusOwnerRef"
  >;
}

// 实现说明：对齐原版OO.ui.ButtonMenuSelectWidget——按钮（真Button，Tab停靠点）触发菜单，
// 菜单经MenuSelect浮动于按钮下方（间距4px）。焦点始终在按钮上，菜单不是Tab停靠点；
// 菜单id与按钮锚点互相关联（haspopup/expanded/owns/activedescendant落在锚点）；
// 菜单打开期间按钮呈按压态（对齐原版onMenuToggle）
/**
 * A button-triggered command menu: choosing an item runs it and closes the menu.
 * Unlike a Dropdown that tracks a "current selection", it suits toolbar-style
 * "click to run a command" cases.
 *
 * 按钮触发的命令菜单：选定即执行并收起菜单。与 Dropdown 记“当前选中项”不同，
 * 适合工具栏里“点了就执行一项命令”的场景。
 *
 * @see https://bearbin1215.github.io/ooui-react/components/button-menu-select/index.html
 */
export const ButtonMenuSelectWidget = forwardRef<
  HTMLSpanElement,
  ButtonMenuSelectWidgetProps
>(
  (
    {
      anchorProps,
      children,
      className,
      clearOnSelect = true,
      defaultOpen = false,
      disabled,
      menuProps,
      menuSpacing = 4,
      onChoose,
      onClick,
      onKeyDown,
      onKeyUp,
      onOpenChange,
      open: openProp,
      options,
      ...buttonRest
    },
    ref,
  ) => {
    const buttonRef = useRef<HTMLSpanElement | null>(null);
    const anchorRef = useRef<HTMLAnchorElement | null>(null);
    const menuRef = useRef<HTMLDivElement | null>(null);
    const mergedButtonRef = useMergedRefs(buttonRef, ref);
    // 菜单id供锚点的aria-owns关联（对应原版menu.getElementId）
    const menuId = useCleanId();
    const { value: open, commit: setOpen } = useControlledValue<boolean>(
      { value: openProp, defaultValue: defaultOpen },
      onOpenChange,
    );
    const { values: selectableValues } = useSelectableValues(options);
    // clearOnSelect为false时保留的"粘性"选中值（对齐原版不调selectItem的语义）；
    // clearOnSelect为true时恒空——选中态由菜单的clearOnChoose通道清零
    const [stickyValue, setStickyValue] = useState<string | number | undefined>(
      undefined,
    );
    /**
     * 键盘手势标记：跳过Button的keypress激活通道（handleKeyPress对Enter/空格模拟click）
     * 对同一次手势的重复切换。两类来源：
     * 1. keydown已消费Enter/空格——多数浏览器会因keydown的preventDefault抑制keypress
     * （Chromium实测确认：preventDefault后keypress计数为0），此路径为跨浏览器防御；
     * 2. 前缀缓冲活跃时的空格——刻意不preventDefault（否则空格进不了前缀缓冲），
     * 故必须靠本标记挡掉模拟click（见handleKeyDown的SPACE分支）。
     * keyup即手势结束，据此复位（不会卡死鼠标点击）
     */
    const keyboardGestureRef = useRef(false);

    /**
     * 选定选项：先回调命令，再按clearOnSelect决定是否保留选中态，最后收起菜单
     */
    function chooseOption(optionValue: string | number) {
      onChoose?.(optionValue);
      if (!clearOnSelect) {
        setStickyValue(optionValue);
      }
      setOpen(false);
    }

    // 菜单开合与键盘高亮：导航起点为高亮项、无高亮回退选中项（原版currentItem），
    // 端点钳制不环绕（原版MenuSelectWidget static.listWrapsAround=false），
    // 开启时点击外部/Escape关闭（Escape捕获阶段，嵌套于Dialog时不误关弹窗）；
    // 前缀跳转经getItemText启用（原版无$input的菜单在document监听keypress）
    const {
      highlightedValue,
      setHighlightedValue,
      navigationValue,
      handleNavigationKey,
      consumeNavigationKey,
      hasTypeAheadBuffer,
    } = useMenuPopup<string | number>({
      open,
      onClose: () => setOpen(false),
      values: selectableValues,
      // 菜单portal出控件子树：点击外部关闭须连同按钮与菜单一起排除
      ignore: [buttonRef, menuRef],
      selectedValue: stickyValue,
      onChoose: chooseOption,
      getItemText: createMenuOptionTextLookup(options, menuRef),
    });

    /**
     * 按钮键盘：收起时Enter/空格展开，展开后↑↓移动高亮、Enter/空格选定、
     * 无导航目标（空菜单或无可选项）时收起（原版此刻按键不被菜单键盘通道消费、
     * 落回Button的keypress激活通道模拟click开合菜单），←→/Home/End/翻页/Tab由
     * consumeNavigationKey统一消费。
     * 空格另带前缀缓冲守卫（本组件启用前缀跳转，空格可能是多词选项标签的一部分），
     * 与Dropdown同口径——见dev-docs/DEVIATIONS.md「增强」
     */
    const handleKeyDown = (event: ReactKeyboardEvent<HTMLSpanElement>) => {
      onKeyDown?.(event);
      if (disabled) {
        return;
      }
      // IME合成期按键（确认候选的Enter、选词的方向键）不驱动开合与选定
      if (isComposingKeyEvent(event)) {
        return;
      }
      switch (event.key) {
        case "Enter":
        case " ":
          // 前缀缓冲活跃时空格属于type-to-search、不做开合（对齐原版DropdownWidget.onKeyDown
          // SPACE分支的守卫，Dropdown同此）。此时**不能**preventDefault——那会抑制随后的
          // keypress、空格就进不了前缀缓冲；改用手势标记挡掉Button的keypress激活通道
          // （该通道对Enter/空格模拟click，见下方onClick）
          if (event.key === " " && hasTypeAheadBuffer()) {
            keyboardGestureRef.current = true;
            break;
          }
          event.preventDefault();
          if (!open) {
            keyboardGestureRef.current = true;
            setOpen(true);
          } else if (navigationValue !== undefined) {
            // 选定导航起点（高亮项，无高亮时选中项；对齐原版chooseItem(currentItem)）
            keyboardGestureRef.current = true;
            chooseOption(navigationValue);
          } else {
            // 展开态无导航目标时收起：原版此刻事件不被菜单键盘通道消费（currentItem不存在，
            // SelectWidget.onDocumentKeyDown，oojs-ui.js:7525-7531），落回Button的keypress
            // 激活通道模拟click开合（ButtonElement.onKeyPress，oojs-ui.js:2462-2468→
            // ButtonMenuSelectWidget.onButtonMenuClick，oojs-ui.js:18747-18749）；本工程在
            // keydown分支直接收起，同样置位手势标记挡掉随后的模拟click（防菜单收而复开）
            keyboardGestureRef.current = true;
            setOpen(false);
          }
          break;
        case "ArrowDown":
        case "ArrowUp":
          // 方向键仅展开后移动高亮；收起态不拦截、不展开（对齐原版：ButtonWidget无方向键处理、
          // 菜单键盘监听展开期才绑定，故收起态↑/↓交回默认行为）。这与Dropdown收起态经
          // screenReaderMode直接改选不同——两者各自的收起态键盘语义都照抄原版对应类，见DEVIATIONS
          if (open) {
            event.preventDefault();
            handleNavigationKey(event.key);
          }
          break;
        default:
          // 余下菜单键位（←→/Home/End/PageUp/PageDown/Tab）仅展开时消费：
          // 导航与Tab提交语义由consumeNavigationKey对齐原版MenuSelectWidget
          consumeNavigationKey(event);
      }
    };

    return (
      <>
        <Button
          {...buttonRest}
          ref={mergedButtonRef}
          anchorRef={anchorRef}
          disabled={disabled}
          className={clsx(className, "oo-ui-buttonMenuSelectWidget")}
          // 菜单打开期间按钮呈按压态（对齐原版onMenuToggle对根元素的pressed类切换），
          // 经Button的受控pressed输出
          pressed={open}
          anchorProps={{
            ...anchorProps,
            "aria-haspopup": "true",
            "aria-expanded": open,
            // 展开时声明所拥有的菜单（收起即移除，对齐原版MenuSelectWidget.onToggle
            // 对$focusOwner的attr/removeAttr）
            "aria-owns": open ? menuId : undefined,
          }}
          onClick={(event) => {
            onClick?.(event);
            // 键盘手势内跳过：keydown已消费的Enter/空格，其keypress激活通道不再重复切换
            if (keyboardGestureRef.current) {
              keyboardGestureRef.current = false;
              return;
            }
            setOpen((prev) => !prev);
          }}
          onKeyDown={handleKeyDown}
          onKeyUp={(event) => {
            keyboardGestureRef.current = false;
            onKeyUp?.(event);
          }}
        >
          {children}
        </Button>
        <MenuSelect
          {...menuProps}
          ref={menuRef}
          id={menuId}
          open={open}
          spacing={menuSpacing}
          container={buttonRef}
          options={options}
          // 原版floatable菜单不设width：宽度随内容自适应，不与按钮同宽（Dropdown的
          // 贴输入框宽语义不适用于按钮形态）
          matchAnchorWidth={false}
          // clearOnSelect时选中态由clearOnChoose清零（菜单内从不出现选中态），stickyValue恒空
          value={stickyValue}
          clearOnChoose={clearOnSelect}
          highlightedValue={highlightedValue}
          onHighlightedChange={setHighlightedValue}
          onChoose={chooseOption}
          // 高亮项的aria-activedescendant落在按钮锚点上（对齐原版setFocusOwner(widget.$tabIndexed)）
          focusOwnerRef={anchorRef}
        />
      </>
    );
  },
);

ButtonMenuSelectWidget.displayName = "ButtonMenuSelectWidget";
