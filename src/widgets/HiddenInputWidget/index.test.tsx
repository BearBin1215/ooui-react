import { expect, it } from "vitest";
import { render } from "vitest-browser-react";
import { getRoot } from "../../testing";
import { HiddenInputWidget } from ".";

/**
 * HiddenInputWidget（对齐原版OO.ui.HiddenInputWidget）的浏览器渲染契约：
 * 以input[type=hidden]为根元素、value为受控值、disabled落到原生属性上
 * （与原版只切类、仍参与提交不同，见dev-docs/DEVIATIONS.md增强节）。
 */
it("结构：input[type=hidden]为根元素，承载value/name与widget类链", async () => {
  const screen = await render(<HiddenInputWidget value="42" name="count" />);
  const root = getRoot<HTMLInputElement>(screen);
  expect(root.tagName).toBe("INPUT");
  expect(root.getAttribute("type")).toBe("hidden");
  expect(root.value).toBe("42");
  expect(root.getAttribute("name")).toBe("count");
  expect(root).toHaveClass("oo-ui-widget");
  expect(root).toHaveClass("oo-ui-widget-enabled");
});

it("value缺省为空串且随props更新（受控）", async () => {
  const screen = await render(<HiddenInputWidget />);
  const root = getRoot<HTMLInputElement>(screen);
  expect(root.value).toBe("");
  await screen.rerender(<HiddenInputWidget value="7" />);
  expect(root.value).toBe("7");
});

it("disabled落到原生属性并使字段退出表单提交（不输出aria-disabled）", async () => {
  const screen = await render(<HiddenInputWidget disabled value="1" />);
  const root = getRoot<HTMLInputElement>(screen);
  expect(root.disabled).toBe(true);
  expect(root).toHaveClass("oo-ui-widget-disabled");
  expect(root).not.toHaveAttribute("aria-disabled");
});
