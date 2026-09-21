import { expect, it, vi } from "vitest";
import { render } from "vitest-browser-react";
import { getRoot, tick } from "../../testing";
import { MenuTagMultiselect } from ".";

const OPTIONS = [
  { value: "apple", label: "苹果" },
  { value: "banana", label: "香蕉" },
];

const getMenu = () => document.querySelector<HTMLElement>(".oo-ui-menuSelectWidget")!;
const getMenuOption = (label: string) =>
  [...getMenu().querySelectorAll<HTMLElement>("[role=option]")].find(
    (option) => option.textContent === label,
  )!;
const getTagCloseButton = (screen: { container: Element }) =>
  screen.container.querySelector<HTMLElement>(
    ".oo-ui-tagItemWidget .oo-ui-buttonElement-button",
  )!;

/**
 * MenuTagMultiselect（对齐原版OO.ui.MenuTagMultiselectWidget）的浏览器渲染契约：
 * 候选菜单portal至body、菜单项选中态与标签集合双向同步
 * （已添加标签的菜单项呈选中态，移除标签同步取消选中）。
 * 输入过滤/Enter选定/失焦提交见TagMultiselect用例（两组件共用同一实现）。
 */
it("结构：menuTagMultiselect类链与候选菜单（portal至body）", async () => {
  const screen = await render(<MenuTagMultiselect options={OPTIONS} />);
  const root = getRoot(screen);
  expect(root).toHaveClass("oo-ui-tagMultiselectWidget");
  expect(root).toHaveClass("oo-ui-menuTagMultiselectWidget");
  expect(getMenu().querySelectorAll("[role=option]")).toHaveLength(2);
});

it("已添加标签对应的菜单项呈选中态；移除标签同步取消选中", async () => {
  const onChange = vi.fn<(value: (string | number)[]) => void>();
  const screen = await render(
    <MenuTagMultiselect
      options={OPTIONS}
      defaultValue={["banana"]}
      onChange={onChange}
    />,
  );
  expect(getMenuOption("香蕉")).toHaveClass("oo-ui-optionWidget-selected");
  expect(getMenuOption("苹果")).not.toHaveClass("oo-ui-optionWidget-selected");

  await getTagCloseButton(screen).click();
  await tick();
  expect(onChange.mock.calls[0]?.[0]).toEqual([]);
  expect(getMenuOption("香蕉")).not.toHaveClass("oo-ui-optionWidget-selected");
});
