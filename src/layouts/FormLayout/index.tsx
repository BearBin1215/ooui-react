import { forwardRef, type FormEventHandler } from "react";
import clsx from "clsx";
import type { ElementProps } from "../../Element";

export interface FormLayoutProps extends ElementProps<HTMLFormElement> {
  /**
   * Submission method (native `method`, defaults to GET)
   *
   * 提交方法（原生 `method`，缺省 GET）
   */
  method?: string;

  /**
   * Submission URL (native `action`).
   *
   * **Security**: No URL sanitization is performed (unlike the original's
   * `OO.ui.isSafeUrl` protocol whitelist). `<form action="javascript:...">`
   * executes on submission and is not blocked at runtime; validate the protocol
   * of any untrusted `action`, or it is an XSS vector.
   *
   * 提交地址（原生 `<form>` 的 `action`）。**安全**：不做 URL 净化（越过原版
   * `OO.ui.isSafeUrl` 的协议白名单）。`<form action="javascript:...">` 会在提交时
   * 执行且运行期不被拦截，来源不可信的 `action` 须先校验协议，否则构成 XSS。
   */
  action?: string;

  /**
   * Encoding type (native `enctype`, defaults to `application/x-www-form-urlencoded`).
   *
   * 编码类型（原生 `enctype`，缺省 `application/x-www-form-urlencoded`）
   */
  enctype?: string;

  /**
   * Submit handler; call `event.preventDefault()` inside it to stop the default
   * navigation.
   *
   * 表单提交回调；需阻止默认跳转时在回调内 `event.preventDefault()`
   */
  onSubmit?: FormEventHandler<HTMLFormElement>;
}

// 实现说明：对齐原版OO.ui.FormLayout——<form>元素包裹字段集，配合InputWidget家族实现
// 浏览器原生表单提交
/**
 * Form container: it renders a `<form>` wrapping several FieldLayouts. It does no
 * data management itself — input controls with a `name` submit natively with the
 * `<form>`. When you don't need native submission semantics, just place the
 * controls in your own container.
 *
 * 表单容器：渲染一个 `<form>`，把若干 FieldLayout 包起来。它本身不做数据管理，带 `name`
 * 的输入控件随原生 `<form>` 一起提交。不需要原生提交语义时，直接把控件摆在自己的容器里即可。
 *
 * @see https://bearbin1215.github.io/ooui-react/components/form-layout/index.html
 */
export const FormLayout = forwardRef<HTMLFormElement, FormLayoutProps>(
  ({ className, children, method, action, enctype, ...rest }, ref) => (
    <form
      {...rest}
      method={method}
      action={action}
      encType={enctype}
      className={clsx(className, "oo-ui-layout", "oo-ui-formLayout")}
      ref={ref}
    >
      {children}
    </form>
  ),
);

FormLayout.displayName = "FormLayout";
