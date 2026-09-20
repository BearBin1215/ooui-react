import {
  useEffect,
  useLayoutEffect,
  useCallback,
  useMemo,
  useRef,
  forwardRef,
  type KeyboardEvent as ReactKeyboardEvent,
  type MouseEventHandler,
  type RefObject,
} from "react";
import clsx from "clsx";
import { MenuOption, type MenuOptionProps } from "../MenuOption";
import { MenuSectionOption, type MenuSectionOptionProps } from "../MenuSectionOption";
import { OutlineOption } from "../OutlineOption";
import {
  getWidgetClassName,
  mergeAriaLabelledBy,
  resolveTabIndex,
  selectWidgetStateClasses,
} from "../../mixins";
import {
  findRelativeSelectableItem,
  findScrollableContainer,
  isComposingKeyEvent,
  resolveOptionDisabled,
  scrollOptionIntoView,
  type ChangeHandler,
} from "../../utils";
import {
  useControlledValue,
  useFieldLabelFocus,
  useOptionDrag,
  useOptionElementIds,
  useOptionRegistry,
  usePrefixSearchBuffer,
  useSelectableValues,
} from "../../hooks";
import type { WidgetProps } from "../Widget";

/**
 * Options of the selection list: entries with `value` are selectable, entries
 * without are section headers; `value` is both the selection key and the list key.
 *
 * 选择集选项：带 `value` 的为可选项，不带的为分组标题；`value` 同时作为选中态
 * 匹配依据与列表 key
 */
export type SelectOptionProps =
  | MenuOptionProps
  | (MenuSectionOptionProps & { value?: undefined });

/**
 * Home/End/PageUp/PageDown的按键量（页步长），直接以`KeyboardEvent.key`为键：
 * Home/End为±1，经findRelativeSelectableItem的越界起步（正向自首项前、反向自末项后）
 * 取到首末项；PageUp/PageDown为∓10；两者的导航起点不同（Home/End自序列外、翻页自当前项），
 * 由`fromCurrent`区分
 */
const NAVIGATION_STEPS: Record<string, { step: number; fromCurrent: boolean }> = {
  Home: { step: 1, fromCurrent: false },
  End: { step: -1, fromCurrent: false },
  PageUp: { step: -10, fromCurrent: true },
  PageDown: { step: 10, fromCurrent: true },
};

export interface SelectProps extends Omit<WidgetProps<HTMLDivElement>, "children"> {
  /**
   * Selected-value change callback (value-first, fires only on change).
   *
   * 选中值变化回调（值优先，仅值发生变化时触发）
   */
  onChange?: ChangeHandler<string | number>;

  // 实现说明：菜单类容器用它收起菜单（显隐由调用方持有的无条件通道）
  /**
   * Choose callback (fires on every choice — click / drag / Enter — incl. repeats).
   *
   * 选定回调（每次选定——点击/拖拽/Enter——都触发，含重复选定当前项）
   */
  onChoose?: ChangeHandler<string | number>;

  /**
   * Command-menu form: a choice only fires `onChoose` and leaves the value
   * unchanged (no selected look is ever shown).
   *
   * 命令菜单形态：置 true 时选定只触发 `onChoose`、不改选中值（展示上从不出现选中态）。
   */
  clearOnChoose?: boolean;

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
   * A set of selected values for multi-select display (used by tag inputs etc.):
   * matching options show a selected look and `aria-multiselectable` is emitted;
   * the single-value `value` no longer participates in the display.
   *
   * 多选展示的选中值集合（供标签多选等组合使用）：命中集合的选项输出选中态、
   * `aria-multiselectable=true`，`value`/`defaultValue` 的单值选中态不再参与展示
   */
  selectedValues?: (string | number)[];

  /**
   * Render options as hierarchy-indented `OutlineOption`s
   *
   * 以带层级缩进的 `OutlineOption` 渲染选项
   */
  outline?: boolean;

  /**
   * The option set
   *
   * 选项集
   */
  options: SelectOptionProps[];

  /**
   * Keyboard-highlighted value (controlled; pass it to manage from above, e.g.
   * Dropdown — internally maintained when used standalone).
   *
   * 键盘导航高亮值（受控，传入即由上层如 Dropdown 管理；独立使用时组件内部维护）
   */
  highlightedValue?: string | number;

  /**
   * Highlight-change callback; when `highlightedValue` is controlled, write back
   * through it so hover and keyboard highlights stay unified.
   *
   * 高亮变化回调；传入 `highlightedValue` 时须经此回写父级，
   * 使鼠标悬停高亮与键盘高亮统一（Dropdown 等读此值作键盘选择目标）
   */
  onHighlightedChange?: ChangeHandler<string | number | undefined>;

