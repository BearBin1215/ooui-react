import {
  forwardRef,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ChangeEvent,
  type DragEvent,
  type KeyboardEvent,
  type MouseEvent,
} from "react";
import clsx from "clsx";
import { IconBase } from "../Icon/Base";
import { IndicatorBase } from "../Indicator/Base";
import { TagItem } from "../TagItem";
import { MenuSelect } from "../MenuSelect";
import {
  elementHiddenClasses,
  flaggedElementClasses,
  getTextInputClassName,
  getWidgetClassName,
  mergeAriaLabelledBy,
  mergeInvalidFlag,
  resolveTabIndex,
  toFlagArray,
} from "../../mixins";
import { getElementDir, isComposingKeyEvent, type ChangeHandler } from "../../utils";
import {
  useCleanId,
  useFieldLabelFocus,
  useLatestRef,
  useCallbackByKey,
} from "../../hooks";
import type { WidgetProps } from "../Widget";
import type { FlaggedElement, IconElement, IndicatorElement } from "../../Element";
import type { TagInputPosition, TagOptionProps } from "./tagModel";
import { useDraggableKeys } from "./useDraggableKeys";
import { useInlineInputWidth } from "./useInlineInputWidth";
import { useTagValues } from "./useTagValues";
import { useTagMenu } from "./useTagMenu";

// 契约类型与标签域纯函数定义于tagModel.ts（供useTagValues/useTagMenu取用而不反向依赖本组件），
// 此处转发导出
export type { TagInputPosition, TagOptionProps } from "./tagModel";
export { pickValidTags } from "./tagModel";

export interface TagMultiselectProps
  extends
    Omit<WidgetProps<HTMLDivElement>, "children" | "onChange">,
    IconElement,
    IndicatorElement,
    FlaggedElement {
  /**
   * Tag value set (controlled; passing it enables controlled mode).
   *
   * 标签值集合（受控，传入即受控模式）
   */
  value?: (string | number)[];

  /**
   * Initial value for uncontrolled use
   *
   * 非受控初始值
   */
  defaultValue?: (string | number)[];

  /**
   * Add/remove callback (value-first, returns the scalar array).
   *
   * 标签增删回调（值优先，回传标量数组）
   */
  onChange?: ChangeHandler<(string | number)[]>;

  /**
   * Invalid-tag set change callback (read-only, doesn't change the value): gives the
   * invalid tag values in tag order (repeats beyond the first, values outside the
   * legal range), an empty array when all are legal; fires only on change, not on
   * the first render. Not the same as the component's overall invalid flag, which
   * also covers uncommitted text in the input.
   *
   * 非法标签集变化回调（只读派生，不改值）：以标签顺序给出非法标签值（重复的非首次出现、
   * 不在合法值域内的值），全部合法时为空数组；内容变化时才触发，首个渲染不触发。
   * 注意与组件整体的非法标志不等价——后者还包含「输入框内有未提交文本」的情形
   */
  onInvalidTagsChange?: (invalidValues: (string | number)[]) => void;

  /**
   * Input position.
   *
   * 输入框位置
   *
   * @default 'inline'
   */
  inputPosition?: TagInputPosition;

  /**
   * Allow arbitrary values (skips the range test).
   *
   * 允许任意值（跳过值域判定）
   *
   * @default false
   */
  allowArbitrary?: boolean;

  /**
   * Allow repeated values.
   *
   * 允许重复值
   *
   * @default false
   */
  allowDuplicates?: boolean;

  /**
   * Allow drag reordering; when off, tags can't be dragged and new tags are inserted
   * at their whitelist position instead of appended.
   *
   * 允许拖拽重排。关闭时标签不可拖拽，且新增标签按白名单的给定顺序插入而非追加
   *
   * @default true
   */
  allowReordering?: boolean;

  /**
   * Legal-value whitelist; merged with menu option values to form the allowed
   * range (the only source when there is no menu).
   *
   * 合法值白名单，与菜单选项值合并构成合法值域（无菜单时为唯一值域来源）
   */
  allowedValues?: (string | number)[];

  /**
   * Keep invalid values shown as tags (flagged invalid, the whole group marked
   * invalid too); when off, invalid values are rejected.
   *
   * 允许展示非法标签：不合法/重复的值仍以标签呈现（输出 invalid 标志，整体随之标记为
   * 非法）；关闭时非法值不予添加
   *
   * @default false
   */
  allowDisplayInvalidTags?: boolean;

  /**
   * Maximum tag count; input is disabled once reached.
   *
   * 标签数量上限；达到后输入禁用、不再新增
   */
  tagLimit?: number;

  /**
   * Allow clicking a tag to edit it in place.
   *
   * 允许点击标签回填编辑
   *
   * @default true
   */
  allowEditTags?: boolean;

  /**
   * Input placeholder
   *
   * 输入框占位符
   */
  placeholder?: string;

  /**
   * Input `name`
   *
   * 输入框 name 属性
   */
  name?: string;
}

