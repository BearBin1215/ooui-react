import { useRef } from "react";
import { expect, it } from "vitest";
import { render } from "vitest-browser-react";
import { OOUIProvider } from "../../config";
import { tick } from "../../testing";
import { MenuSelect } from ".";

const OPTIONS = [
  { value: "apple", label: "苹果" },
  { value: "banana", label: "香蕉" },
];

/** 带锚点的宿主：菜单经portal渲染，锚点仅用于定位与方向解析 */
function Anchor(props: Omit<Parameters<typeof MenuSelect>[0], "options">) {
  const ref = useRef<HTMLDivElement>(null);
  return (
    <>
      <div
        ref={ref}
        style={{ position: "fixed", top: 0, left: 0, width: 120, height: 20 }}
      />
      <MenuSelect {...props} options={OPTIONS} container={ref} />
    </>
  );
}

const getMenu = () => document.querySelector<HTMLElement>(".oo-ui-menuSelectWidget")!;

/**
 * MenuSelect（对齐原版OO.ui.MenuSelectWidget）的浏览器渲染契约：
 * 菜单根输出有效文本方向（Provider.dir覆盖锚点继承方向），无可见项时整个面板隐藏。
 * 其余交互契约在其调用方（Dropdown/MenuTagMultiselect）的用例内覆盖，此处不重复。
 */
it("无可见项：菜单根输出oo-ui-menuSelectWidget-invisible（对齐原版updateItemVisibility的anyVisible）", async () => {
  const screen = await render(<MenuSelect open options={[]} />);
  await tick();
  expect(getMenu()).toHaveClass("oo-ui-menuSelectWidget-invisible");

  await screen.rerender(<MenuSelect open options={OPTIONS} />);
  await tick();
  expect(getMenu()).not.toHaveClass("oo-ui-menuSelectWidget-invisible");
});

it("dir：菜单根输出有效方向，Provider.dir=rtl覆盖锚点继承方向", async () => {
  const screen = await render(<Anchor open />);
  await tick(30);
  expect(getMenu()).toHaveAttribute("dir", "ltr");

  await screen.rerender(
    <OOUIProvider dir="rtl">
      <Anchor open />
    </OOUIProvider>,
  );
  await tick(30);
  expect(getMenu()).toHaveAttribute("dir", "rtl");
});
