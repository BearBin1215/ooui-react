import { forwardRef } from "react";
import clsx from "clsx";
import { ButtonOption, type ButtonOptionProps } from "../ButtonOption";
import { getWidgetClassName, mergeAriaLabelledBy, resolveTabIndex } from "../../mixins";
import { resolveOptionDisabled, type ChangeHandler } from "../../utils";
import { useDirectSelect, useFieldLabelFocus } from "../../hooks";
import type { WidgetProps } from "../Widget";

/**
 * Option type of the button select (same shape as `ButtonOption`).
 *
 * 按钮式选择的选项类型（与 `ButtonOption` 同形）。
 */
export type ButtonSelectOptionProps = ButtonOptionProps;

export interface ButtonSelectProps extends Omit<WidgetProps<HTMLDivElement>, "onSelect"> {
  /**
   * Selected-value change callback (value-first)
   *
   * 选中值变更回调（值优先）
   */
  onChange?: ChangeHandler<string | number>;

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
   * Option set (**required**); each item has `value` and `children` (text),
   * optionally `icon` / `indicator` / `flags` / `framed` / `disabled`.
   *
   * 选项集（**必填**），每项含 `value` 与 `children`（文本），
   * 可选 `icon` / `indicator` / `flags` / `framed` / `disabled`
   */
  options: ButtonSelectOptionProps[];
}

// 实现说明：对齐原版OO.ui.ButtonSelectWidget——选项不可高亮（static.highlightable=false），
// ↑↓←→即环绕改选、Enter重申当前项，容器逻辑经useDirectSelect共用；aria-activedescendant
// 指向选中项；拖拽选择与Select共用useOptionDrag
/**
 * A button select: a set of mutually exclusive options shown as a row of buttons.
 *
 * 按钮式选择：把一组互斥选项呈现为一排按钮。
 *
 * @see https://bearbin1215.github.io/ooui-react/components/button-select/index.html
 */
export const ButtonSelect = forwardRef<HTMLDivElement, ButtonSelectProps>(
  (
    {
      className,
      defaultValue,
      disabled,
      onChange,
      options,
      tabIndex,
      value,
      onKeyDown,
      onMouseDown,
      onMouseUp,
      onMouseLeave,
      "aria-labelledby": ariaLabelledBy,
      ...rest
    },
    ref,
  ) => {
    // 直选族共用容器脚手架（受控值/可选值派生/拖拽/直选键盘/选项id）
    const {
      value: currentValue,
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
      // 点击选项后焦点收进组根，方向键立即可用（对齐ARIA APG，见useDirectSelect）
      focusRoot: () => rootRef.current?.focus(),
    });
    // FieldLayout标签联动（通道B）：点击标签聚焦容器（对齐原版TabIndexedElement.simulateLabelClick
    // 基线focus()，禁用时不聚焦）
    const {
      setRef: setRootRef,
      rootRef,
      fieldLabelId,
    } = useFieldLabelFocus<HTMLDivElement>({
      ref,
      disabled,
    });

    const classes = clsx(
      className,
      getWidgetClassName({ disabled }, "select", "buttonSelect"),
      pressedStateClass,
    );

    return (
      <div
        {...rest}
        className={classes}
        aria-disabled={disabled || undefined}
        role="listbox"
        aria-multiselectable={false}
        // 本组选项不可高亮，故active descendant指向选中项；取值与TabSelect同经useDirectSelect
        aria-activedescendant={activeDescendant}
        aria-labelledby={mergeAriaLabelledBy(fieldLabelId, ariaLabelledBy)}
        tabIndex={resolveTabIndex(tabIndex, disabled)}
        onKeyDown={handleKeyDown}
        onMouseUp={handleMouseUp}
        onMouseDown={handleMouseDown}
        onMouseLeave={handleMouseLeave}
        ref={setRootRef}
      >
        {options.map((option, i) => (
          <ButtonOption
            {...option}
            id={optionElementId(i)}
            key={option.value}
            ref={registerItem(option.value)}
            disabled={resolveOptionDisabled(option, disabled)}
            selected={currentValue === option.value}
            pressed={pressedValue === option.value}
          >
            {option.children}
          </ButtonOption>
        ))}
      </div>
    );
  },
);

ButtonSelect.displayName = "ButtonSelect";
