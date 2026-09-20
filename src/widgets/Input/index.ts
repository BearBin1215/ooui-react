import type { WidgetProps } from "../Widget";
import type { AccessKeyedElement } from "../../Element";
import type { ChangeHandler } from "../../utils";

/**
 * Base props of input-type components (aligns with the abstract
 * OO.ui.InputWidget; types only, no rendering component).
 *
 * 输入类组件基础参数（对齐原版抽象基类 InputWidget，仅类型，无对应渲染组件）。
 * @template T 输入值类型
 * @template P 输入框类型
 * @template S 组件最外层元素类型
 */
export interface InputProps<
  T extends string | number | boolean | undefined,
  P extends EventTarget = HTMLInputElement,
  S = P,
>
  extends Omit<WidgetProps<S>, "children">, AccessKeyedElement {
  /**
   * Form field name (lands on `<input>`)
   *
   * 表单提交字段名（落在 `<input>`）
   */
  name?: string;

  /**
   * Input hint
   *
   * 输入提示
   */
  placeholder?: string;

  /**
   * Value-change handler (value-first, includes the native event).
   *
   * 值变化回调（值优先，含原生事件）
   */
  onChange?: ChangeHandler<T, P>;

  /**
   * Required (native `required` attribute, part of browser validation).
   *
   * 必填（原生 `required` 属性，参与浏览器校验）
   */
  required?: boolean;

  /**
   * Input value (controlled; passing it enables controlled mode)
   *
   * 输入值（受控，传入即受控模式）
   */
  value?: T;

  /**
   * Uncontrolled initial value
   *
   * 非受控初始值
   */
  defaultValue?: T;
}
