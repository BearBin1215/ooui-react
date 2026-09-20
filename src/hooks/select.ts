import {
  useCallback,
  useMemo,
  type KeyboardEventHandler,
  type MouseEventHandler,
} from "react";
import { selectWidgetStateClasses } from "../mixins";
import { getSelectableValues, type ChangeHandler } from "../utils";
import { useCleanId } from "./refs";
import { useControlledValue } from "./value";
import { useGroupKeyboardSelection } from "./menu";
import { useOptionDrag, useOptionRegistry } from "./press";

/** 选择族共用原语（可选值派生/选项id生成）与直选型选择组（ButtonSelect/TabSelect）容器脚手架 */

/**
 * 选择族共用的可选值派生：非禁用且带value的选项值序列（按展示顺序，经getSelectableValues
 * 统一口径），附`has`命中判定（Set实现，O(1)——拖拽逐帧与键盘导航的高频路径用）。
 * Select引擎族/直选族/菜单族的全部消费方经此取值
 */
export function useSelectableValues<T extends string | number>(
  options: { value?: T; disabled?: boolean }[],
): { values: T[]; has: (value: T) => boolean } {
  const values = useMemo(() => getSelectableValues(options) as T[], [options]);
  const valueSet = useMemo(() => new Set(values), [values]);
  const has = useCallback((value: T) => valueSet.has(value), [valueSet]);
  return { values, has };
}

/**
 * 选项元素id生成（对齐原版OptionWidget.getElementId的「无显式id则生成稳定唯一id供aria
 * 引用」语义）：显式id优先，缺省按展示下标生成——React useId适配（useCleanId去`:`）加
 * 下标后缀；原版是`ooui-`前缀全局自增计数，机制不同、契约等价。Select引擎族
 * （aria-activedescendant指向高亮项）与直选族（指向选中项）共用
 */
export function useOptionElementIds(
  options: readonly { id?: string }[],
): (index: number) => string {
  const idBase = useCleanId();
  return useCallback(
    (index: number) => options[index]?.id ?? `${idBase}-${index}`,
    [options, idBase],
  );
}

/** 直选族容器所需的选项最小结构（仅读取值判定、禁用继承与显式 id） */
interface DirectSelectOption {
  /** 选项值 */
  value: string | number;
  /** 选项自身禁用 */
  disabled?: boolean;
  /** 选项显式 id（缺省按下标生成，供 aria-activedescendant 指向） */
  id?: string;
}

/**
 * 直选型选择组（ButtonSelect/TabSelect）的共用容器脚手架，收敛两者逐字重复的部分：
 * 受控值态、可选值序列派生、选项 DOM 双向索引、拖拽选择、直选键盘改选、选项 id 生成与按压态类。
 *
 * 直选族无中间高亮态（对齐原版 static.highlightable=false 的选项）：↑↓←→环绕改选、Enter 重申
 * 当前项，故走 `useGroupKeyboardSelection` 而非 Select 引擎的高亮导航；提交统一走
 * `commitIfChanged`（对齐原版 `selectItem` 提前返回）。不下沉的部分（根 ref 策略、根 role 与
 * aria 模型、Option 绑定、各自独有交互）及 RadioSelect 不并入的理由见
 * dev-docs/comparison-guide.md「共享抽象」。
 *
 * 根元素事件均先透传调用方同名通道再执行内部逻辑（与 usePressedState 的串联约定一致：内部
 * 逻辑含 disabled/非左键的提前返回，透传置于其后会使这些分支下调用方收不到事件）
 */
