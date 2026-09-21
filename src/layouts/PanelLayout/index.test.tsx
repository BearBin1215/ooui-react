import { expect, it } from "vitest";
import { render } from "vitest-browser-react";
import { getRoot } from "../../testing";
import { PanelLayout } from ".";

/**
 * PanelLayout（对齐原版OO.ui.PanelLayout）的类组合契约：
 * expanded缺省true、scrollable/padded/framed按需输出、hidden经Layout承担。
 */
it("缺省：仅输出panelLayout与expanded类", async () => {
  const screen = await render(<PanelLayout>内容</PanelLayout>);
  const root = getRoot(screen);
  expect(root).toHaveClass("oo-ui-layout");
  expect(root).toHaveClass("oo-ui-panelLayout");
  expect(root).toHaveClass("oo-ui-panelLayout-expanded");
  expect(root).not.toHaveClass("oo-ui-panelLayout-scrollable");
  expect(root).not.toHaveClass("oo-ui-panelLayout-padded");
  expect(root).not.toHaveClass("oo-ui-panelLayout-framed");
});

it("布尔修饰类按props输出；expanded=false不输出", async () => {
  const screen = await render(
    <PanelLayout scrollable padded framed expanded={false}>
      内容
    </PanelLayout>,
  );
  const root = getRoot(screen);
  expect(root).toHaveClass("oo-ui-panelLayout-scrollable");
  expect(root).toHaveClass("oo-ui-panelLayout-padded");
  expect(root).toHaveClass("oo-ui-panelLayout-framed");
  expect(root).not.toHaveClass("oo-ui-panelLayout-expanded");
});

it("hidden=true：输出hidden属性、aria-hidden与element-hidden类", async () => {
  const screen = await render(<PanelLayout hidden>内容</PanelLayout>);
  const root = getRoot(screen);
  expect(root).toHaveAttribute("hidden");
  expect(root).toHaveAttribute("aria-hidden", "true");
  expect(root).toHaveClass("oo-ui-element-hidden");
});
