import {
  useState,
  useRef,
  forwardRef,
  type KeyboardEvent as ReactKeyboardEvent,
} from "react";
import clsx from "clsx";
import { IconBase } from "../Icon/Base";
import { IndicatorBase } from "../Indicator/Base";
import { LabelBase } from "../Label/Base";
import { getWidgetClassName, mergeAriaLabelledBy, resolveTabIndex } from "../../mixins";
import { isComposingKeyEvent, type ChangeHandler } from "../../utils";
import {
  createMenuOptionTextLookup,
  useCleanId,
  useControlledValue,
  useFieldLabelFocus,
  useMenuPopup,
  useSelectableValues,
} from "../../hooks";
import type { WidgetProps } from "../Widget";
import type { AccessKeyedElement, IconElement, LabelElement } from "../../Element";
import type { SelectOptionProps } from "../Select";
import { MenuSelect } from "../MenuSelect";

/**
 * Option type of the dropdown (same shape as Select's).
 *
 * 下拉选择的选项类型（与 Select 的选项同形）。
 */
export type DropdownOptionProps = SelectOptionProps;

export interface DropdownProps
  // 显示文本取自label或选中项，children无渲染落点（handle与菜单为固定结构），故屏蔽
  extends
    Omit<WidgetProps<HTMLDivElement>, "children">,
    AccessKeyedElement,
    IconElement,
    LabelElement {
  /**
   * The option set
   *
   * 选项集
   */
  options: DropdownOptionProps[];

  /**
   * Current selected value (controlled; passing it enables controlled mode)
   *
   * 当前选中值（受控，传入即受控模式）
   */
  value?: string | number;

  /**
   * Initial selected value for uncontrolled use
   *
   * 非受控初始选中值
   */
  defaultValue?: string | number;

  /**
   * Selected-value change callback (fires when the value changes).
   *
   * 选中值变更回调（值变化时触发）。
   */
  onChange?: ChangeHandler<string | number>;
}

// 实现说明：对齐原版OO.ui.DropdownWidget——handle承载combobox语义（不可编辑、
// aria-autocomplete=list），键盘通道在聚焦期即接管（screenReaderMode），
// 菜单经MenuSelect portal出控件子树
/**
 * A dropdown select.
 *
 * 下拉选择框。
 *
 * @see https://bearbin1215.github.io/ooui-react/components/dropdown/index.html
 */
