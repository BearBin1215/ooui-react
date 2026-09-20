import { forwardRef, useLayoutEffect, useRef } from "react";
import clsx from "clsx";
import { TabOption, type TabOptionProps } from "../TabOption";
import { getWidgetClassName, resolveTabIndex } from "../../mixins";
import { resolveOptionDisabled, type ChangeHandler } from "../../utils";
import { useDirectSelect, useMergedRefs } from "../../hooks";
import { useIsMobile } from "../../config";
import type { WidgetProps } from "../Widget";

/**
 * Option type of the tab select (same shape as `TabOption`).
 *
 * 页签选择的选项类型（与 `TabOption` 同形）。
 */
export type TabSelectOptionProps = TabOptionProps;

export interface TabSelectProps extends Omit<WidgetProps<HTMLDivElement>, "onSelect"> {
  /**
   * Whether the strip has a border
   *
   * 是否带边框
   */
  framed?: boolean;

  /**
   * Current selected value (controlled)
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
   * Tab set (**required**); each item has `value` and `children` (text), optionally `disabled`
   *
   * 页签集（**必填**），每项含 `value` 与 `children`（文本），可选 `disabled`
   */
  options: TabSelectOptionProps[];

  /**
   * Selected-value change callback (value-first)
   *
   * 选中值变更回调（值优先）
   */
  onChange?: ChangeHandler<string | number>;
}

// 实现说明：对齐原版`TabSelectWidget`（role=tablist，聚焦后←→环绕选择；
// aria-activedescendant指向选中页签，取值见useDirectSelect）
/**
 * A tab select: a set of mutually exclusive options shown as a row of tabs.
 *
 * 页签式选择：把一组互斥选项呈现为一排页签。
 *
 * @see https://bearbin1215.github.io/ooui-react/components/tab-select/index.html
 */
export const TabSelect = forwardRef<HTMLDivElement, TabSelectProps>(
  (
    {
      className,
      framed = true,
      value,
      defaultValue,
      options,
      onChange,
      disabled,
      tabIndex,
      onKeyDown,
      onMouseDown,
      onMouseUp,
      onMouseLeave,
      ...rest
    },
    ref,
  ) => {
    const isMobile = useIsMobile();
    const rootRef = useRef<HTMLDivElement>(null);
    const setRootRef = useMergedRefs(ref, rootRef);
    // 直选族共用容器脚手架（受控值/可选值派生/拖拽/直选键盘）
    const {
      value: currentValue,
      itemRefs,
      registerItem,
      pressedValue,
      pressedStateClass,
      handleMouseDown,
      handleMouseUp,
      handleMouseLeave,
      handleKeyDown,
      optionElementId,
      activeDescendant,
    } = useDirectSelect<string | number>({
      value,
      defaultValue,
      onChange,
      disabled,
      options,
      onKeyDown,
      onMouseDown,
      onMouseUp,
      onMouseLeave,
      // 点击页签后焦点收进tablist，方向键立即可用（对齐ARIA APG，见useDirectSelect）
      focusRoot: () => rootRef.current?.focus(),
    });

    const classes = clsx(
      className,
      getWidgetClassName({ disabled }, "select", "tabSelect"),
      pressedStateClass,
      framed ? "oo-ui-tabSelectWidget-framed" : "oo-ui-tabSelectWidget-frameless",
      isMobile && "oo-ui-tabSelectWidget-mobile",
    );

    // 选中项变化时滚动到可见区（对齐原版TabOptionWidget.scrollIntoViewOnSelect=true）：
    // 页签集横向溢出时使新选中项进入视野；itemRefs是稳定的ref容器，列入依赖仅为满足静态检查。
    // 移动端对齐原版scrollElementIntoView的居中分支：按容器与页签宽度差计算左右padding，
    // 经scroll-margin实现等效的"带内边距滚动"（nearest对齐+对称边距=居中，滚动到边界时自然钳制）
    useLayoutEffect(() => {
      if (currentValue === undefined) {
        return;
      }
      const option = itemRefs.current.get(currentValue);
      if (!option) {
        return;
      }
      // 移动端对齐原版scrollElementIntoView的居中分支：按容器与页签宽度差计算左右padding，
      // 经scroll-margin实现等效的"带内边距滚动"（nearest对齐+对称边距=居中，滚动到边界时自然钳制）
      const group = rootRef.current;
      if (isMobile && group) {
        const padding = Math.max((group.clientWidth - option.clientWidth) / 2, 0);
        option.style.scrollMargin = `0 ${padding}px`;
      }
      option.scrollIntoView({ block: "nearest", inline: "nearest" });
      // 非移动端未设置过scroll-margin，置空串是无害复位
      option.style.scrollMargin = "";
    }, [currentValue, isMobile, itemRefs]);

    return (
      <div
        {...rest}
        className={classes}
        aria-disabled={disabled || undefined}
        role="tablist"
        // 本组选项不可高亮（原版TabOptionWidget.static.highlightable=false），故active
        // descendant指向选中项，与ButtonSelect同分支；取值见useDirectSelect
        aria-activedescendant={activeDescendant}
        tabIndex={resolveTabIndex(tabIndex, disabled)}
        onKeyDown={handleKeyDown}
        onMouseDown={handleMouseDown}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseLeave}
        ref={setRootRef}
      >
        {options.map((option, i) => (
          <TabOption
            {...option}
            id={optionElementId(i)}
            key={option.value}
            ref={registerItem(option.value)}
            disabled={resolveOptionDisabled(option, disabled)}
            selected={currentValue === option.value}
            pressed={pressedValue === option.value}
          >
            {option.children}
          </TabOption>
        ))}
      </div>
    );
  },
);

TabSelect.displayName = "TabSelect";
