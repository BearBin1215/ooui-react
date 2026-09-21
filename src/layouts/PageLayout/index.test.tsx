import { expect, it } from "vitest";
import { render } from "vitest-browser-react";
import { getRoot } from "../../testing";
import { PageLayout } from ".";

/**
 * PageLayout（对齐原版OO.ui.PageLayout）的浏览器渲染契约：
 * active由hidden派生（可显式覆盖以支持continuous模式）、pageLayout类链，
 * 页签集透入的label/value被吞掉不落成DOM属性。
 */
it("缺省：非hidden即激活，输出panelLayout/pageLayout类链", async () => {
  const screen = await render(<PageLayout>内容</PageLayout>);
  const root = getRoot(screen);
  expect(root.tagName).toBe("DIV");
  expect(root).toHaveClass("oo-ui-layout");
  expect(root).toHaveClass("oo-ui-panelLayout");
  expect(root).toHaveClass("oo-ui-panelLayout-expanded");
  expect(root).toHaveClass("oo-ui-pageLayout");
  expect(root).toHaveClass("oo-ui-pageLayout-active");
  expect(root).not.toHaveAttribute("hidden");
});

it("hidden：非激活且不输出激活类，hidden属性与aria-hidden齐备", async () => {
  const screen = await render(<PageLayout hidden>内容</PageLayout>);
  const root = getRoot(screen);
  expect(root).not.toHaveClass("oo-ui-pageLayout-active");
  expect(root).toHaveAttribute("hidden");
  expect(root).toHaveAttribute("aria-hidden", "true");
  expect(root).toHaveClass("oo-ui-element-hidden");
});

it("active显式传入：激活态与hidden解耦（continuous模式），label/value被吞掉", async () => {
  const screen = await render(
    <PageLayout active label="页签" value="a">
      内容
    </PageLayout>,
  );
  const root = getRoot(screen);
  expect(root).toHaveClass("oo-ui-pageLayout-active");
  expect(root).not.toHaveAttribute("hidden");
  expect(root.hasAttribute("label")).toBe(false);
  expect(root.hasAttribute("value")).toBe(false);
  expect(root.textContent).toBe("内容");
});
