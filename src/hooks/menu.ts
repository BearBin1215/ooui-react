import {
  useEffect,
  useState,
  // 以别名导入：DOM的KeyboardEvent在下文经globalThis引用，避免被React的类型遮蔽
  type KeyboardEvent as ReactKeyboardEvent,
  type KeyboardEventHandler,
  type RefObject,
} from "react";
import {
  findRelativeSelectableItem,
  isComposingKeyEvent,
  type ElementOrRef,
} from "../utils";
import { usePrefixSearchBuffer } from "./prefixSearch";
import { useDismissablePopover } from "./dismiss";
import { useLatestRef } from "./refs";

/** 菜单弹层高亮与直选型选项组的键盘选择（选择集键盘语义域） */

/**
 * 菜单选项文本查找器（前缀跳转getItemText的共用实现）：读菜单面板DOM文本，
 * 对齐原版按键匹配读选项textContent的口径。依赖"Select根children与options按下标
 * 一一对应（分组标题也占一个子节点）"的DOM结构不变量——Select渲染结构变化时须同步本实现。
 * Dropdown与ButtonMenuSelectWidget等无输入框形态经此提供getItemText，不要各自手写
 */
export function createMenuOptionTextLookup<T extends string | number>(
  options: ReadonlyArray<{ value?: T }>,
  menuRef: RefObject<HTMLElement | null>,
): (optionValue: T) => string {
  return (optionValue) => {
    const index = options.findIndex((option) => option.value === optionValue);
    return menuRef.current?.children[index]?.textContent ?? "";
  };
}

/**
 * 菜单触发类组件（Dropdown/ButtonMenuSelectWidget/ComboBoxInput/TagMultiselect）共用的
 * 菜单键盘高亮与关闭：对齐原版MenuSelectWidget的键盘语义——
 * 导航起点为高亮项、无高亮回退选中项（原版currentItem=highlighted||selected）；
 * ↑↓←→/Home/End/PageUp/PageDown移动高亮，端点钳制不环绕
 * （原版static.listWrapsAround=false）；菜单开启时点击外部/Escape关闭，
 * Escape另清除高亮（原版ESCAPE分支的setHighlighted(false)）；
 * Tab在原版会提交未选中的高亮项并阻止移出焦点、否则收起并放行（见onChoose）。
 * 前缀跳转（type-to-search）经getItemText启用，对应原版无$input时菜单开启期
 * 绑定的document keypress；带输入框的组件（ComboBoxInput/TagMultiselect）原版把
 * 按键交给输入路径，不传即不启用。
 * 另可经screenReaderMode让收起态也接管键盘通道并直接改选（原版DropdownWidget专属形态，
 * 见该参数注释）
 */
