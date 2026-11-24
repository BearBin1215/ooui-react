import { useCallback, useEffect, useMemo, useRef, useState, type RefObject } from "react";
import { useInputFilteredOptions, useMenuPopup, useSelectableValues } from "../../hooks";
import { warnOnceInDev } from "../../utils";
import type { SelectOptionProps } from "../Select";
import { tagDisplayLabel, tagMatchText, type TagOptionProps } from "./tagModel";

/** 空选项集常量：非菜单形态（TagMultiselect基础形态）options为undefined时的稳定引用 */
const NO_OPTIONS: TagOptionProps[] = [];

/** 富内容标签缺 labelText 的开发期提示（同一选项只告警一次） */
function warnUnmatchedTagOption(option: TagOptionProps) {
  warnOnceInDev(
    `tag-multiselect:labelText:${String(option.value)}`,
    "TagMultiselect: 富内容 label 未提供 labelText，该选项不参与菜单前缀过滤。" +
      `（value: ${String(option.value)}）`,
  );
}

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
   * 组件合法性（不含聚焦抑制的规则：全部标签合法且输入框无未提交文本）。聚焦驱动的菜单
   * 展开在非法态不自动高亮，对齐原版MenuTagMultiselectWidget.onInputFocus聚焦前抓取
   * isValid、开启菜单后清除刚设高亮的净效果
   */
  widgetValid: boolean;
}

/**
 * 标签多选的菜单交互域（MenuTagMultiselect的候选菜单）：选项过滤、开合状态、
 * useMenuPopup的键盘处理与这三个高亮时机（收起清高亮/刚开启高亮首个可选项/过滤后原高亮项
 * 仍在结果内则保留、否则高亮首个匹配项），以及菜单项与标签的切换选定。
 * `enabled`为false（TagMultiselect基础形态）时开合始终关闭、过滤集为空，各行为静默。
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

  // 展开帧快照、前缀匹配与分组隐藏走菜单域的共用实现（本组件没有分组标题）
  const { filtered } = useInputFilteredOptions({
    options: options ?? NO_OPTIONS,
    open,
    inputValue,
    getMatchText: tagMatchText,
    warnUnmatched: warnUnmatchedTagOption,
  });

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

  // 菜单开合与键盘高亮（端点钳制不环绕）；开启时点击外部/Escape关闭。基础形态open始终为false。
  // 不传getItemText：本组件有输入框，原版前缀跳转只绑定无$input的菜单，不启用。
  // 不传selectedValue：原版多选菜单的键盘路径对选定项无回退（SelectWidget.onDocumentKeyDown
  // 的currentItem带`!this.multiselect`门，oojs-ui.js:7520-7522；MenuSelectWidget自身
  // `findHighlightedItem() || findFirstSelectedItem()`只服务TAB/ESCAPE分支，对多选形态
  // 均为无操作），导航起点始终为高亮项
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
  // （对齐原版toggle(false)分支的`lastHighlightedItem = null`，dist/oojs-ui.js:8993）
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
    // 此处改写会让随后的Enter作用在首个选项上（对齐原版onTagSelect末尾的highlightItem(menuItem)）
    if (!justOpened || !enabled || allowArbitrary || highlightedValue !== undefined) {
      return;
    }
    lastAutoHighlightedRef.current = menuSelectableValues[0];
    // 非法态（输入框有未提交文本或存在非法标签）的聚焦驱动展开不自动高亮：对齐原版
    // MenuTagMultiselectWidget.onInputFocus在toggle(true)后对聚焦前已非法的widget执行
    // 无参highlightItem()清除刚设的高亮（oojs-ui.js:20250-20265）的净效果。仅记录自动
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
