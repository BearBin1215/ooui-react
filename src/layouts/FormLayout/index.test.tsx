import { createRef, type FormEvent } from "react";
import { expect, it, vi } from "vitest";
import { render } from "vitest-browser-react";
import { getRoot } from "../../testing";
import { FormLayout } from ".";

/**
 * FormLayout（对齐原版OO.ui.FormLayout）的浏览器渲染契约：
 * form元素承载layout/formLayout类与原生表单属性、submit事件的onSubmit通道与ref转发。
 */
it("结构：form元素承载layout/formLayout类与原生表单属性", async () => {
  const screen = await render(
    <FormLayout method="post" action="/submit" enctype="multipart/form-data">
      <span>字段</span>
    </FormLayout>,
  );
  const form = getRoot<HTMLFormElement>(screen);
  expect(form.tagName).toBe("FORM");
  expect(form).toHaveClass("oo-ui-layout");
  expect(form).toHaveClass("oo-ui-formLayout");
  expect(form.getAttribute("method")).toBe("post");
  expect(form.getAttribute("action")).toBe("/submit");
  expect(form.getAttribute("enctype")).toBe("multipart/form-data");
  expect(form.textContent).toContain("字段");
});

it("提交：submit事件触发onSubmit，回调内preventDefault可阻止原生提交", async () => {
  const onSubmit = vi.fn<(event: FormEvent<HTMLFormElement>) => void>((event) =>
    event.preventDefault(),
  );
  const screen = await render(<FormLayout onSubmit={onSubmit} />);
  const form = getRoot<HTMLFormElement>(screen);
  const event = new Event("submit", { bubbles: true, cancelable: true });
  form.dispatchEvent(event);
  expect(onSubmit).toHaveBeenCalledOnce();
  expect(event.defaultPrevented).toBe(true);
});

it("转发ref到form元素", async () => {
  const ref = createRef<HTMLFormElement>();
  await render(<FormLayout ref={ref} />);
  expect(ref.current?.tagName).toBe("FORM");
});