export const Dropdown = forwardRef<HTMLDivElement, DropdownProps>(
  (
    {
      className,
      disabled,
      icon,
      label,
      onChange,
      options,
      value,
      defaultValue,
      // tabIndex落在handle上（对齐原版DropdownWidget的$tabIndexed=$handle，根元素不可聚焦）
      tabIndex,
      "aria-labelledby": ariaLabelledBy,
      ...rest
    },
    ref,
  ) => {
    const [open, setOpen] = useState(false);
    // 聚焦期（对齐原版DropdownWidget.onFocus/onBlur切换menu.toggleScreenReaderMode）：
    // 收起态也接管键盘通道，导航键与前缀跳转直接改选而不展开菜单
    const [focused, setFocused] = useState(false);
    const { value: currentValue, commitIfChanged } = useControlledValue<string | number>(
      { value, defaultValue },
      onChange,
    );
    // 菜单面板经MenuSelect portal出控件子树，点击外部关闭时需连同菜单一起排除
    const menuRef = useRef<HTMLDivElement>(null);
    // handle元素引用：既是标签点击的聚焦落点，也是菜单的焦点归属元素（下方MenuSelect的
    // focusOwnerRef）——屏幕阅读器读的是持有DOM焦点的元素，菜单自身不作Tab停靠点
    const handleRef = useRef<HTMLSpanElement>(null);
    // FieldLayout标签联动（通道B）：点击标签聚焦handle（对齐原版TabIndexedElement.simulateLabelClick
    // 基线focus()，禁用时不聚焦）。返回的rootRef兼作浮层的忽略目标
    const {
      setRef: mergedRef,
      rootRef: elementRef,
      fieldLabelId,
    } = useFieldLabelFocus<HTMLDivElement>({
      ref,
      disabled,
      activate: () => handleRef.current?.focus(),
    });
    // handle内label元素id：原版DropdownWidget构造期setLabelId并把它并入handle的
    // aria-labelledby，使combobox的可访问名称为字段label+当前显示文本
    const ownLabelId = useCleanId();
    // 菜单id：展开时经aria-owns关联portal化的菜单面板（对齐原版MenuSelectWidget.onToggle
    // 在$focusOwner即本handle上写入aria-owns、收起时移除）
    const menuId = useCleanId();

    const classes = clsx(
      className,
      getWidgetClassName(
        {
          disabled,
          icon,
          label,
          indicator: "down",
        },
        "dropdown",
      ),
      open && "oo-ui-dropdownWidget-open",
    );

    /**
     * 可选项（有value且未禁用），键盘导航的目标集合
     */
    const { values: selectableValues } = useSelectableValues(options);

    /**
     * 选定选项并收起菜单：值变化时才提交（对齐原版onMenuSelect的select事件），
     * 但任何一次选定都收起（对齐原版MenuSelectWidget.hideOnChoose——重复选定当前项同样收起）
     */
    function selectOption(optionValue: string | number) {
      commitIfChanged(optionValue);
      setOpen(false);
    }

    // 菜单开合与键盘高亮：导航起点为高亮项、无高亮回退选中项（原版currentItem），
    // 端点钳制不环绕（原版MenuSelectWidget static.listWrapsAround=false），
    // 开启时点击外部/Escape关闭（Escape捕获阶段，嵌套于Dialog时不误关弹窗）。
    // 高亮与Select共用（含鼠标悬停），经onHighlightedChange回写；导航与提交走
    // consumeNavigationKey，前缀跳转经getItemText启用（原版无$input的菜单在document监听keypress）
    const {
      highlightedValue,
      setHighlightedValue,
      navigationValue,
      consumeNavigationKey,
      hasTypeAheadBuffer,
    } = useMenuPopup<string | number>({
      open,
      onClose: () => setOpen(false),
      values: selectableValues,
      ignore: [elementRef, menuRef],
      selectedValue: currentValue,
      onChoose: selectOption,
      screenReaderMode: focused,
      getItemText: createMenuOptionTextLookup(options, menuRef),
    });

    /**
     * handle键盘导航：Enter/Space开合（原版DropdownWidget.onKeyDown），展开时Enter/Space选定
     * （MenuSelectWidget的ENTER分支代理基类chooseItem(currentItem)；空格选定为本工程增强，
     * 见DEVIATIONS「增强」），无导航目标（空菜单或无可选项）时收起——此时事件不被菜单键盘
     * 通道消费、落回handle的开合键；收起时Space仅在无前缀缓冲时展开（原版SPACE分支的
     * type-ahead守卫）；余下菜单键位（↑↓←→/Home/End/PageUp/PageDown/Tab）统一交consumeNavigationKey
     */
    const handleKeyDown = (ev: ReactKeyboardEvent) => {
      if (disabled) {
        return;
      }
      // IME合成期按键（确认候选的Enter、选词的方向键）不驱动开合与选定
      if (isComposingKeyEvent(ev)) {
        return;
      }
      switch (ev.key) {
        case "Enter":
        case " ":
          // 前缀缓冲活跃时空格属于type-to-search，不做开合（对齐原版SPACE分支守卫）；
          // 此时不preventDefault，空格才能进入随后的keypress
          if (ev.key === " " && hasTypeAheadBuffer()) {
            break;
          }
          ev.preventDefault();
          if (!open) {
            setOpen(true);
          } else if (navigationValue !== undefined) {
            // 选定导航起点（高亮项，无高亮时选中项；对齐原版chooseItem(currentItem)）
            selectOption(navigationValue);
          } else {
            // 展开态无导航目标时收起：原版此刻ENTER分支因currentItem不存在不被菜单键盘通道
            // 消费（SelectWidget.onDocumentKeyDown，oojs-ui.js:7525-7531），事件落回handle的
            // keydown→menu.toggle()（DropdownWidget.onKeyDown，oojs-ui.js:9202-9207）
            setOpen(false);
          }
          break;
        default:
          consumeNavigationKey(ev);
      }
    };

    /**
     * 点击handle开合菜单（对齐原版DropdownWidget.onClick的toggle语义，禁用时不响应）
     */
    const handleClickLabel = () => {
      if (!disabled) {
        setOpen((prev) => !prev);
      }
    };

    /**
     * 显示文本取选中项的children，未选中时以label作占位
     */
    const displayLabel =
      options.find((option) => "value" in option && option.value === currentValue)
        ?.children ?? label;

    return (
      <div {...rest} className={classes} ref={mergedRef}>
        <span
          ref={handleRef}
          tabIndex={resolveTabIndex(tabIndex, disabled)}
          aria-disabled={disabled || undefined}
          // 取原版的字面量`'true'`而非语义更precise的`'listbox'`：原版`DropdownWidget`构造期
          // 即写`'aria-haspopup': 'true'`（oojs-ui-core.js:9118），读屏播报与主题行为均以
          // 该值为靶；本工程不另行改良（`ButtonMenuSelectWidget`同此口径）
          aria-haspopup="true"
          className="oo-ui-dropdownWidget-handle"
          role="combobox"
          aria-autocomplete="list"
          aria-expanded={open}
          // 展开时声明所拥有的菜单（收起即移除，对齐原版MenuSelectWidget.onToggle
          // 对$focusOwner的attr/removeAttr）
          aria-owns={open ? menuId : undefined}
          // aria-labelledby落在handle：原版$tabIndexed=$handle且setLabelledBy覆写写$handle，
          // 并入handle内label元素id（构造期setLabelId分配）使名称含当前显示文本
          aria-labelledby={mergeAriaLabelledBy(fieldLabelId, ownLabelId, ariaLabelledBy)}
          onClick={handleClickLabel}
          onKeyDown={handleKeyDown}
          // 聚焦期开关（原版$handle的focus/blur监听）
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
        >
          <IconBase icon={icon} />
          <LabelBase id={ownLabelId} role="textbox" aria-readonly>
            {displayLabel}
          </LabelBase>
          <IndicatorBase indicator="down" />
        </span>
        <MenuSelect
          ref={menuRef}
          id={menuId}
          container={elementRef}
          // 高亮项的aria-activedescendant落在handle上（对齐原版setFocusOwner(widget.$tabIndexed)）；
          // screenReaderMode取focused：聚焦期即菜单收起时也保持该指向（原版该期highlightItem
          // 照常写aria-activedescendant，并直接改选而不展开菜单）
          focusOwnerRef={handleRef}
          screenReaderMode={focused}
          onChoose={selectOption}
          value={currentValue}
          open={open}
          options={options}
          highlightedValue={highlightedValue}
          onHighlightedChange={setHighlightedValue}
        />
      </div>
    );
  },
);

Dropdown.displayName = "Dropdown";