  /**
   * Whether Home/End/PageUp/PageDown are handled
   *
   * 是否处理 Home/End/PageUp/PageDown 导航键
   */
  handleNavigationKeys?: boolean;

  /**
   * Whether keyboard navigation wraps at the ends
   *
   * 键盘导航到端点后是否环绕
   */
  listWrapsAround?: boolean;
}

/**
 * Select的内部组合形态参数（MenuSelect/SearchWidget/TagMultiselect等库内组合经相对路径
 * 使用，不进公开导出面）：
 * focusOwnerRef为「键盘焦点在别处、由该处驱动列表高亮」的组合通道（对齐原版
 * `SelectWidget.setFocusOwner`）——有值时高亮项的`aria-activedescendant`输出到该元素、
 * 列表根不再输出。列表根缺省不输出tabindex（对齐原版SelectWidget根无tabindex）。
 * 落点与开合时点的完整对照见dev-docs/comparison-guide.md「共享抽象」与dev-docs/DEVIATIONS.md
 */
export interface SelectInternalProps extends SelectProps {
  /**
   * 焦点归属元素（内部通道）
   */
  focusOwnerRef?: RefObject<HTMLElement | null>;

  /**
   * 焦点归属元素的管理期（仅与focusOwnerRef配套，缺省true即始终管理）。
   * 对齐原版MenuSelectWidget.toggle的开合时点：激活时无高亮则指向当前选中项、
   * 关闭时移除aria-activedescendant（隐藏选项的id不留在触发元素上）。
   * MenuSelect传入菜单显隐；独立组合（SearchWidget输入框常驻驱动）不传即恒管理
   */
  focusOwnerActive?: boolean;
}

// 实现说明：键盘行为对齐原版SelectWidget——聚焦后↑↓←→移动高亮（无高亮时回退选中项）、
// Enter选中、Home/End/PageUp/PageDown可选、字符前缀跳转（1500ms缓冲）、Escape/Tab清除高亮
/**
 * A selection list: a clickable set of options — the inner list of floating
 * components like Dropdown, and usable on its own.
 *
 * 选择列表：可点选的选项集合，既是 Dropdown 等浮层组件的内层列表，也可单独使用。
 *
 * @see https://bearbin1215.github.io/ooui-react/components/select/index.html
 */