/**
 * TagMultiselect的内部组合形态参数（MenuTagMultiselect经相对路径使用，不进公开导出面）：
 * options传入即启用候选菜单（菜单模式，对应原版OO.ui.MenuTagMultiselectWidget），
 * 常规使用请走MenuTagMultiselect，勿直接在TagMultiselect上传入
 */
export interface TagMultiselectInternalProps extends TagMultiselectProps {
  /**
   * 菜单选项集：输入即过滤菜单、↑↓移动高亮、Enter选定高亮项、点击切换标签、
   * 已添加标签的菜单项呈选中态；未开启`allowArbitrary`时菜单选项构成标签的合法值域
   */
  options?: TagOptionProps[];

  /**
   * 选定菜单项后是否清空输入框的过滤文本（仅菜单模式生效）
   *
   * @default true
   */
  clearInputOnChoose?: boolean;
}

// 实现说明：对齐原版OO.ui.TagMultiselectWidget——自由输入/白名单校验、重复与数量限制、
// 点击标签回填编辑、Backspace移除末尾标签、←→在标签间与输入框间导航、非法标签以invalid态
// 呈现、拖拽重排；输入框内的Enter提交为新标签、Escape清空。菜单能力经options内部通道由
// MenuTagMultiselect组合（useTagMenu域），本组件自身不感知菜单
/**
 * A tag input: values are shown as removable chips. Free-entry form — for
 * "type to filter + dropdown candidates" use MenuTagMultiselect.
 *
 * 标签输入：把值以可移除的标签（chip）呈现。自由输入形态，需要“输入过滤 + 下拉候选”时用
 * MenuTagMultiselect。
 *
 * @see https://bearbin1215.github.io/ooui-react/components/tag-multiselect/index.html
 */
