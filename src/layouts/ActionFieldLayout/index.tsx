import { forwardRef, type ReactNode } from "react";
import clsx from "clsx";
import { FieldLayout, type FieldLayoutProps } from "../FieldLayout";

export interface ActionFieldLayoutProps extends FieldLayoutProps {
  /**
   * Button control beside the field (usually a Button or ButtonInput).
   *
   * 字段旁的按钮控件（通常为 Button 或 ButtonInput）。
   */
  button?: ReactNode;

  /**
   * Whether the field control is a span-rooted inline control (e.g. CheckboxInput /
   * ButtonInput); decides whether the input wrapper renders as a span or a div.
   * Passing it wrongly has no visual consequence.
   *
   * 字段控件是否为 span 根元素的内联控件（如 CheckboxInput / ButtonInput），
   * 决定输入区包装元素为 span 还是 div。传错无视觉后果。
   */
  fieldInline?: boolean;
}

/**
 * A field layout with an action button: built on FieldLayout with an extra button
 * slot beside the field control (the original is a FieldLayout subclass; here it is
 * composed over FieldLayout).
 *
 * 带操作按钮的字段布局，在 FieldLayout 基础上于字段区旁附加按钮，
 * 以组合方式复用 FieldLayout（原版为其子类）。
 *
 * @see https://bearbin1215.github.io/ooui-react/components/action-field-layout/index.html
 */
export const ActionFieldLayout = forwardRef<HTMLDivElement, ActionFieldLayoutProps>(
  (
    { align = "left", button, children, className, fieldInline = false, ...rest },
    ref,
  ) => {
    const InputWrapper = fieldInline ? "span" : "div";

    return (
      <FieldLayout
        {...rest}
        align={align}
        className={clsx(className, "oo-ui-actionFieldLayout")}
        ref={ref}
      >
        <InputWrapper className="oo-ui-actionFieldLayout-input">{children}</InputWrapper>
        <span className="oo-ui-actionFieldLayout-button">{button}</span>
      </FieldLayout>
    );
  },
);

ActionFieldLayout.displayName = "ActionFieldLayout";
