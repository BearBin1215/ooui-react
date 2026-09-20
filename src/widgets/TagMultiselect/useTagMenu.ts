import { useCallback, useEffect, useMemo, useRef, useState, type RefObject } from "react";
import { useMenuPopup, useSelectableValues } from "../../hooks";
import { normalizeForMatching, warnOnceInDev } from "../../utils";
import type { SelectOptionProps } from "../Select";
import { tagDisplayLabel, tagMatchText, type TagOptionProps } from "./tagModel";

/** 菜单域所需的值模型切片（useTagValues的返回） */
export interface TagMenuModelSlice {
  /** 当前标签值集合 */
  currentValue: (string | number)[];

  /** 追加标签（准入判定在模型内完成） */
  addTag: (data: string | number) => boolean;

  /** 移除首个匹配值的标签 */
  removeTagByValue: (data: string | number) => void;
}

export interface UseTagMenuParams {
  /** 是否启用菜单域（TagMultiselect基础形态为false，菜单域全部行为静默） */
  enabled: boolean;

  /** 菜单选项集 */
  options: TagOptionProps[] | undefined;

  /** 输入框的临时文本（过滤依据） */
  inputValue: string;

  /** 清空输入文本（选定后清过滤、Escape附加动作） */
  setInputValue: (value: string) => void;

  /** 允许任意值（对齐原版highlightOnFilter/allowArbitrary的联动） */
  allowArbitrary: boolean;

  /** 选定菜单项后是否清空输入框的过滤文本 */
  clearInputOnChoose: boolean;

  /** 是否有输入框（决定选定后是否清过滤文本、焦点陷阱归属） */
  hasInput: boolean;

  /** 组件根元素（浮层关闭的忽略目标之一） */
  rootRef: RefObject<HTMLDivElement | null>;

  /** 菜单面板元素（浮层关闭的忽略目标之一） */
  menuRef: RefObject<HTMLDivElement | null>;

  /** 值模型切片（useTagValues的返回） */
  model: TagMenuModelSlice;

  /**
   * 组件合法性（不含聚焦抑制的口径：全部标签合法且输入框无未提交文本）。聚焦驱动的菜单
   * 展开在非法态不自动高亮，对齐原版MenuTagMultiselectWidget.onInputFocus聚焦前抓取
   * isValid、开启菜单后清除刚设高亮的净效果
   */
  widgetValid: boolean;
}

/**
 * 标签多选的菜单交互域（MenuTagMultiselect的候选菜单）：选项过滤、开合状态、
 * useMenuPopup键盘接线与三个高亮时机（收起清高亮/刚开启高亮首个可选项/过滤后原高亮项
 * 仍在结果内则保留、否则高亮首个匹配项），以及菜单项与标签的切换选定。
 * `enabled`为false（TagMultiselect基础形态）时开合恒闭、过滤集为空，各行为静默。
 * 菜单的焦点归属元素由组件渲染MenuSelect时直传（useTagMenu不消费）
 */
