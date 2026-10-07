import { forwardRef, memo, type ReactNode } from "react";
import clsx from "clsx";
import { omit } from "es-toolkit";
import {
  buttonElementClasses,
  getButtonIconClasses,
  getWidgetClassName,
  optionWidgetClasses,
  resolveTitle,
  toFlagArray,
} from "../../mixins";
import { useAccessKeyLabel } from "../../config";
import type { IconElement, IndicatorElement } from "../../Element";
import type { OptionFlaggedElement, OptionProps } from "../Option";
import { ButtonSlots } from "../Button/slots";

export interface ButtonOptionProps
  extends OptionProps, IconElement, IndicatorElement, OptionFlaggedElement {
  /**
   * Whether the option is mouse-pressed (driven by ButtonSelect).
   *
   * 是否处于鼠标按压态（由 ButtonSelect 拖拽逻辑驱动）。
   */
  pressed?: boolean;

  /**
   * Whether it has a border (framed by default).
   *
   * 是否带边框（缺省带边框）。
   */
  framed?: boolean;

  /**
   * Label carried with the option object; swallowed so it never lands as a DOM
   * attribute (the render uses `children`).
   *
   * 随选项对象透入的标签，组件吞掉以避免落成 DOM 属性（渲染用 `children`）。
   */
  label?: ReactNode;
}

/**
 * 按钮式选择的选项（对齐原版 OO.ui.ButtonOptionWidget）：该项不可高亮，
 * 故不复用 DecoratedOption——槽位落在内层按钮里而非容器内（内部中间件，
 * 不进公共导出面）。memo化缘由同MenuOption——ButtonSelect逐项渲染，选中/按压态
 * 行变化时其余行浅比较跳过
 */
export const ButtonOption = memo(
  forwardRef<HTMLDivElement, ButtonOptionProps>(
    (
      {
        accessKey,
        children,
        className,
        disabled,
        framed,
        flags,
        icon,
        indicator,
        pressed,
        selected,
        title,
        ...rest
      },
      ref,
    ) => {
      const isFramed = framed !== false;
      // 图标/指示器变体：带边框的按钮在激活（选中）或禁用时整体反色，无边框禁用时保持原色
      // （对齐wikimediaui主题getElementClasses的按钮分支，与Button共用同一规则），
      // 其余情形按flags叠加image变体。ButtonOptionWidget在原版继承OptionWidget而非
      // MenuOptionWidget，故不落主题的「选项选中/按压→progressive」分支
      const iconClasses = getButtonIconClasses({
        framed: isFramed,
        active: selected,
        disabled,
        flags: toFlagArray(flags),
      });
      // title的键位后缀：快捷键文案由宿主解析（未提供时title附原键值）
      const accessKeyLabel = useAccessKeyLabel(accessKey);
      const classes = clsx(
        className,
        getWidgetClassName(
          { disabled, label: children, icon, indicator },
          "option",
          "buttonOption",
        ),
        // 原版ButtonOptionWidget.setSelected连带setActive：选中即按钮激活态（主题按激活态给底色与反色文字）。
        // flags同时交根类贡献器输出oo-ui-flaggedElement-*：wikimediaui主题的按钮作用域
        // flagged规则（.oo-ui-buttonElement-framed.oo-ui-flaggedElement-progressive > …，oojs-ui-wikimediaui.css:349）
        // 以根类为命中条件，缺了它只有图标变色、按钮底色/边框不生效
        buttonElementClasses({
          framed: isFramed,
          active: selected,
          disabled,
          pressed,
          flags: toFlagArray(flags),
        }),
        // 原版ButtonOptionWidget.static.highlightable=false（按钮选项无高亮态）
        optionWidgetClasses({ selected, pressed, highlightable: false }),
      );

      return (
        <div
          {...omit(rest, ["value", "highlighted", "label"])}
          className={classes}
          // accessKey落在根元素：对齐原版OptionWidget的$accessKeyed（$element；根可编程聚焦，
          // 快捷键可达）。title不在此——见下方锚点
          accessKey={accessKey}
          aria-disabled={disabled || undefined}
          tabIndex={-1}
          role="option"
          aria-selected={!!selected}
          ref={ref}
        >
          {/* role=button：对齐原版setButtonElement对A元素补role；
            title落锚点：原版ButtonOptionWidget构造末尾setTitledElement($button)把
            OptionWidget构造期的$titled（$element）重定向到$button */}
          <a
            className="oo-ui-buttonElement-button"
            role="button"
            title={resolveTitle({ title, accessKey, accessKeyLabel })}
          >
            <ButtonSlots
              icon={icon}
              variantClasses={iconClasses}
              label={children}
              indicator={indicator}
            />
          </a>
        </div>
      );
    },
  ),
);

ButtonOption.displayName = "ButtonOption";