export const TagMultiselect = forwardRef<HTMLDivElement, TagMultiselectInternalProps>(
  (
    {
      className,
      disabled,
      icon,
      indicator,
      flags,
      value,
      defaultValue,
      onChange,
      onInvalidTagsChange,
      inputPosition: inputPositionProp = "inline",
      allowArbitrary = false,
      allowDuplicates = false,
      allowReordering = true,
      allowedValues,
      allowDisplayInvalidTags = false,
      tagLimit,
      allowEditTags = true,
      placeholder,
      name,
      options,
      clearInputOnChoose = true,
      tabIndex,
      "aria-labelledby": ariaLabelledBy,
      ...rest
    },
    ref,
  ) => {
    const isMenu = options !== undefined;
    // 非法位置回退inline（对齐原版allowedInputPositions白名单）
    const inputPosition: TagInputPosition =
      inputPositionProp === "outline" || inputPositionProp === "none"
        ? inputPositionProp
        : "inline";
    const hasInput = inputPosition !== "none";

    /**
     * 输入框内的临时文本（非组件值，仅用于键入/过滤），Enter或失焦时提交为标签
     */
    const [inputValue, setInputValue] = useState("");
    /**
     * 输入框聚焦态：聚焦时清除整体非法标记（对齐原版onInputFocus的toggleValid(true)）
     */
    const [focused, setFocused] = useState(false);

    const inputRef = useRef<HTMLInputElement>(null);
    const focusTrapRef = useRef<HTMLSpanElement>(null);
    // 菜单的焦点归属元素：有输入框时是输入框、无输入（inputPosition='none'）时是焦点陷阱span
    const menuFocusOwnerRef = hasInput ? inputRef : focusTrapRef;
    // 菜单id：焦点归属元素经aria-owns声明所拥有的菜单（展开期写入、收起移除，对齐原版
    // MenuSelectWidget.onToggle的写/移除稳态，与Dropdown/ComboBoxInput/ButtonMenuSelectWidget
    // 三处触发组件的写/移除口径一致）。id一律经useCleanId生成（含`:`的id在CSS选择器中非法，
    // 见hooks/refs.ts）
    const menuId = useCleanId();
    const groupRef = useRef<HTMLDivElement>(null);
    const contentRef = useRef<HTMLDivElement>(null);
    const menuRef = useRef<HTMLDivElement>(null);
    const outlineWrapperRef = useRef<HTMLDivElement>(null);

    /**
     * 聚焦输入框；无输入时聚焦焦点陷阱（对齐原版TabIndexedElement.focus落于$tabIndexed）
     */
    const focusInput = useCallback(() => {
      if (hasInput) {
        inputRef.current?.focus();
      } else {
        focusTrapRef.current?.focus();
      }
    }, [hasInput]);

    // FieldLayout标签联动（通道B）：TagMultiselect无getInputId，点击标签聚焦输入框
    // （对齐原版simulateLabelClick=TabIndexedElement.focus）
    const { setRef, rootRef, fieldLabelId } = useFieldLabelFocus<HTMLDivElement>({
      ref,
      disabled,
      activate: () => focusInput(),
    });

    // ── 值模型域：受控/非受控值、标签项派生、合法性与增删操作（useTagValues） ──
    const model = useTagValues({
      value,
      defaultValue,
      onChange,
      onInvalidTagsChange,
      options,
      allowedValues,
      allowArbitrary,
      allowDuplicates,
      allowDisplayInvalidTags,
      tagLimit,
      reorderDisabled: !allowReordering,
    });
    const {
      currentValue,
      commit,
      items,
      underLimit,
      labelTextOf,
      buildAdded,
      removeTagAt,
    } = model;

    const allItemsValid = items.every((item) => item.valid);
    /**
     * 合法性判定（不含聚焦抑制）：全部标签合法且输入框无未提交文本（对齐原版
     * TagMultiselectWidget.onInputBlur的toggleValid实参口径）。失焦后的整体非法标志与
     * 聚焦开启菜单时的自动高亮门控共用
     */
    const widgetValid = allItemsValid && (!hasInput || inputValue === "");

    // ── 菜单交互域：过滤/开合/高亮/切换选定（useTagMenu，基础形态静默） ──
    const menu = useTagMenu({
      enabled: isMenu,
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
    });
    const {
      open,
      setOpen,
      menuSelectOptions,
      highlightedValue,
      setHighlightedValue,
      navigationValue,
    } = menu;

    /**
     * 组件整体合法性：聚焦时视为合法（对齐原版onInputFocus的toggleValid(true)）；
     * 失焦时取widgetValid（对齐原版onInputBlur的toggleValid实参）
     */
    const widgetInvalid = !(focused || widgetValid);

    /**
     * 聚焦第index个标签元素
     */
    const focusTagAt = (index: number) => {
      groupRef.current
        ?.querySelectorAll<HTMLElement>(".oo-ui-tagItemWidget")
        [index]?.focus();
    };

    // 满额时清空输入并收起菜单（对齐原版onChangeTags的isUnderLimit分支）
    useEffect(() => {
      if (!underLimit) {
        setInputValue("");
        setOpen(false);
      }
    }, [underLimit, setOpen]);

    // inline输入框宽度自适应（对齐原版updateInputSize）：标签集合、输入值与容器宽度变化时重算
    useInlineInputWidth({
      enabled: inputPosition === "inline" && !disabled,
      contentRef,
      inputRef,
      placeholder,
      value: inputValue,
      recomputeKey: items,
    });

    // ── 拖拽重排：状态机见useDraggableKeys（对齐原版DraggableElement/DraggableGroupElement）──
    /**
     * 项的稳定key（值+出现次数，重复值亦可区分）
     */
    const keyOf = (item: { value: string | number; occurrence: number }) =>
      `${item.value}#${item.occurrence}`;

    // 固定标签作为屏障项：自身不可拖拽，且非固定项不得被拖到它之前
    const barrierKeys = useMemo(
      () => new Set(items.filter((item) => item.fixed).map(keyOf)),
      [items],
    );
    const { draggingKey, dragPhase, previewKeys, startDrag, handleDragOver, endDrag } =
      useDraggableKeys({
        keys: items.map(keyOf),
        enabled: allowReordering && !disabled,
        isBarrier: (key) => barrierKeys.has(key),
      });

    /**
     * 渲染项：拖拽预览期间按预览顺序输出，其余情况按实际顺序
     */
    const renderItems = useMemo(() => {
      const entries = items.map((item, realIndex) => ({
        item,
        realIndex,
        key: keyOf(item),
      }));
      if (!previewKeys) {
        return entries;
      }
      const byKey = new Map(entries.map((entry) => [entry.key, entry]));
      const ordered = previewKeys
        .map((key) => byKey.get(key))
        .filter((entry): entry is (typeof entries)[number] => entry !== undefined);
      // 预览顺序须覆盖全部项，否则回退实际顺序（拖拽期间项集合变化的兜底）
      return ordered.length === entries.length ? ordered : entries;
    }, [items, previewKeys]);

    /**
     * 拖拽结束/放下：预览顺序映射回值数组，顺序变化时提交
     */
    const handleDragEnd = () => {
      const finalKeys = endDrag();
      if (!finalKeys) {
        return;
      }
      const valueByKey = new Map(items.map((item) => [keyOf(item), item.value]));
      const reordered: (string | number)[] = [];
      for (const key of finalKeys) {
        const itemValue = valueByKey.get(key);
        if (itemValue !== undefined) {
          reordered.push(itemValue);
        }
      }
      if (
        reordered.length === currentValue.length &&
        reordered.some((nextValue, index) => nextValue !== currentValue[index])
      ) {
        commit(reordered);
      }
    };

    /**
     * 从输入框解析待添加的标签：菜单模式取高亮菜单项优先于原始输入文本
     * （对齐原版getTagInfoFromInput的`findHighlightedItem() || findItemFromData(val)`）。
     * `useHighlight`为false时忽略高亮，仅提交输入文本
     */
    const getTagInfoFromInput = (
      useHighlight: boolean,
    ): { value: string | number } | null => {
      if (isMenu && useHighlight && highlightedValue !== undefined) {
        return { value: highlightedValue };
      }
      return inputValue ? { value: inputValue } : null;
    };

    /**
     * 提交输入框内容为标签，成功时清空输入框
     */
    const addTagFromInput = (useHighlight = true): boolean => {
      const info = getTagInfoFromInput(useHighlight);
      if (!info) {
        return false;
      }
      const next = buildAdded(currentValue, info.value);
      if (!next) {
        return false;
      }
      commit(next);
      setInputValue("");
      return true;
    };

    const handleInputChange = (event: ChangeEvent<HTMLInputElement>) => {
      setInputValue(event.target.value);
      if (isMenu) {
        setOpen(true);
      }
    };

    const handleInputFocus = () => {
      setFocused(true);
      if (isMenu && underLimit) {
        setOpen(true);
      }
    };

    const handleInputBlur = () => {
      setFocused(false);
      // 先收起菜单（收起即清除高亮，对齐原版MenuTagMultiselect.onMenuToggle）再提交，
      // 且提交时忽略高亮——原版失焦提交发生在菜单收起之后，不会把高亮项当作输入内容提交
      setOpen(false);
      setHighlightedValue(undefined);
      addTagFromInput(false);
    };

    /**
     * 光标是否仍位于输入文本内（决定←→是移动光标还是转向标签导航，对齐原版isMovementInsideInput）
     */
    const isMovementInsideInput = (direction: "backwards" | "forwards"): boolean => {
      const input = inputRef.current;
      if (!input) {
        return true;
      }
      const from = input.selectionStart ?? 0;
      const to = input.selectionEnd ?? 0;
      if (direction === "forwards" && to > inputValue.length - 1) {
        return false;
      }
      if (direction === "backwards" && from <= 0) {
        return false;
      }
      return true;
    };

    const handleInputKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
      if (disabled) {
        return;
      }
      // IME合成期按键（确认候选的Enter、选词的方向键）不驱动菜单与标签提交
      if (isComposingKeyEvent(event)) {
        return;
      }
      // 菜单模式下导航键驱动菜单高亮（对齐原版MenuSelectWidget接管输入框按键）：
      // ↑↓展开并移动高亮；PageUp/PageDown/Tab交consumeNavigationKey；
      // ←→/Home/End让位文本光标（有$input时原版即此），由下方switch处理
      if (isMenu && (event.key === "ArrowDown" || event.key === "ArrowUp")) {
        event.preventDefault();
        setOpen(true);
        menu.handleNavigationKey(event.key);
        return;
      }
      if (
        isMenu &&
        (event.key === "PageUp" || event.key === "PageDown" || event.key === "Tab") &&
        menu.consumeNavigationKey(event)
      ) {
        return;
      }

      switch (event.key) {
        case "Enter": {
          // 菜单开启且导航起点已是标签时走多选切换的移除：对齐原版菜单可见时
          // MenuSelectWidget.onDocumentKeyDown的ENTER分支交由SelectWidget.onDocumentKeyDown
          // 的chooseItem——多选菜单的已选定项先unselectItem再派发choose，经
          // MenuTagMultiselectWidget.onMenuChoose移除对应标签（oojs-ui.js:8624-8632、
          // 7525-7529、8124-8134）；其余情形提交高亮菜单项或输入文本为标签
          event.preventDefault();
          if (
            isMenu &&
            open &&
            navigationValue !== undefined &&
            currentValue.includes(navigationValue)
          ) {
            menu.handleMenuChoose(navigationValue);
          } else {
            addTagFromInput();
          }
          break;
        }
        case "Backspace": {
          // 仅inline位置、输入为空且有标签时处理（对齐原版doInputBackspace）
          if (inputPosition === "inline" && inputValue === "" && items.length > 0) {
            const lastIndex = items.length - 1;
            const lastItem = items[lastIndex];
            if (!lastItem.fixed) {
              event.preventDefault();
              removeTagAt(lastIndex);
              // 未按Ctrl/Cmd时把被移除标签的文本回填输入框以便编辑
              if (!event.metaKey && !event.ctrlKey) {
                setInputValue(labelTextOf(lastItem.value));
              }
            }
          }
          break;
        }
        case "Escape":
          setInputValue("");
          break;
        case "ArrowLeft":
        case "ArrowRight": {
          // 方向按元素有效方向解析：LTR下←向后、→向前，RTL相反
          const isRtl = getElementDir(event.currentTarget) === "rtl";
          const direction =
            (event.key === "ArrowLeft") !== isRtl ? "backwards" : "forwards";
          // 光标已在文本端点时转向标签导航：向后聚焦末尾标签（对齐原版doInputArrow）
          if (
            !isMovementInsideInput(direction) &&
            inputPosition === "inline" &&
            items.length > 0 &&
            direction === "backwards"
          ) {
            focusTagAt(items.length - 1);
          }
          break;
        }
      }
    };

    /**
     * 点击标签：菜单模式（非任意值）在菜单中高亮对应项，否则移回输入框编辑（对齐原版onTagSelect）
     */
    const handleTagSelect = (index: number) => {
      const item = items[index];
      if (!item) {
        return;
      }
      if (isMenu && !allowArbitrary) {
        if (hasInput) {
          setInputValue("");
        }
        focusInput();
        if (underLimit) {
          setOpen(true);
          setHighlightedValue(item.value);
        }
        return;
      }
      if (hasInput && allowEditTags && !item.fixed) {
        // 先加后删（对齐原版TagMultiselectWidget.onTagSelect的addTagFromInput→removeItems
        // 次序，oojs-ui.js:19434-19448）：有输入文本先提交为新标签，tagLimit与合法性准入按
        // 加法时点判定，提交成败不影响随后的删除
        let next = currentValue;
        if (inputValue) {
          const added = buildAdded(next, inputValue);
          if (added) {
            next = added;
          }
        }
        // 被点标签按「值+同类序数」定位后删除：原版removeItems按项引用定位
        // （GroupElement.removeItems，oojs-ui.js:2781），本工程标签为标量值、无项引用可凭，
        // 先加后删时白名单序插入（buildAdded）可能落在被点项之前，按点击时下标删除会漂移
        // 误删他项。序数取旧列表中该值在其之前的出现次数（items[].occurrence），多重集语义
        // 下插入不改变既有项的序数身份
        let ordinal = item.occurrence;
        let removeIndex = -1;
        for (let i = 0; i < next.length; i++) {
          if (next[i] === item.value) {
            if (ordinal === 0) {
              removeIndex = i;
              break;
            }
            ordinal--;
          }
        }
        if (removeIndex !== -1) {
          next = next.filter((_, i) => i !== removeIndex);
        }
        commit(next);
        setInputValue(labelTextOf(item.value));
        focusInput();
      }
    };

    /**
     * 标签间←→导航：向前到末项后交还输入框，向后止于首项（对齐原版onTagNavigate）
     */
    const handleTagNavigate = (index: number, direction: "backwards" | "forwards") => {
      if (direction === "forwards") {
        if (index < items.length - 1) {
          focusTagAt(index + 1);
        } else if (hasInput) {
          focusInput();
        } else {
          focusTagAt(0);
        }
      } else if (index > 0) {
        focusTagAt(index - 1);
      }
    };

    // 标签项回调的按key缓存：闭包经ref读取最新实现、位置参数在触发时按当前项定位，
    // 使TagItem（memo化）的回调props跨渲染稳定——输入过滤/键盘导航等仅引发整组重渲染的
    // 场景下，未变化标签浅比较跳过
    const renderItemsRef = useLatestRef(renderItems);
    const startDragRef = useLatestRef(startDrag);
    const handleDragEndRef = useLatestRef(handleDragEnd);
    const removeTagAtRef = useLatestRef(removeTagAt);
    const handleTagSelectRef = useLatestRef(handleTagSelect);
    const handleTagNavigateRef = useLatestRef(handleTagNavigate);
    const getTagCallbacks = useCallbackByKey((key: string) => {
      // key在当前渲染序中的实际下标（renderItems各entry恒携带realIndex，预览重排不改写）
      const realIndexOf = () =>
        renderItemsRef.current.find((entry) => entry.key === key)?.realIndex ?? -1;
      return {
        onDragStart: (event: DragEvent<HTMLElement>) => {
          startDragRef.current(key, event);
        },
        // onDragEnd与onDrop共用（放下与拖拽中断同路径提交预览顺序）
        onDragEnd: () => {
          handleDragEndRef.current();
        },
        onRemove: () => {
          const realIndex = realIndexOf();
          if (realIndex >= 0) {
            removeTagAtRef.current(realIndex);
          }
        },
        onSelect: () => {
          const realIndex = realIndexOf();
          if (realIndex >= 0) {
            handleTagSelectRef.current(realIndex);
          }
        },
        onNavigate: (direction: "backwards" | "forwards") => {
          const realIndex = realIndexOf();
          if (realIndex >= 0) {
            handleTagNavigateRef.current(realIndex, direction);
          }
        },
      };
    });

    /**
     * 点击handle空白处聚焦输入框（对齐原版onMouseDown；点击输入框自身不处理）
     */
    const handleHandleMouseDown = (event: MouseEvent<HTMLDivElement>) => {
      if (
        !disabled &&
        (!hasInput || event.target !== inputRef.current) &&
        event.button === 0
      ) {
        event.preventDefault();
        event.stopPropagation();
        focusInput();
      }
    };

    const inputDisabled = disabled || !underLimit;
    const inputTabIndex = resolveTabIndex(tabIndex, disabled);

    const classes = clsx(
      className,
      getWidgetClassName({ disabled, icon, indicator }, "tagMultiselect"),
      hasInput &&
        (inputPosition === "outline"
          ? "oo-ui-tagMultiselectWidget-outlined"
          : "oo-ui-tagMultiselectWidget-inlined"),
      isMenu && "oo-ui-menuTagMultiselectWidget",
      // 组级拖拽类对齐原版：组根标记draggableGroupElement，拖拽期间追加dragging
      "oo-ui-draggableGroupElement",
      draggingKey !== null && "oo-ui-draggableGroupElement-dragging",
      focused && "oo-ui-tagMultiselectWidget-focus",
      flaggedElementClasses(mergeInvalidFlag(toFlagArray(flags), widgetInvalid)),
    );

    /**
     * 输入框元素：inline时直接置于标签组内，outline时置于标签区下方
     */
    const inputElement = hasInput ? (
      <input
        ref={inputRef}
        className={clsx(
          "oo-ui-inputWidget-input",
          // 满额时隐藏inline输入框（对齐原版toggleClass('oo-ui-element-hidden')）
          elementHiddenClasses(inputPosition === "inline" && !underLimit),
        )}
        type="text"
        name={name}
        value={inputValue}
        placeholder={inputPosition === "outline" && !underLimit ? "" : placeholder}
        disabled={inputDisabled}
        tabIndex={inputTabIndex}
        aria-disabled={inputDisabled || undefined}
        // aria-labelledby落在$tabIndexed（输入框）上，与原版setLabelledBy落点一致
        aria-labelledby={mergeAriaLabelledBy(fieldLabelId, ariaLabelledBy)}
        // 展开期声明所拥有的菜单（菜单portal到body，非DOM后代，须显式关联）
        aria-owns={isMenu && open ? menuId : undefined}
        autoComplete="off"
        onChange={handleInputChange}
        onKeyDown={handleInputKeyDown}
        onFocus={handleInputFocus}
        onBlur={handleInputBlur}
      />
    ) : null;

    return (
      <div
        {...rest}
        className={classes}
        aria-disabled={disabled || undefined}
        ref={setRef}
        onDragOver={handleDragOver}
      >
        <div
          className="oo-ui-tagMultiselectWidget-handle"
          onMouseDown={handleHandleMouseDown}
        >
          <IndicatorBase indicator={indicator} />
          <IconBase icon={icon} />
          <div className="oo-ui-tagMultiselectWidget-content" ref={contentRef}>
            <div className="oo-ui-tagMultiselectWidget-group" ref={groupRef}>
              {renderItems.map((entry, position) => {
                const callbacks = getTagCallbacks(entry.key);
                return (
                  <TagItem
                    key={entry.key}
                    label={entry.item.label}
                    fixed={entry.item.fixed}
                    valid={entry.item.valid}
                    disabled={disabled}
                    // data-index取预览位置（对齐原版拖拽预览期间的updateIndexes）
                    index={position}
                    draggable={allowReordering && !disabled && !entry.item.fixed}
                    dragPhase={draggingKey === entry.key ? dragPhase : undefined}
                    onDragStart={callbacks.onDragStart}
                    onDragEnd={callbacks.onDragEnd}
                    onDrop={callbacks.onDragEnd}
                    onRemove={callbacks.onRemove}
                    onSelect={callbacks.onSelect}
                    onNavigate={callbacks.onNavigate}
                  />
                );
              })}
              {inputPosition === "inline" && inputElement}
            </div>
            {!hasInput && (
              <span
                className="oo-ui-tagMultiselectWidget-focusTrap"
                ref={focusTrapRef}
                tabIndex={inputTabIndex}
                aria-disabled={disabled || undefined}
                aria-labelledby={mergeAriaLabelledBy(fieldLabelId, ariaLabelledBy)}
                // 同输入框：焦点陷阱是菜单焦点归属（inputPosition='none'）时的aria-owns落点
                aria-owns={isMenu && open ? menuId : undefined}
              />
            )}
          </div>
        </div>
        {inputPosition === "outline" && (
          <div
            ref={outlineWrapperRef}
            className={clsx(
              // outline输入区镜像原版内嵌TextInputWidget的根类派生（原版outline模式挂真实
              // TextInputWidget，classes为oo-ui-tagMultiselectWidget-input）：无label/flags，
              // 软校验invalid在组根输出
              getTextInputClassName({ disabled, type: "text" }, [], "input", "textInput"),
              "oo-ui-tagMultiselectWidget-input",
            )}
          >
            {inputElement}
          </div>
        )}
        {isMenu && (
          <MenuSelect
            ref={menuRef}
            id={menuId}
            container={
              inputPosition === "outline" && hasInput ? outlineWrapperRef : rootRef
            }
            open={open}
            options={menuSelectOptions}
            selectedValues={currentValue}
            highlightedValue={highlightedValue}
            onHighlightedChange={setHighlightedValue}
            onChoose={menu.handleMenuChoose}
            disabled={disabled}
            focusOwnerRef={menuFocusOwnerRef}
          />
        )}
      </div>
    );
  },
);

TagMultiselect.displayName = "TagMultiselect";