export const Select = forwardRef<HTMLDivElement, SelectInternalProps>(
  (
    {
      className,
      disabled,
      onChange,
      onChoose,
      clearOnChoose = false,
      value,
      defaultValue,
      selectedValues,
      outline,
      options,
      highlightedValue,
      onHighlightedChange,
      handleNavigationKeys = false,
      listWrapsAround = true,
      focusOwnerRef,
      focusOwnerActive = true,
      tabIndex,
      onKeyDown,
      onMouseLeave,
      onMouseOver,
      "aria-labelledby": ariaLabelledBy,
      ...rest
    },
    ref,
  ) => {
    const { value: currentValue, commitIfChanged } = useControlledValue<string | number>(
      { value, defaultValue },
      onChange,
    );
    // 高亮半受控：传入highlightedValue即由上层管理（如Dropdown的键盘导航与hover高亮），
    // 独立使用时内部维护。undefined也是合法写入值（Escape/Tab清除高亮）
    const { value: currentHighlighted, commit: setHighlighted } = useControlledValue<
      string | number | undefined
    >({ value: highlightedValue }, onHighlightedChange);
    // 选项DOM索引的注册值：全部带value的选项（禁用项也注册——命中后由可选性过滤），
    // 与下方registerItem的调用集合同源，供索引淘汰已移除选项
    const optionValues = useMemo(() => {
      const values: (string | number)[] = [];
      for (const option of options) {
        if (option.value !== undefined) {
          values.push(option.value);
        }
      }
      return values;
    }, [options]);
    // 选项DOM双向索引（值→元素供前缀匹配/滚动，元素→值供拖拽定位），供拖拽与滚动共用
    const { itemRefs, registerItem, findItemFromNode } = useOptionRegistry<
      string | number
    >(optionValues);
    // 前缀跳转的字符缓冲与超时计时（与useMenuPopup的keypress通道共用同一hook）
    const prefixSearch = usePrefixSearchBuffer();
    // 可选值序列（有value且未禁用）：键盘导航、悬停高亮与拖拽的共用目标集合。
    // has供O(1)命中——拖拽mousemove逐帧调用isValueSelectable
    const { values: selectableValues, has: isValueSelectable } =
      useSelectableValues(options);
    // FieldLayout标签联动（通道B）：点击标签聚焦容器（对齐原版TabIndexedElement.simulateLabelClick
    // 基线focus()，禁用时不聚焦）
    const { setRef: setRootRef, fieldLabelId } = useFieldLabelFocus<HTMLDivElement>({
      ref,
      disabled,
    });
    // 程序化滚动护栏的活跃计数（对齐原版SelectWidget.blockMouseOverEvents，oojs-ui.js:7246）：
    // Chromium在程序化滚动期间及结束后约100-150ms会产生伪mouseover，不挡会把键盘高亮抢到
    // 光标下选项。计数而非布尔：连续两次滚动的时间窗可重叠，各计各的、互不提前复位
    const blockMouseOverEventsRef = useRef(0);

    /**
     * 选定选项：先按值变化提交（对齐原版`chooseItem`先`selectItem`），再无条件的派发onChoose
     * （对齐其后的`emit('choose')`——菜单据此收起）。重复选定同一项只收起菜单、不派发选中事件
     */
    const commitSelection = (optionValue: string | number) => {
      // 命令菜单形态（clearOnChoose）：只派发onChoose、不改选中值——对齐原版"选定后
      // selectItem()清除"的净效果（选定态一闪即清，展示上从未出现）
      if (clearOnChoose) {
        onChoose?.(optionValue);
        return;
      }
      commitIfChanged(optionValue);
      onChoose?.(optionValue);
    };

    const { pressed, pressedValue, handleMouseDown, handleUnpress } = useOptionDrag<
      string | number
    >({
      disabled,
      isValueSelectable,
      findItemFromNode,
      onCommit: commitSelection,
    });

    const classes = clsx(
      className,
      getWidgetClassName({ disabled }, "select"),
      selectWidgetStateClasses(pressed),
    );

    /**
     * 鼠标悬停高亮，对齐原版SelectWidget.onMouseOver/onMouseLeave：
     * 悬停可高亮项即高亮、离开清除；悬停高亮与键盘高亮共用同一状态，
     * 非受控时改内部state，受控时经onHighlightedChange回写（Dropdown/ComboBoxInput依赖）。
     * 程序化滚动护栏窗口内的mouseover整体吞掉（对齐原版onMouseOver首行的
     * blockMouseOverEvents短路，oojs-ui.js:7484-7487）：伪事件不驱动高亮、
     * 也不透传调用方监听。自身逻辑先行、调用方监听最后透传（与handleMouseLeave同序）
     */
    const handleMouseOver: MouseEventHandler<HTMLDivElement> = (e) => {
      if (blockMouseOverEventsRef.current > 0) {
        return;
      }
      if (!disabled) {
        const optionValue = findItemFromNode(e.target);
        setHighlighted(
          optionValue !== null && isValueSelectable(optionValue)
            ? optionValue
            : undefined,
        );
      }
      onMouseOver?.(e);
    };

    const handleMouseLeave: MouseEventHandler<HTMLDivElement> = (e) => {
      handleUnpress();
      if (!disabled) {
        setHighlighted(undefined);
      }
      onMouseLeave?.(e);
    };

    /**
     * 选项显示文本（前缀跳转的匹配输入，对齐原版读选项DOM textContent的口径）
     */
    const optionTextOf = (optionValue: string | number) =>
      itemRefs.current.get(optionValue)?.textContent ?? "";

    // outline与menu两种选项的props形状一致、仅渲染组件不同，故取一次组件；以不接受value
    // 的OutlineOption归一到MenuOption的类型承载
    const OptionComponent: typeof MenuOption = outline ? OutlineOption : MenuOption;

    // 经useCallback稳定（内部读ref）：供高亮滚动的layout effect以稳定依赖引用。
    // 滚动只在选项就近的可滚动容器内进行、不触达window（scrollOptionIntoView）：菜单收起时
    // 面板停到屏外哨兵位，原生scrollIntoView会把整页拽到顶部，见该函数与dev-docs/DEVIATIONS.md。
    // 护栏只在实际发生滚动时置位并200ms后复位（对齐原版SelectWidget.scrollItemIntoView，
    // oojs-ui.js:7642-7649）：悬停高亮也经同一layout effect到达这里，但悬停目标恒在可视区
    // （delta=0），原版hover路径本就不滚动、不置位——无条件置位会把悬停导航冻结200ms
    const scrollItemIntoView = useCallback(
      (optionValue: string | number) => {
        const el = itemRefs.current.get(optionValue);
        if (el) {
          const container = findScrollableContainer(el);
          const scrollTopBefore = container.scrollTop;
          scrollOptionIntoView(el);
          if (container.scrollTop !== scrollTopBefore) {
            blockMouseOverEventsRef.current += 1;
            window.setTimeout(() => {
              blockMouseOverEventsRef.current -= 1;
            }, 200);
          }
        }
      },
      [itemRefs],
    );

    // 高亮项变化时滚动到可见区（对齐原版键盘导航的滚动行为）。统一在此处理而非仅在
    // handleKeyDown里调用：受控高亮（上层如ComboBoxInput经MenuSelect传入，键盘事件
    // 不冒泡经过本组件）时仅靠handleKeyDown会漏掉滚动
    useLayoutEffect(() => {
      if (currentHighlighted !== undefined) {
        scrollItemIntoView(currentHighlighted);
      }
    }, [currentHighlighted, scrollItemIntoView]);

    /**
     * 对齐原版findRelativeSelectableItem：从start（不含）按offset取可选值，支持环绕与过滤
     */
    const findRelative = (
      start: string | number | undefined,
      offset: number,
      filter?: (optionValue: string | number) => boolean,
      wrap = listWrapsAround,
    ): string | number | undefined =>
      findRelativeSelectableItem(selectableValues, start, offset, filter, wrap);

    /**
     * 键盘导航，对齐原版SelectWidget.onDocumentKeyDown与onDocumentKeyPress
     */
    const handleKeyDown = (e: ReactKeyboardEvent<HTMLDivElement>) => {
      onKeyDown?.(e);
      if (disabled) {
        return;
      }
      // IME合成期按键不驱动导航与前缀缓冲。多数调用方（Dropdown/ComboBoxInput/TagMultiselect/
      // SearchWidget）已在自己的onKeyDown里先行拦截，此处是独立使用与未被拦截路径的第二道；
      // 各处的合成期行为见DEVIATIONS「增强」的IME条
      if (isComposingKeyEvent(e)) {
        return;
      }
      if (!selectableValues.length) {
        return;
      }
      // 对齐原版：导航目标为高亮项，无高亮（或高亮项已不在可选集）时回退选中项；
      // 多选展示模式无单值选中语义、不回退（对齐原版onDocumentKeyDown的
      // `!this.multiselect && this.findSelectedItem()`，oojs-ui.js:7518-7520，
      // 与下方aria-activedescendant的selectedFallbackIndex门控同口径）
      const selectedFallback =
        selectedValues === undefined && isValueSelectable(currentValue)
          ? currentValue
          : undefined;
      const current =
        currentHighlighted !== undefined && isValueSelectable(currentHighlighted)
          ? currentHighlighted
          : selectedFallback;
      let next: string | number | undefined;
      let handled = false;

      switch (e.key) {
        case "Enter":
          if (current !== undefined) {
            // 对齐原版chooseItem→selectItem：命中已选中项时无变化、不派发选中事件
            commitSelection(current);
            handled = true;
          }
          break;
        case "ArrowUp":
        case "ArrowLeft":
        case "ArrowDown":
        case "ArrowRight":
          prefixSearch.clear();
          next = findRelative(
            current,
            e.key === "ArrowUp" || e.key === "ArrowLeft" ? -1 : 1,
          );
          handled = true;
          break;
        case "Home":
        case "End":
        case "PageUp":
        case "PageDown": {
          const step = NAVIGATION_STEPS[e.key];
          if (handleNavigationKeys) {
            prefixSearch.clear();
            next = findRelative(step.fromCurrent ? current : undefined, step.step);
            handled = true;
          }
          break;
        }
        case "Escape":
        case "Tab":
          // 对齐原版：清除高亮但不阻止默认行为（不阻止tab移出/失焦）
          setHighlighted(undefined);
          break;
        case "Backspace":
          handled = prefixSearch.backspace();
          break;
        default: {
          if (e.key.length === 1 && !e.ctrlKey && !e.metaKey && !e.altKey) {
            // 对齐原版onDocumentKeyPress：连打同字符在同名前缀项间循环，否则累计缓冲
            next = prefixSearch.advance(e.key, selectableValues, optionTextOf, current);
            handled = true;
          }
          break;
        }
      }

      if (next !== undefined) {
        // 滚动由高亮变化的layout effect统一处理（含受控高亮路径）
        setHighlighted(next);
      }
      if (handled) {
        e.preventDefault();
        e.stopPropagation();
      }
    };

    /**
     * 选项元素id（显式id优先，缺省按下标生成，经useOptionElementIds统一口径）：
     * 供aria-activedescendant指向高亮项；下标口径与highlightedIndex一致
     */
    const optionElementId = useOptionElementIds(options);
    const highlightedIndex =
      currentHighlighted === undefined
        ? -1
        : options.findIndex((option) => option.value === currentHighlighted);
    // 无高亮时回退指向当前选中项（对齐原版MenuSelectWidget.toggle(true)的selectedItem分支；
    // 多选展示无单值选中语义，不做回退——与handleKeyDown的selectedFallback门控同口径）
    const selectedFallbackIndex =
      highlightedIndex >= 0 || selectedValues !== undefined
        ? -1
        : options.findIndex(
            (option) => "value" in option && option.value === currentValue,
          );
    const activeDescendantIndex =
      highlightedIndex >= 0 ? highlightedIndex : selectedFallbackIndex;

    // 焦点归属元素（对齐原版setFocusOwner下的$focusOwner.attr/removeAttr）：指定focusOwnerRef
    // 时由该元素承载aria-activedescendant——屏幕阅读器读的是**持有DOM焦点的元素**，列表根
    // （指定focusOwnerRef的场景即为此）时挂在根上不会被读出。管理期关闭（菜单已收起）时移除，
    // 隐藏选项的id不留在触发元素上（对齐原版toggle(false)的removeAttr）
    useEffect(() => {
      const owner = focusOwnerRef?.current;
      if (!owner) {
        return;
      }
      const index = focusOwnerActive ? activeDescendantIndex : -1;
      if (index >= 0) {
        owner.setAttribute("aria-activedescendant", optionElementId(index));
      } else {
        owner.removeAttribute("aria-activedescendant");
      }
      return () => owner.removeAttribute("aria-activedescendant");
    }, [focusOwnerRef, focusOwnerActive, activeDescendantIndex, optionElementId]);

    return (
      <div
        {...rest}
        className={classes}
        aria-disabled={disabled || undefined}
        role="listbox"
        aria-multiselectable={selectedValues !== undefined}
        // 高亮项关联：对齐原版SelectWidget.highlightItem将高亮项id写入$focusOwner（缺省为listbox根，
        // 见下方focusOwnerRef）的aria-activedescendant；无高亮时不输出
        aria-activedescendant={
          focusOwnerRef || highlightedIndex < 0
            ? undefined
            : optionElementId(highlightedIndex)
        }
        aria-labelledby={mergeAriaLabelledBy(fieldLabelId, ariaLabelledBy)}
        // 列表根缺省不输出tabindex（对齐原版SelectWidget根无tabindex、非TabIndexedElement）：
        // 独立使用既不进Tab序也不可聚焦，FieldLayout标签点击随之落空（原版simulateLabelClick
        // 空操作）。键盘改选由Dropdown/MenuSelect等触发元素经focusOwnerRef驱动。
        // 经resolveTabIndex的null通道表达该缺省（tabIndex未传即null→省略属性，disabled
        // 也不补-1）；调用方显式传值时按TabIndexedElement语义解析（disabled覆盖）
        tabIndex={resolveTabIndex(tabIndex ?? null, disabled)}
        onKeyDown={handleKeyDown}
        onMouseUp={handleUnpress}
        onMouseDown={handleMouseDown}
        onMouseOver={handleMouseOver}
        onMouseLeave={handleMouseLeave}
        ref={setRootRef}
      >
        {options.map((option, i) => {
          // 组禁用下发到全部选项（含分组标题，对齐原版组setDisabled逐一updateDisabled与
          // ItemWidget.isDisabled的`this.disabled || group.isDisabled()`：禁用组内的选项
          // 同样带disabled外观，图标不参与主题变体着色）
          const itemDisabled = resolveOptionDisabled(option, disabled);
          if (option.value === undefined) {
            return <MenuSectionOption {...option} disabled={itemDisabled} key={i} />;
          }
          // 多选展示（selectedValues）优先于单值选中态
          const selected =
            selectedValues !== undefined
              ? selectedValues.includes(option.value)
              : currentValue === option.value;
          const isHighlighted = currentHighlighted === option.value;
          const itemRef = registerItem(option.value);
          return (
            <OptionComponent
              {...option}
              id={optionElementId(i)}
              key={option.value}
              ref={itemRef}
              disabled={itemDisabled}
              selected={selected}
              pressed={pressedValue === option.value}
              highlighted={isHighlighted}
            >
              {option.children}
            </OptionComponent>
          );
        })}
      </div>
    );
  },
);

Select.displayName = "Select";