export function useMenuPopup<T extends string | number>({
  open,
  onClose,
  values,
  ignore,
  onEscape,
  selectedValue,
  isSelectedValue,
  onChoose,
  getItemText,
  screenReaderMode = false,
}: {
  /** 菜单是否展开：键盘通道与外部点击关闭随之启用 */
  open: boolean;
  /** 请求关闭菜单（外部点击/Escape/Tab等分支调用） */
  onClose: () => void;
  /** 可选项值集合（有value且未禁用） */
  values: T[];
  /** 视为菜单内部的目标，其内部点击不触发关闭 */
  ignore?: ElementOrRef[];
  /** Escape触发关闭后的附加动作（如TagMultiselect清空输入文本，对齐原版doInputEscape） */
  onEscape?: () => void;
  /** 当前选中值：无高亮时的导航起点（对齐原版findSelectedItem回退） */
  selectedValue?: T;
  /** 「值是否已选定」判定（Tab提交分支对齐原版currentItem.isSelected()）：
   * 缺省与selectedValue单值比较；多选菜单（如MenuTagMultiselect）传集合判定 */
  isSelectedValue?: (value: T) => boolean;
  /** 选定回调：Tab提交高亮所需（原版TAB分支的chooseItem）；不传时Tab仅收起并放行 */
  onChoose?: (value: T) => void;
  /** 取选项显示文本：传入即启用前缀跳转（原版读DOM textContent，调用方按同口径提供） */
  getItemText?: (value: T) => string;
  /**
   * 收起态也接管键盘通道并直接改选（对齐原版DropdownWidget聚焦期开启的
   * `menu.screenReaderMode`）。由调用方以「触发元素聚焦中」布尔量驱动；只有无输入框、且原版
   * 会开启该模式的组件传值（Dropdown传，ButtonMenuSelectWidget原版不开启故不传）。
   * 机制对照见dev-docs/DEVIATIONS.md「等效替代」的菜单键盘通道条
   */
  screenReaderMode?: boolean;
}) {
  const [highlightedValue, setHighlightedValue] = useState<T>();
  // 前缀跳转的字符缓冲与超时计时（与Select的keydown通道共用同一hook）
  const prefixSearch = usePrefixSearchBuffer();

  /** 导航起点（对齐原版currentItem）：高亮项（须在可选集内）优先，无高亮回退选中项。
   * 用显式比较而非`&&`/`||`链：合法值可能是0或空串，不可按真值短路 */
  const highlightedNavigation =
    highlightedValue !== undefined && values.includes(highlightedValue)
      ? highlightedValue
      : undefined;
  const selectedNavigation =
    selectedValue !== undefined && values.includes(selectedValue)
      ? selectedValue
      : undefined;
  const navigationValue = highlightedNavigation ?? selectedNavigation;

  /** 线性导航：本hook的导航键一律无过滤、不环绕（端点钳制） */
  const findLinear = (start: T | undefined, offset: number): T | undefined =>
    findRelativeSelectableItem(values, start, offset, undefined, false);

  /**
   * 处理单个导航键并移动高亮（↑↓←→相对±1、Home/End取首末、PageUp/PageDown±10），
   * 端点钳制不环绕；directChoose为真时（收起态的screenReaderMode）在移动高亮后直接提交选定，
   * 对齐原版`SelectWidget.onDocumentKeyDown`末尾分支——菜单不可见时走chooseItem、
   * screenReaderMode下再补一次highlightItem。
   * 返回是否命中导航键（空菜单或非导航键为false），供调用方决定preventDefault
   */
  const moveHighlight = (key: string, directChoose: boolean): boolean => {
    if (!values.length) {
      return false;
    }
    let next: T | undefined;
    switch (key) {
      case "ArrowUp":
      case "ArrowLeft":
        next = findLinear(navigationValue, -1);
        break;
      case "ArrowDown":
      case "ArrowRight":
        next = findLinear(navigationValue, 1);
        break;
      case "Home":
        // 起点取序列外（undefined）即首/末项（对齐原版findRelativeSelectableItem(null,±1)）
        next = findLinear(undefined, 1);
        break;
      case "End":
        next = findLinear(undefined, -1);
        break;
      case "PageUp":
        next = findLinear(navigationValue, -10);
        break;
      case "PageDown":
        next = findLinear(navigationValue, 10);
        break;
      default:
        return false;
    }
    // 命中导航键即清空前缀缓冲（对齐原版onDocumentKeyDown各导航分支的clearKeyPressBuffer）：
    // 否则"键入ap→↓→1.5s内键入p"会按app继续累积，原版则以新缓冲p重新搜索
    prefixSearch.clear();
    // 钳制到端点时findRelativeSelectableItem仍返回端点项，undefined仅出现在空集合，
    // 此时不动高亮（对齐原版"无有效项则不highlightItem"）
    if (next !== undefined) {
      setHighlightedValue(next);
      if (directChoose) {
        onChoose?.(next);
      }
    }
    return true;
  };

  /** 展开态导航键：仅移动高亮（选定交由Enter/Tab等分支或调用方处理） */
  const handleNavigationKey = (key: string): boolean => moveHighlight(key, false);

  useDismissablePopover({
    enabled: open,
    onClose,
    ignore,
    onEscape: () => {
      // 收起时清除高亮（导航起点随收起复位，避免污染下次导航）。原版ESCAPE分支仅在
      // 非多选时清除（`!this.multiselect`），本hook统一清除：多选消费者TagMultiselect
      // 自身也有"关闭即清高亮"的处理，两侧可观察行为一致
      setHighlightedValue(undefined);
      onEscape?.();
    },
  });

  /**
   * 触发元素keydown时对菜单键位的统一消费（对齐原版菜单可见期绑定document keydown）：
   * 命中即preventDefault+stopPropagation（对齐原版handled分支，祖先节点不再收到该键）。
   * 展开态——导航键移动高亮；Tab为原版MenuSelectWidget的TAB分支特例：存在未选中的高亮项
   * 时提交选定并阻止移出焦点，否则仅收起放行Tab正常移出；两条路径都收起菜单（原版TAB分支
   * chooseItem后无条件toggle(false)），故提交路径在onChoose后统一onClose——TagMultiselect的
   * onChoose是切换语义、不收起菜单，其余消费方的onChoose已收起，此处再调一次是幂等的。
   * 收起态——仅screenReaderMode（原版Dropdown聚焦期）接管，导航键直接改选；
   * 原版的TAB/ESCAPE分支都以菜单可见为前提，故这两个键在收起态一概放行。
   * 返回是否消费了按键
   */
  const consumeNavigationKey = (
    event: Pick<ReactKeyboardEvent, "key" | "preventDefault" | "stopPropagation">,
  ): boolean => {
    if (!open) {
      if (!screenReaderMode || !moveHighlight(event.key, true)) {
        return false;
      }
      event.preventDefault();
      event.stopPropagation();
      return true;
    }
    if (event.key === "Tab") {
      const chosen =
        navigationValue !== undefined &&
        (isSelectedValue
          ? isSelectedValue(navigationValue)
          : navigationValue === selectedValue);
      if (onChoose && navigationValue !== undefined && !chosen) {
        event.preventDefault();
        event.stopPropagation();
        onChoose(navigationValue);
        // 不依赖onChoose收起：原版TAB分支在chooseItem后无条件toggle(false)
        onClose();
        return true;
      }
      onClose();
      return false;
    }
    if (!handleNavigationKey(event.key)) {
      return false;
    }
    event.preventDefault();
    event.stopPropagation();
    return true;
  };

  // 前缀跳转的document keypress监听：缓冲状态与计时器由usePrefixSearchBuffer管理
  // （键盘通道停用期随effect teardown清空，对齐原版onToggle的clearKeyPressBuffer）；
  // values/起点/取文本/开合与选定经ref读取最新，避免监听随渲染反复重挂
  const searchStateRef = useLatestRef({
    values,
    navigationValue,
    selectedValue,
    getItemText,
    open,
    onChoose,
  });
  // 依赖只用启用布尔量：函数身份每次渲染可变，故其余入参经ref读取
  const prefixSearchEnabled = getItemText !== undefined;
  // 键盘通道活跃期：菜单展开，或收起但处于screenReaderMode（Dropdown聚焦期）
  const keyboardActive = open || screenReaderMode;
  useEffect(() => {
    if (!keyboardActive || !prefixSearchEnabled) {
      return;
    }
    const handleKeyPress = (event: globalThis.KeyboardEvent) => {
      // IME合成期按键不推进前缀缓冲
      if (isComposingKeyEvent(event)) {
        return;
      }
      if (!event.charCode) {
        // 对齐原版：退格裁剪缓冲并阻止默认（非可打印的其他键一概放行）
        if (event.key === "Backspace" && prefixSearch.backspace()) {
          event.preventDefault();
        }
        return;
      }
      const {
        values: liveValues,
        navigationValue: highlighted,
        selectedValue: selected,
        getItemText: getText,
        open: liveOpen,
        onChoose: choose,
      } = searchStateRef.current;
      if (!getText) {
        return;
      }
      // 导航起点对齐原版onDocumentKeyPress（`(isVisible()&&highlighted)||(!multiselect&&selected)`）：
      // 菜单可见时为高亮项、无高亮回退选中项；收起态高亮项被isVisible门控排除、恒为选中项
      const current = liveOpen ? highlighted : selected;
      const next = prefixSearch.advance(
        String.fromCodePoint(event.charCode),
        liveValues,
        (optionValue) => getText(optionValue),
        current,
      );
      if (next !== undefined) {
        setHighlightedValue(next);
        // 菜单收起时命中即选定（原版onDocumentKeyPress：isVisible为假的chooseItem分支）
        if (!liveOpen) {
          choose?.(next);
        }
      }
      // 缓冲推进后阻止默认（对齐原版onDocumentKeyPress命中可打印字符后的preventDefault，
      // oojs-ui.js:7716-7719）：空格不再滚动页面、不产生默认的文本插入动作。
      // 原版还调stopPropagation（且监听在document捕获相位），会把事件拦在目标元素之前；
      // 本工程有意走冒泡（局部化，见DEVIATIONS「等效替代」的菜单键盘通道条），
      // 故不照搬——代价是目标与祖先的keypress监听者仍会收到该事件
      event.preventDefault();
    };
    document.addEventListener("keypress", handleKeyPress);
    return () => {
      document.removeEventListener("keypress", handleKeyPress);
      prefixSearch.clear();
    };
  }, [keyboardActive, prefixSearchEnabled, searchStateRef, prefixSearch]);

  return {
    highlightedValue,
    setHighlightedValue,
    /** 导航起点（高亮||选中）：供调用方Enter分支选定（对齐原版chooseItem(currentItem)） */
    navigationValue,
    handleNavigationKey,
    consumeNavigationKey,
    /**
     * 前缀缓冲是否活跃（对齐原版DropdownWidget.onKeyDown SPACE分支的
     * `keyPressBuffer === ''`守卫）：活跃期内空格属于type-to-search而非开合键
     */
    hasTypeAheadBuffer: prefixSearch.hasBuffer,
  };
}

