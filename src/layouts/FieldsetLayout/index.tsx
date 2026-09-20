import { forwardRef, type ReactNode } from "react";
import clsx from "clsx";
import { iconElementClasses, labelElementClasses } from "../../mixins";
import { LabelBase } from "../../widgets/Label/Base";
import { IconBase } from "../../widgets/Icon/Base";
import { Label } from "../../widgets/Label";
import { PopupButton } from "../../widgets/PopupButton";
import type { WidgetProps } from "../../widgets/Widget";
import type { IconElement, LabelElement } from "../../Element";
import { useMessage } from "../../config";

export interface FieldsetLayoutProps
  extends WidgetProps<HTMLFieldSetElement>, LabelElement, IconElement {
  /**
   * Help text content.
   *
   * 帮助文本。
   */
  help?: ReactNode;

  /**
   * Whether the help text shows inline. `true` renders it as inline text after
   * the header; `false` renders a help icon that opens a popup on click.
   *
   * 帮助文本是否内联显示。`true` 时以行内文本显示在字段集头部之后；
   * `false` 时渲染为帮助图标，点击弹出说明。
   */
  helpInline?: boolean;
}

/**
 * A field set: a native `<fieldset>` with a `<legend>` header (title, icon and help
 * entry) and grouped field items inside. The root is a native fieldset, so its
 * `disabled` natively disables every input control in the group.
 *
 * 字段集：原生 `<fieldset>` 带 `<legend>` 头部（标题、图标、帮助入口）和组内
 * 字段项。根为原生 fieldset，`disabled` 可原生禁用组内所有输入控件。
 *
 * @see https://bearbin1215.github.io/ooui-react/components/fieldset-layout/index.html
 */
export const FieldsetLayout = forwardRef<HTMLFieldSetElement, FieldsetLayoutProps>(
  (
    {
      children,
      className,
      label,
      invisibleLabel,
      icon,
      help,
      helpInline = false,
      ...rest
    },
    ref,
  ) => {
    // 帮助按钮的无障碍标签（对齐原版ooui-field-help消息）
    const helpAriaLabel = useMessage("ooui-field-help");
    // 根是原生<fieldset>而非Layout组件，故在此手工补齐oo-ui-layout与Label/Icon mixin的类
    const classes = clsx(
      className,
      "oo-ui-layout",
      labelElementClasses({ label, invisibleLabel }),
      iconElementClasses({ icon }),
      "oo-ui-fieldsetLayout",
    );

    return (
      <fieldset {...rest} className={classes} ref={ref}>
        <legend className="oo-ui-fieldsetLayout-header">
          <IconBase icon={icon} />
          <LabelBase invisible={invisibleLabel}>{label}</LabelBase>
          {help && !helpInline && (
            <PopupButton
              className="oo-ui-fieldsetLayout-help"
              framed={false}
              icon="info"
              aria-label={helpAriaLabel}
              padded
              popupContent={help}
            />
          )}
        </legend>
        {help && helpInline && <Label className="oo-ui-inline-help">{help}</Label>}
        <div className="oo-ui-fieldsetLayout-group">{children}</div>
      </fieldset>
    );
  },
);

FieldsetLayout.displayName = "FieldsetLayout";