export function useTagMenu({
  enabled,
  options,
  inputValue,
  setInputValue,
  allowArbitrary,
  clearInputOnChoose,
  hasInput,
  rootRef,
  menuRef,
  model,
  widgetValid,
}: UseTagMenuParams) {
  const { currentValue, addTag, removeTagByValue } = model;
  const [open, setOpen] = useState(false);

  // 打开帧的输入值快照（对齐原版MenuSelectWidget.toggle(true)先取previouslySelectedValue）：
  // 当前输入与快照一致时显示全量，自打开后的首次编辑起才按输入过滤——输入框带残留文本
  // （如点击标签回填后重开）时打开帧不再筛空候选。快照随open跃迁在渲染期调整（渲染期调整
  // state，不用ref：被丢弃的渲染会把ref带偏）
  const [openFrameInput, setOpenFrameInput] = useState("");
  const [prevOpen, setPrevOpen] = useState(open);
  if (open !== prevOpen) {
    setPrevOpen(open);
    if (open) {
      setOpenFrameInput(inputValue);
    }
  }

  /**
   * 菜单选项的过滤结果（对齐原版filterFromInput的标签前缀匹配；打开帧恒全量）。
   * `unmatchedValues`收集因缺纯文本匹配键而被排除的选项，供告警通道报出——过滤本身须保持
   * 渲染期无副作用，告警另经effect发出
   */
  const { filtered, query, unmatchedValues } = useMemo(() => {
    const source = options ?? [];
    // showAll对齐原版`!isVisible() || previouslySelectedValue === $input.val()`：关闭期恒全量
    // （菜单不可见，仅免算），展开期与打开帧快照一致时也恒全量，自首次编辑起偏离快照才过滤
    const showAll = !open || inputValue === openFrameInput;
    // 输入与匹配键两侧同口径归一化（原版getItemMatcher的行为），与Select前缀跳转一致
    const normalizedQuery = showAll ? "" : normalizeForMatching(inputValue);
    if (!normalizedQuery) {
      return { filtered: source, query: "", unmatchedValues: [] as (string | number)[] };
    }
    // 过滤按纯文本匹配键（对齐原版getMatchText），显示走富内容label
    const unmatched: (string | number)[] = [];
    const matched = source.filter((option) => {
      // 富标签未给labelText的选项无纯文本匹配键，不参与前缀过滤（语义见tagMatchText）
      const matchText = tagMatchText(option);
      if (matchText === undefined) {
        unmatched.push(option.value);
        return false;
      }
      return normalizeForMatching(matchText).startsWith(normalizedQuery);
    });
    return { filtered: matched, query: normalizedQuery, unmatchedValues: unmatched };
    // open与快照参与依赖：打开瞬间快照刚更新，须重算使打开帧取到全量（仅凭input变化不触发）
  }, [options, inputValue, open, openFrameInput]);

  // 富内容label缺labelText时开发期告警一次（同值只告警一次，故effect反复触发无妨）
  useEffect(() => {
    if (!query) {
      return;
    }
    for (const optionValue of unmatchedValues) {
      warnOnceInDev(
        `tag-multiselect:labelText:${String(optionValue)}`,
        "TagMultiselect: 富内容 label 未提供 labelText，该选项不参与菜单前缀过滤。" +
          `（value: ${String(optionValue)}）`,
      );
    }
  }, [query, unmatchedValues]);

  /** 菜单选项（过滤结果的渲染形态：显示走富内容label） */
  const menuSelectOptions: SelectOptionProps[] = useMemo(
    () =>
      filtered.map((option) => ({
        value: option.value,
        icon: option.icon,
        disabled: option.disabled,
        children: tagDisplayLabel(option, option.value),
      })),
    [filtered],
  );

  const { values: menuSelectableValues } = useSelectableValues(menuSelectOptions);

  /** 选定菜单项：已有对应标签则移除，否则添加（对齐原版onMenuChoose的切换语义） */
  const handleMenuChoose = useCallback(
    (optionValue: string | number) => {
      if (currentValue.includes(optionValue)) {
        removeTagByValue(optionValue);
      } else {
        addTag(optionValue);
      }
      if (hasInput && clearInputOnChoose) {
        setInputValue("");
      }
    },
    [currentValue, removeTagByValue, addTag, hasInput, clearInputOnChoose, setInputValue],
  );

  // 菜单开合与键盘高亮（端点钳制不环绕）；开启时点击外部/Escape关闭。基础形态open恒false。
  // 不传getItemText：本组件有输入框，原版前缀跳转只绑定无$input的菜单，不启用。
  // 不传selectedValue：原版多选菜单的键盘路径对选定项无回退（SelectWidget.onDocumentKeyDown
  // 的currentItem带`!this.multiselect`门，oojs-ui.js:7518-7520；MenuSelectWidget自身
  // `findHighlightedItem() || findFirstSelectedItem()`只服务TAB/ESCAPE分支，对多选形态
  // 均为无操作），导航起点恒为高亮项
  const {
    highlightedValue,
    setHighlightedValue,
    navigationValue,
    handleNavigationKey,
    consumeNavigationKey,
  } = useMenuPopup<string | number>({
    open: enabled && open,
    onClose: () => setOpen(false),
    values: menuSelectableValues,
    ignore: [rootRef, menuRef],
    // 菜单开启时Escape在捕获层被吞（收不到keydown），清空输入须经附加回调（对齐原版doInputEscape）
    onEscape: () => setInputValue(""),
    // Tab提交高亮所需（原版TAB分支的chooseItem→onMenuChoose切换语义）；
    // 已选定判定按标签集合（原版currentItem.isSelected()）
    onChoose: handleMenuChoose,
    isSelectedValue: (optionValue) => currentValue.includes(optionValue),
  });

  // 上次自动写下的高亮项（对齐原版lastHighlightedItem：用户经↑↓移动的高亮不算）——
  // 过滤后是否改高亮以它为守卫
  const lastAutoHighlightedRef = useRef<string | number | undefined>(undefined);

  // 收起帧的输入值快照：展开帧输入值与快照一致说明本轮展开非编辑驱动（聚焦/点击标签/
  // 方向键展开——原版对应onInputFocus/onTagSelect路径），收起后键入的编辑驱动展开
  // （原版onInputChange路径）不带聚焦展开的非法门（见下方刚开启高亮effect）
  const inputAtCloseRef = useRef(inputValue);
  useEffect(() => {
    if (!open) {
      inputAtCloseRef.current = inputValue;
    }
  }, [open, inputValue]);

  // 菜单收起时清除高亮（对齐原版onMenuToggle的highlightItem(null)）与自动高亮记录
  // （对齐原版toggle(false)分支的`lastHighlightedItem = null`，dist/oojs-ui.js:8990）
  useEffect(() => {
    if (!open) {
      lastAutoHighlightedRef.current = undefined;
      setHighlightedValue(undefined);
    }
  }, [open, setHighlightedValue]);

  // 菜单开启时高亮首个可选项（对齐原版MenuSelectWidget：开启时绑定输入框编辑事件并立即按
  // 当前输入值过滤，`highlightOnFilter` 分支此时无高亮项故取首个可选项；`highlightOnFilter`
  // 缺省即 `!allowArbitrary`）。关闭时高亮已由上一条effect清除，故此处只在"刚打开"这一时机
  // 介入——不随渲染或鼠标事件重设，以免与Select的悬停/移出行为相争
  const wasOpenRef = useRef(false);
  useEffect(() => {
    const justOpened = open && !wasOpenRef.current;
    wasOpenRef.current = open;
    // 已有高亮时不覆盖：点击标签经onTagSelect会先聚焦输入框（连带开启菜单）再指定高亮项，
    // 此处改写会让随后的Enter落到首个选项上（对齐原版onTagSelect末尾的highlightItem(menuItem)）
    if (!justOpened || !enabled || allowArbitrary || highlightedValue !== undefined) {
      return;
    }
    lastAutoHighlightedRef.current = menuSelectableValues[0];
    // 非法态（输入框有未提交文本或存在非法标签）的聚焦驱动展开不自动高亮：对齐原版
    // MenuTagMultiselectWidget.onInputFocus在toggle(true)后对聚焦前已非法的widget执行
    // 无参highlightItem()清除刚设的高亮（oojs-ui.js:20233-20248）的净效果。仅记录自动
    // 高亮项不写高亮——原版highlightItem()不清lastHighlightedItem，同一开启期内的过滤
    // 自动高亮仍被下方「上次自动高亮项可选」守卫压制，Enter随之走提交已键入文本路径。
    // 收起后键入的编辑驱动展开（原版onInputChange路径）不带此门
    if (widgetValid || inputValue !== inputAtCloseRef.current) {
      setHighlightedValue(menuSelectableValues[0]);
    }
  }, [
    enabled,
    open,
    allowArbitrary,
    highlightedValue,
    widgetValid,
    inputValue,
    menuSelectableValues,
    setHighlightedValue,
  ]);

  // 过滤后的高亮（对齐原版highlightOnFilter）：上次自动高亮的项仍可选时不改写（原版守卫为
  // `!(lastHighlightedItem && lastHighlightedItem.isSelectable())`），否则改高亮首个匹配项；
  // allowArbitrary时不自动高亮。仅展开期介入（原版该路径有isVisible()门，收起期不写高亮）
  useEffect(() => {
    if (!enabled || !open || allowArbitrary || !inputValue) {
      return;
    }
    const lastAuto = lastAutoHighlightedRef.current;
    if (lastAuto !== undefined && menuSelectableValues.includes(lastAuto)) {
      return;
    }
    const first = menuSelectableValues[0];
    lastAutoHighlightedRef.current = first;
    setHighlightedValue(first);
  }, [
    enabled,
    open,
    allowArbitrary,
    inputValue,
    menuSelectableValues,
    setHighlightedValue,
  ]);

  return {
    open,
    /** 开合由组件的输入框聚焦/编辑与满额兜底驱动，菜单域自身只经onClose收起 */
    setOpen,
    menuSelectOptions,
    highlightedValue,
    setHighlightedValue,
    /** 导航起点（高亮优先，无选中回退——理由见useMenuPopup调用处注释） */
    navigationValue,
    handleMenuChoose,
    handleNavigationKey,
    consumeNavigationKey,
  } as const;
}
