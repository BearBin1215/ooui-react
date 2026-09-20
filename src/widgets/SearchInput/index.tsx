import {
  forwardRef,
  useRef,
  type ChangeEvent,
  type KeyboardEvent,
  type Ref,
} from "react";
import { TextInput, type TextInputProps } from "../TextInput";
import { useControlledValue, useMergedRefs } from "../../hooks";
import { useMessage } from "../../config";

/**
 * Props of the search input: TextInput's props minus `type` / `indicator` /
 * `indicatorProps` (all taken over by the clear logic).
 *
 * 搜索输入框属性：复用 TextInputProps，`type` / `indicator` / `indicatorProps`
 * 由清除逻辑接管、不外露。
 */
export type SearchInputProps = Omit<
  TextInputProps,
  "type" | "indicator" | "indicatorProps"
> & {
  /**
   * Ref to the inner `<input>` (e.g. for focusing it back after clearing).
   *
   * 内部 `<input>` 的引用（清空回焦等场景使用）。
   */
  inputRef?: Ref<HTMLInputElement>;
};

/**
 * SearchInput的内部组合形态参数（SelectFileInputWidget等库内组合经相对路径使用，
 * 不进公开导出面）。两条通道都对应原版SelectFileInputWidget构造后对其info
 * （SearchInputWidget实例）的属性调整。
 */
export interface SearchInputInternalProps extends SearchInputProps {
  /**
   * 清除指示器的tabIndex覆写（缺省-1，对齐原版SearchInputWidget构造期的
   * `$indicator.attr({ tabindex: -1, role: 'button' })`，oojs-ui.js:12201）。
   * SelectFileInputWidget的信息框覆写为0（原版`info.$indicator.attr('tabindex', 0)`，
   * oojs-ui.js:14265——清除指示器是清空文件的唯一入口，须键盘可达）
   */
  indicatorTabIndex?: number;

  /**
   * 不注入缺省search图标（缺省false，图标仍可经icon显式给出）：SelectFileInputWidget
   * 的信息框图标由其icon参数决定、未传时无图标（对齐原版`setIcon(config.icon)`，
   * config.icon缺省null，oojs-ui.js:14259），不得落回'search'缺省
   */
  noDefaultIcon?: boolean;
}

// 实现说明：对齐原版OO.ui.SearchInputWidget（TextInputWidget子类）——input为type='search'、
// 缺省search图标；值非空且可编辑时显示clear指示器（role=button），点击或按Enter清空并回焦；
// 指示器经indicatorOverride完全接管（required缺省回退被抑制）
/**
 * A search input: the search form of TextInput, with a clear indicator appearing
 * when the value is non-empty — click it to clear.
 *
 * 搜索输入框：TextInput 的搜索形态，值非空时出现清除指示器，点击即清空。
 *
 * @see https://bearbin1215.github.io/ooui-react/components/search-input/index.html
 */
export const SearchInput = forwardRef<HTMLDivElement, SearchInputInternalProps>(
  (
    {
      icon,
      value,
      defaultValue,
      onChange,
      disabled,
      readOnly,
      noDefaultIcon = false,
      indicatorTabIndex = -1,
      inputRef,
      ...rest
    },
    ref,
  ) => {
    const { value: currentValue, commit } = useControlledValue<
      string,
      ChangeEvent<HTMLInputElement>
    >({ value, defaultValue: defaultValue ?? "" }, onChange);
    const internalInputRef = useRef<HTMLInputElement>(null);
    const setInputRef = useMergedRefs(inputRef, internalInputRef);
    // 清除指示器的可访问名称（对齐原版$indicator的aria-label）
    const removeLabel = useMessage("ooui-item-remove");
    // 缺省search图标；noDefaultIcon关闭缺省注入（内部通道，供SelectFileInputWidget的信息框）
    const resolvedIcon = noDefaultIcon ? icon : (icon ?? "search");

    // 对齐原版updateSearchIndicator：非空且可编辑时显示clear指示器，否则null明确无
    const showClear = currentValue !== "" && !disabled && !readOnly;

    /**
     * 清空并回焦输入框（原版onIndicatorClick/onIndicatorKeyDown的共用实现）
     */
    const clear = () => {
      commit("");
      internalInputRef.current?.focus();
    };

    /**
     * 清除指示器上的Enter触发清空
     */
    const handleIndicatorKeyDown = (e: KeyboardEvent<HTMLSpanElement>) => {
      if (e.key === "Enter") {
        e.preventDefault();
        clear();
      }
    };

    return (
      <TextInput
        {...rest}
        ref={ref}
        type="search"
        icon={resolvedIcon}
        indicatorOverride={showClear ? "clear" : null}
        inputRef={setInputRef}
        value={currentValue}
        onChange={commit}
        disabled={disabled}
        readOnly={readOnly}
        // role/tabIndex为原版$indicator的固定属性（初始化即挂，不随指示器显隐；
        // tabIndex的缺省值可经indicatorTabIndex内部通道覆写）
        indicatorProps={{
          role: "button",
          tabIndex: indicatorTabIndex,
          ...(showClear
            ? {
                "aria-label": removeLabel,
                onClick: clear,
                onKeyDown: handleIndicatorKeyDown,
              }
            : {}),
        }}
      />
    );
  },
);

SearchInput.displayName = "SearchInput";