/**
 * 直选型选项组的键盘改选（TabSelect/RadioSelect/ButtonSelect共用）。
 * 对齐原版`SelectWidget.onDocumentKeyDown`的直接改选形态：↑↓←→在可选值间环绕移动并直接改选
 * （选项无高亮态），无选中项时↓自首项、↑自末项起步；Enter重申当前选中项（值未变化故不提交，
 * 无选中项不响应）；Home/End/PageUp/PageDown不消费（static.handleNavigationKeys=false）。
 * 仅消费上述按键，其余交还原生行为
 */
export function useGroupKeyboardSelection<T extends string | number>({
  disabled,
  selectableValues,
  value,
  onCommit,
}: {
  /** 组禁用：禁用时所有按键不响应 */
  disabled?: boolean;
  /** 可选值序列（非禁用项，按展示顺序） */
  selectableValues: T[];
  /** 当前选中值 */
  value: T | undefined;
  /** 改选回调（仅值变化时调用：Enter重申当前项、组内仅一个可选值时方向键环绕回自身均不触发） */
  onCommit: (value: T) => void;
}): KeyboardEventHandler<HTMLElement> {
  return (e) => {
    if (disabled || !selectableValues.length) {
      return;
    }
    const currentIndex = value === undefined ? -1 : selectableValues.indexOf(value);
    let next: T | undefined;
    let handled = false;
    switch (e.key) {
      case "Enter":
        if (currentIndex !== -1) {
          next = selectableValues[currentIndex];
          handled = true;
        }
        break;
      case "ArrowUp":
      case "ArrowLeft":
      case "ArrowDown":
      case "ArrowRight":
        next = findRelativeSelectableItem(
          selectableValues,
          value,
          e.key === "ArrowUp" || e.key === "ArrowLeft" ? -1 : 1,
        );
        handled = true;
        break;
    }
    // 对齐原版SelectWidget.selectItem对已选中项的提前返回（不派发select事件）
    if (next !== undefined && next !== value) {
      onCommit(next);
    }
    if (handled) {
      e.preventDefault();
      e.stopPropagation();
    }
  };
}