export function useDirectSelect<T extends string | number>({
  value,
  defaultValue,
  onChange,
  disabled,
  options,
  onMouseDown,
  onMouseUp,
  onMouseLeave,
  onKeyDown,
  focusRoot,
}: {
  /** 当前选中值（受控，传入即受控模式） */
  value?: T;
  /** 非受控初始选中值 */
  defaultValue?: T;
  /** 选中选项回调（值优先） */
  onChange?: ChangeHandler<T>;
  /** 组禁用 */
  disabled?: boolean;
  /** 选项集（仅读取 value/disabled/id） */
  options: (DirectSelectOption & { value: T })[];
  /** 调用方透传的 mousedown（先于内部拖拽/聚焦逻辑转发，见顶部串联约定） */
  onMouseDown?: MouseEventHandler<HTMLDivElement>;
  /** 调用方透传的 mouseup（先于内部按压复位转发） */
  onMouseUp?: MouseEventHandler<HTMLDivElement>;
  /** 调用方透传的 mouseleave（先于内部按压复位转发） */
  onMouseLeave?: MouseEventHandler<HTMLDivElement>;
  /** 调用方透传的 keydown（在导航键处理之前调用） */
  onKeyDown?: KeyboardEventHandler<HTMLDivElement>;
  /**
   * 指针按下时把焦点收进组根的回调（右键与禁用组不聚焦）。略优于原版：原版 mousedown 一律
   * preventDefault，点击后焦点留在原处，方向键无法导航（原版实测复现）；本工程对齐 ARIA APG
   * 的 tablist/listbox 模式「点击选项后焦点应落入组」，组根是导航键的宿主，聚焦后键盘立即可用。
   * 调用方传组根的聚焦动作（root ref 策略不下沉，见上）
   */
  focusRoot?: () => void;
}) {
  const { value: currentValue, commitIfChanged } = useControlledValue<T>(
    { value, defaultValue },
    onChange,
  );
  // 索引注册值：全部选项值（与 registerItem 的调用集合同源，供淘汰已移除选项）
  const optionValues = useMemo(() => options.map((option) => option.value), [options]);
  const { itemRefs, registerItem, findItemFromNode } = useOptionRegistry<T>(optionValues);
  const { values: selectableValues, has: isValueSelectable } =
    useSelectableValues(options);

  // 拖拽选择：与 Select 共用 useOptionDrag
  const {
    pressed,
    pressedValue,
    handleMouseDown: dragMouseDown,
    handleUnpress,
  } = useOptionDrag<T>({
    disabled,
    isValueSelectable,
    findItemFromNode,
    onCommit: commitIfChanged,
  });

  // 指针按下即把焦点收进组根（见focusRoot参数注释）：仅左键与可用组，右键/禁用不聚焦
  const handleMouseDown: MouseEventHandler<HTMLDivElement> = (e) => {
    onMouseDown?.(e);
    dragMouseDown(e);
    if (!disabled && e.button === 0) {
      focusRoot?.();
    }
  };

  /** 根元素 mouseup：先透传调用方 onMouseUp，再退出按压态 */
  const handleMouseUp: MouseEventHandler<HTMLDivElement> = (e) => {
    onMouseUp?.(e);
    handleUnpress();
  };

  /** 根元素 mouseleave：先透传调用方 onMouseLeave，再退出按压态 */
  const handleMouseLeave: MouseEventHandler<HTMLDivElement> = (e) => {
    onMouseLeave?.(e);
    handleUnpress();
  };

  const handleGroupKeyDown = useGroupKeyboardSelection<T>({
    disabled,
    selectableValues,
    value: currentValue,
    onCommit: commitIfChanged,
  });

  const handleKeyDown: KeyboardEventHandler<HTMLDivElement> = (e) => {
    onKeyDown?.(e);
    handleGroupKeyDown(e);
  };

  const optionElementId = useOptionElementIds(options);
  // 当前选中项下标（无选中值或值不在选项集内时为 -1）
  const selectedIndex =
    currentValue === undefined
      ? -1
      : options.findIndex((option) => option.value === currentValue);
  /**
   * 组根的 `aria-activedescendant` 取值：直选族选项不可高亮，故指向选中项
   * （对齐原版 `SelectWidget.selectItem` 只对非高亮选项的写入），无选中项时不输出
   */
  const activeDescendant =
    selectedIndex >= 0 ? optionElementId(selectedIndex) : undefined;

  /** 组按压态类（对齐原版 SelectWidget 的 pressed/unpressed 互斥态） */
  const pressedStateClass = selectWidgetStateClasses(pressed);

  return {
    /** 当前选中值 */
    value: currentValue,
    /** 值→元素索引（TabSelect 滚动到可见区读取） */
    itemRefs,
    /** 取某选项值的 ref 回调 */
    registerItem,
    /** 拖拽按压中的选项值（驱动选项 pressed 类） */
    pressedValue,
    /** 组按压态类 */
    pressedStateClass,
    /** 根元素 mousedown：先透传调用方 onMouseDown，再进入拖拽按压态并把焦点收进组根（focusRoot） */
    handleMouseDown,
    /** 根元素 mouseup：先透传调用方 onMouseUp，再退出按压态 */
    handleMouseUp,
    /** 根元素 mouseleave：先透传调用方 onMouseLeave，再退出按压态 */
    handleMouseLeave,
    /** 根元素 keydown：先透传调用方 onKeyDown，再处理直选导航键 */
    handleKeyDown,
    /** 选项元素 id（显式 id 优先，缺省按下标生成），供 aria-activedescendant 引用与选项 id 绑定 */
    optionElementId,
    /** 组根 `aria-activedescendant` 的取值（选中项 id，无选中项时 undefined） */
    activeDescendant,
  };
}
