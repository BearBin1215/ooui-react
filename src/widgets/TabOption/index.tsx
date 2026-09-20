import { forwardRef, type ReactNode } from "react";
import clsx from "clsx";
import { omit } from "es-toolkit";
import { LabelBase } from "../Label/Base";
import { getWidgetClassName, optionWidgetClasses } from "../../mixins";
import type { OptionProps } from "../Option";

export type TabOptionProps = OptionProps & {
  /**
   * Whether the option is mouse-pressed (driven by TabSelect).
   *
   * 是否处于鼠标按压态（由 TabSelect 拖拽逻辑驱动）。
   */
  pressed?: boolean;

  /**
   * Label carried with the option object; swallowed so it never lands as a DOM
   * attribute (the render uses `children`).
   *
   * 随选项对象透入的标签，组件吞掉以避免落成 DOM 属性（渲染用 `children`）。
   */
  label?: ReactNode;
};

/**
 * 页签式选择的页签项（对齐原版 OO.ui.TabOptionWidget）；页签无高亮态（内部中间件，
 * 不进公共导出面）。
 */
export const TabOption = forwardRef<HTMLDivElement, TabOptionProps>(
  ({ children, className, disabled, selected, pressed, ...rest }, ref) => {
    const classes = clsx(
      className,
      getWidgetClassName({ disabled, label: children }, "option", "tabOption"),
      // 原版TabOptionWidget.static.highlightable=false（页签无高亮态，按压态仍由pressable承担）
      optionWidgetClasses({ selected, pressed, highlightable: false }),
    );

    return (
      <div
        {...omit(rest, ["value", "highlighted", "label"])}
        className={classes}
        aria-disabled={disabled || undefined}
        tabIndex={-1}
        role="tab"
        aria-selected={!!selected}
        ref={ref}
      >
        <LabelBase>{children}</LabelBase>
      </div>
    );
  },
);

TabOption.displayName = "TabOption";
