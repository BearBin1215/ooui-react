import { forwardRef, useMemo, useRef, useState } from "react";
import clsx from "clsx";
import { FieldLabelLinkProvider, useCleanId, type FieldLabelLink } from "../../hooks";
import { useAccessKeyLabel } from "../../config";
import {
  labelElementClasses,
  labelElementLabelClasses,
  resolveTitle,
} from "../../mixins";
import { Layout } from "../Layout";
import type { WidgetProps } from "../../widgets/Widget";
import type { LabelElement } from "../../Element";

export interface FieldLayoutProps extends WidgetProps<HTMLDivElement>, LabelElement {
  /**
   * Label alignment; invalid values fall back to `left` (mirrors upstream
   * `FieldLayout.setAlignment`).
   *
   * 标签对齐方向；非法值回退 `left`（对齐原版 setAlignment）。
   */
  align?: "left" | "right" | "top" | "inline";

  /**
   * Tooltip text for the label (lands on the label element, not the layout root;
   * falls back to the label text when the label is visually hidden).
   *
   * 标签的提示文本（落在标签元素上；标签不可见时以 label 兜底）
   */
  title?: string;
}

// 实现说明：对齐原版OO.ui.FieldLayout——承担标签联动，经Context向字段子树下发双通道
// （见FieldLabelLink）：输入类字段认领inputId与label的htmlFor原生关联；无原生input的字段
// 注册点击激活回调（原版simulateLabelClick）并经labelId挂aria-labelledby。另经
// registerAccessKey收字段控件的accessKey，用于label tooltip的键位后缀
/**
 * Field layout: a container that places a field control together with its label —
 * the basic unit inside a FormLayout.
 *
 * 字段布局：把一个字段控件与它的标签排在一起，是 FormLayout 里的基本单元。
 *
 * @see https://bearbin1215.github.io/ooui-react/components/field-layout/index.html
 */
export const FieldLayout = forwardRef<HTMLDivElement, FieldLayoutProps>(
  (
    {
      align = "left",
      children,
      className,
      disabled,
      invisibleLabel,
      label,
      title,
      ...rest
    },
    ref,
  ) => {
    // 字段id与标签id：即使无字段认领，for指向不存在元素也只是原生空操作（无目标即无默认行为）
    const fieldId = useCleanId();
    const labelId = useCleanId();
    // 通道B注册的激活回调集（输入类字段不注册，label点击走原生for由浏览器处理）
    const activateCallbacksRef = useRef(new Set<() => void>());
    // 字段控件登记的accessKey（原版委托字段控件的formatTitleWithAccessKey）：
    // 一个FieldLayout内通常只有一个字段控件，多个时以最后登记者为准
    const [fieldAccessKey, setFieldAccessKey] = useState<string>();
    const link = useMemo<FieldLabelLink>(
      () => ({
        inputId: fieldId,
        labelId,
        registerLabelActivate: (activate) => {
          activateCallbacksRef.current.add(activate);
          return () => activateCallbacksRef.current.delete(activate);
        },
        registerAccessKey: (accessKey) => {
          setFieldAccessKey(accessKey);
          // 注销时仅清除自己登记的值（期间若被其它字段覆盖则保留后者）
          return () =>
            setFieldAccessKey((current) => (current === accessKey ? undefined : current));
        },
      }),
      [fieldId, labelId],
    );
    const accessKeyLabel = useAccessKeyLabel(fieldAccessKey);

    // 非法align回退left（对齐原版FieldLayout.setAlignment的缺省分支，oojs-ui.js:13104-13110）
    const alignClass = (["left", "right", "top", "inline"] as const).includes(align)
      ? align
      : "left";

    const classes = clsx(
      className,
      // LabelElement mixin贡献（FieldLayout是Layout而非Widget，故不走getWidgetClassName）
      labelElementClasses({ label, invisibleLabel }),
      "oo-ui-fieldLayout",
      `oo-ui-fieldLayout-align-${alignClass}`,
      // disabled须从rest剥离，否则泄漏为div的非法DOM属性
      disabled && "oo-ui-fieldLayout-disabled",
    );

    const child = [
      <span className="oo-ui-fieldLayout-field" key="field">
        {children}
      </span>,
      <span className="oo-ui-fieldLayout-header" key="header">
        {/* 原版label为LabelWidget（static.tagName='label'）：带for的原生label元素承载
          联动；invisibleLabel的裁剪类与title均落在label元素上（原版$titled=$label） */}
        <label
          htmlFor={fieldId}
          id={labelId}
          // title解析走resolveTitle（原版TitledElement的invisibleLabel→label兜底）
          title={resolveTitle({
            title,
            label,
            invisibleLabel,
            accessKey: fieldAccessKey,
            accessKeyLabel,
          })}
          className={labelElementLabelClasses(invisibleLabel)}
          onClick={() => activateCallbacksRef.current.forEach((activate) => activate())}
        >
          {label}
        </label>
      </span>,
    ];

    return (
      <Layout {...rest} className={classes} ref={ref}>
        <FieldLabelLinkProvider value={link}>
          <div className="oo-ui-fieldLayout-body">
            {align === "inline" ? child : [...child].reverse()}
          </div>
        </FieldLabelLinkProvider>
      </Layout>
    );
  },
);

FieldLayout.displayName = "FieldLayout";
