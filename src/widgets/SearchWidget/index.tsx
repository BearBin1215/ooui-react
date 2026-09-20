import {
  forwardRef,
  useEffect,
  useRef,
  useState,
  type ChangeEvent,
  type KeyboardEvent,
} from "react";
import clsx from "clsx";
import { SearchInput, type SearchInputProps } from "../SearchInput";
import { Select, type SelectOptionProps } from "../Select";
import { getWidgetClassName } from "../../mixins";
import {
  findRelativeSelectableItem,
  isComposingKeyEvent,
  type ChangeHandler,
} from "../../utils";
import { useControlledValue, useMergedRefs, useSelectableValues } from "../../hooks";
import type { WidgetProps } from "../Widget";

/**
 * results的缺省空数组（模块级常量，避免每渲染新建字面量）
 */
const NO_RESULTS: SelectOptionProps[] = [];

/**
 * Props of the search widget: a query box paired with a results list the caller
 * fills from the query.
 *
 * 搜索框属性：查询框配一个由调用方按查询填充的结果列表。
 */
export interface SearchWidgetProps
  // results与HTML原生的results属性（<input type=search>用）同名，须先剔除再声明结果集
  extends Omit<WidgetProps<HTMLDivElement>, "children" | "onChange" | "results"> {
  /**
   * Result option set, filled by the caller from the query.
   *
   * 结果选项集，由调用方按查询填充
   */
  results?: SelectOptionProps[];

  /**
   * Query text (controlled)
   *
   * 查询文本（受控）
   */
  value?: string;

  /**
   * Initial query for uncontrolled use
   *
   * 非受控初始查询
   */
  defaultValue?: string;

  /**
   * Query-change callback; refill `results` from it.
   *
   * 查询变化回调（据此重填 `results`）
   */
  onQueryChange?: ChangeHandler<string>;

  /**
   * Result-chosen callback (Enter on the highlighted result, or clicking a result).
   *
   * 选定结果回调（Enter 选定高亮结果、或鼠标点击结果时触发）
   */
  onChoose?: ChangeHandler<string | number>;

  /**
   * Query box placeholder
   *
   * 查询框占位符
   */
  placeholder?: string;

  /**
   * Overrides for the query box (SearchInput); `value` / `defaultValue` / `onChange`
   * are taken over by this component. Props meant for the native `<input>` go
   * through the nested `inputProps.inputProps` (SearchInput's input passthrough).
   *
   * 查询框（SearchInput）的属性覆盖；`value`/`defaultValue`/`onChange` 由本组件接管。
   * 要写到原生 `<input>` 上的属性经 `inputProps.inputProps`（SearchInput 的输入元素
   * 透传通道）给入
   */
  inputProps?: Partial<Omit<SearchInputProps, "value" | "defaultValue" | "onChange">>;
}

// 实现说明：对齐原版OO.ui.SearchWidget。本组件不实现检索——查询变化仅回调onQueryChange，
// 结果由调用方填入results。键盘：焦点留在查询框，↑↓在结果间移动高亮（端点环绕）、
// Enter选定高亮结果
/**
 * A search widget: a query box with an always-visible results list.
 *
 * 搜索组件：查询框配始终可见的结果列表。
 *
 * @see https://bearbin1215.github.io/ooui-react/components/search-widget/index.html
 */
export const SearchWidget = forwardRef<HTMLDivElement, SearchWidgetProps>(
  (
    {
      className,
      disabled,
      results = NO_RESULTS,
      value,
      defaultValue,
      onQueryChange,
      onChoose,
      placeholder,
      inputProps,
      ...rest
    },
    ref,
  ) => {
    const { value: currentQuery, commit } = useControlledValue<
      string,
      ChangeEvent<HTMLInputElement>
    >({ value, defaultValue: defaultValue ?? "" }, onQueryChange);
    /**
     * 结果高亮：受控给Select。焦点在查询框，故由本组件充当键盘驱动方
     */
    const [highlightedValue, setHighlightedValue] = useState<string | number | undefined>(
      undefined,
    );
    /**
     * 查询框input元素：结果列表的焦点归属元素（activedescendant落点），兼顾调用方传入的inputRef
     */
    const inputRef = useRef<HTMLInputElement>(null);
    const mergedInputRef = useMergedRefs(inputProps?.inputRef, inputRef);
    const { values: selectableValues } = useSelectableValues(results);

    // 结果集或查询变化即清除高亮（对齐原版onQueryChange清空results后高亮随之消失）
    useEffect(() => {
      setHighlightedValue(undefined);
    }, [results, currentQuery]);

    /**
     * 查询区键盘：↑↓移动结果高亮、Enter选定高亮结果。挂在查询区容器上——
     * SearchInput的props经TextInput落到其根元素而非input，键盘事件自input冒泡至此处理
     */
    const handleQueryKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
      if (disabled) {
        return;
      }
      // IME合成期按键（确认候选的Enter、选词的方向键）不驱动结果高亮与选定
      if (isComposingKeyEvent(event)) {
        return;
      }
      if (event.key === "ArrowDown" || event.key === "ArrowUp") {
        event.preventDefault();
        const next = findRelativeSelectableItem(
          selectableValues,
          highlightedValue,
          event.key === "ArrowDown" ? 1 : -1,
        );
        if (next !== undefined) {
          setHighlightedValue(next);
        }
        return;
      }
      if (event.key === "Enter" && highlightedValue !== undefined) {
        onChoose?.(highlightedValue);
      }
    };

    return (
      <div
        {...rest}
        className={clsx(className, getWidgetClassName({ disabled }, "search"))}
        aria-disabled={disabled || undefined}
        ref={ref}
      >
        {/* 原版DOM顺序为results在前、query在后（两者均绝对定位，视觉由主题CSS接管） */}
        <div className="oo-ui-searchWidget-results">
          <Select
            options={results}
            highlightedValue={highlightedValue}
            onHighlightedChange={setHighlightedValue}
            onChoose={onChoose}
            disabled={disabled}
            // 列表不输出tabindex（同独立Select口径：原版SelectWidget根非TabIndexedElement、
            // 无tabindex，本组件也没有编程聚焦列表的地方）。activedescendant归属查询框
            // （对齐原版SearchWidget构造期results.setFocusOwner(query.$input)）
            focusOwnerRef={inputRef}
          />
        </div>
        <div className="oo-ui-searchWidget-query" onKeyDown={handleQueryKeyDown}>
          <SearchInput
            {...inputProps}
            inputRef={mergedInputRef}
            value={currentQuery}
            onChange={commit}
            placeholder={placeholder}
            disabled={disabled}
          />
        </div>
      </div>
    );
  },
);

SearchWidget.displayName = "SearchWidget";
