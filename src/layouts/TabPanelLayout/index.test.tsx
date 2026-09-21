import { expect, it } from "vitest";
import { render } from "vitest-browser-react";
import { getRoot } from "../../testing";
import { TabPanelLayout } from ".";

/**
 * TabPanelLayout（对齐原版OO.ui.TabPanelLayout）的浏览器渲染契约：
 * tabpanel角色 + tabPanelLayout类链、active输出激活类、
 * 页签集透入的label/value/disabled被吞掉不落成DOM属性。
 */
it("结构：tabpanel角色与tabPanelLayout类链，active输出激活类", async () => {
  const screen = await render(<TabPanelLayout active>内容</TabPanelLayout>);
  const root = getRoot(screen);
  expect(root.tagName).toBe("DIV");
  expect(root).toHaveClass("oo-ui-layout");
  expect(root).toHaveClass("oo-ui-panelLayout");
  expect(root).toHaveClass("oo-ui-tabPanelLayout");
  expect(root).toHaveClass("oo-ui-tabPanelLayout-active");
  expect(root).toHaveAttribute("role", "tabpanel");
});

it("未激活不输出激活类；页签集透入的label/value/disabled被吞掉", async () => {
  const screen = await render(
    <TabPanelLayout label={<span>页签</span>} value="a" disabled>
      内容
    </TabPanelLayout>,
  );
  const root = getRoot(screen);
  expect(root).not.toHaveClass("oo-ui-tabPanelLayout-active");
  expect(root.hasAttribute("value")).toBe(false);
  expect(root.hasAttribute("disabled")).toBe(false);
  expect(root.textContent).toBe("内容");
});
