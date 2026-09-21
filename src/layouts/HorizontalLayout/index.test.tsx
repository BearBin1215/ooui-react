import { expect, it } from "vitest";
import { render } from "vitest-browser-react";
import { getRoot } from "../../testing";
import { HorizontalLayout } from ".";

/**
 * HorizontalLayout（对齐原版OO.ui.HorizontalLayout）的浏览器渲染契约：
 * 仅叠加oo-ui-horizontalLayout类（排布交主题CSS），hidden等仍由Layout承担。
 */
it("结构：layout + horizontalLayout类，子项直接平铺", async () => {
  const screen = await render(
    <HorizontalLayout className="custom">
      <span>甲</span>
      <span>乙</span>
    </HorizontalLayout>,
  );
  const root = getRoot(screen);
  expect(root.tagName).toBe("DIV");
  expect(root).toHaveClass("oo-ui-layout");
  expect(root).toHaveClass("oo-ui-horizontalLayout");
  expect(root).toHaveClass("custom");
  expect(root.children).toHaveLength(2);
});

it("hidden：三态经Layout承担（hidden属性 + aria-hidden + element-hidden类）", async () => {
  const screen = await render(<HorizontalLayout hidden>甲</HorizontalLayout>);
  const root = getRoot(screen);
  expect(root).toHaveAttribute("hidden");
  expect(root).toHaveAttribute("aria-hidden", "true");
  expect(root).toHaveClass("oo-ui-element-hidden");
});
