import { expect, it } from "vitest";
import { render } from "vitest-browser-react";
import { getRoot, tick } from "../../testing";
import { Layout } from ".";

/**
 * Layout（对齐原版OO.ui.Layout）的浏览器渲染契约：
 * oo-ui-layout根类与hidden三态（隐藏 / until-found / 不隐藏）及随之的aria-hidden落点。
 */
it("缺省：仅输出layout根类，无hidden属性与aria-hidden", async () => {
  const screen = await render(<Layout className="custom">内容</Layout>);
  const root = getRoot(screen);
  expect(root.tagName).toBe("DIV");
  expect(root).toHaveClass("oo-ui-layout");
  expect(root).toHaveClass("custom");
  expect(root).not.toHaveAttribute("hidden");
  expect(root).not.toHaveAttribute("aria-hidden");
  expect(root).not.toHaveClass("oo-ui-element-hidden");
});

it("hidden=true：hidden属性、aria-hidden与element-hidden类齐备", async () => {
  const screen = await render(<Layout hidden>内容</Layout>);
  const root = getRoot(screen);
  expect(root).toHaveAttribute("hidden");
  expect(root).toHaveAttribute("aria-hidden", "true");
  expect(root).toHaveClass("oo-ui-element-hidden");
});

it("hidden='until-found'：hidden属性为until-found，但不声明aria-hidden（对查找可见）", async () => {
  const screen = await render(<Layout hidden="until-found">内容</Layout>);
  await tick();
  const root = getRoot(screen);
  expect(root.getAttribute("hidden")).toBe("until-found");
  expect(root).not.toHaveAttribute("aria-hidden");
  expect(root).not.toHaveClass("oo-ui-element-hidden");
});
