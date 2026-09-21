import { expect, it, vi } from "vitest";
import { render } from "vitest-browser-react";
import { clickElement, getRoot, pressMouse, tick } from "../../testing";
import { Button } from "../../widgets/Button";
import { BookletLayout, type BookletLayoutProps } from ".";

const getPages = (screen: { container: Element }) => [
  ...getRoot(screen).querySelectorAll<HTMLElement>(".oo-ui-pageLayout"),
];
const getMovers = (screen: { container: Element }) => [
  ...getRoot(screen).querySelectorAll<HTMLElement>(
    ".oo-ui-outlineControlsWidget-movers .oo-ui-buttonElement",
  ),
];
const clickButton = (button: HTMLElement) =>
  clickElement(button.querySelector(".oo-ui-buttonElement-button")!);

/** 三页：甲/乙可移动可移除，丙不可（用于推导大纲控制按钮的禁用规则） */
const makeOptions = (): BookletLayoutProps["options"] => [
  { value: "a", label: "甲", movable: true, removable: true, children: <p>甲内容</p> },
  { value: "b", label: "乙", movable: true, removable: true, children: <p>乙内容</p> },
  { value: "c", label: "丙", children: <p>丙内容</p> },
];

/**
 * BookletLayout（对齐原版OO.ui.BookletLayout）的浏览器渲染契约：
 * 未开启outlined时不下挂大纲子树、outlined时的大纲面板与OutlineSelect、
 * editable的大纲控制控件（禁用规则与回调）、激活页被移除时的邻近补选。
 */
it("未开启outlined：showMenu=false且不下挂大纲子树，仅渲染面板栈", async () => {
  const screen = await render(<BookletLayout options={makeOptions()} />);
  const root = getRoot(screen);
  expect(root).toHaveClass("oo-ui-layout");
  expect(root).toHaveClass("oo-ui-menuLayout");
  expect(root).toHaveClass("oo-ui-bookletLayout");
  expect(root).toHaveClass("oo-ui-menuLayout-hideMenu");

  const menu = root.querySelector(".oo-ui-menuLayout-menu")!;
  expect(menu).toHaveAttribute("aria-hidden", "true");
  expect(menu.textContent).toBe("");
  expect(root.querySelector(".oo-ui-outlineSelectWidget")).toBeNull();

  const pages = getPages(screen);
  expect(pages).toHaveLength(3);
  expect(pages[0]).toHaveClass("oo-ui-pageLayout-active");
  expect(pages[0]).not.toHaveAttribute("hidden");
  expect(pages[1]).toHaveAttribute("hidden");
});

it("outlined：渲染大纲面板与OutlineSelect，选项文本取自label，激活项呈选中态", async () => {
  const screen = await render(
    <BookletLayout options={makeOptions()} outlined defaultValue="b" />,
  );
  const root = getRoot(screen);
  expect(root).toHaveClass("oo-ui-menuLayout-showMenu");

  const outlinePanel = root.querySelector(".oo-ui-bookletLayout-outlinePanel")!;
  expect(outlinePanel).toHaveClass("oo-ui-panelLayout-scrollable");
  const outlineOptions = [
    ...outlinePanel.querySelectorAll<HTMLElement>(".oo-ui-outlineOptionWidget"),
  ];
  expect(outlineOptions.map((option) => option.textContent)).toEqual(["甲", "乙", "丙"]);
  expect(outlineOptions[1]).toHaveAttribute("aria-selected", "true");
  // 未开启editable时不渲染大纲控制控件
  expect(outlinePanel.querySelector(".oo-ui-outlineControlsWidget")).toBeNull();
});

it("点击大纲项切换激活页：面板active/hidden随之转移并回调onChange", async () => {
  const onChange = vi.fn<(value: string | number) => void>();
  const screen = await render(
    <BookletLayout
      options={makeOptions()}
      outlined
      defaultValue="a"
      onChange={onChange}
    />,
  );
  const outline = getRoot(screen).querySelector(".oo-ui-outlineSelectWidget")!;
  const items = [...outline.querySelectorAll<HTMLElement>("[role=option]")];

  pressMouse(items[2]!);
  await tick();
  expect(onChange).toHaveBeenLastCalledWith("c");
  expect(items[2]).toHaveAttribute("aria-selected", "true");

  const pages = getPages(screen);
  expect(pages[2]).toHaveClass("oo-ui-pageLayout-active");
  expect(pages[2]).not.toHaveAttribute("hidden");
  expect(pages[0]).toHaveAttribute("hidden");
});

it("editable：控件区渲染、禁用规则随可移动性推导、回调携带激活页值", async () => {
  const onMoveOption = vi.fn<(value: string | number, direction: -1 | 1) => void>();
  const onRemoveOption = vi.fn<(value: string | number) => void>();
  const screen = await render(
    <BookletLayout
      options={makeOptions()}
      outlined
      editable
      defaultValue="b"
      onMoveOption={onMoveOption}
      onRemoveOption={onRemoveOption}
      outlineControlsExtra={<Button>添加</Button>}
    />,
  );
  const root = getRoot(screen);
  const controls = root.querySelector(".oo-ui-outlineControlsWidget")!;
  expect(
    controls.querySelector(".oo-ui-outlineControlsWidget-items")!.textContent,
  ).toContain("添加");

  const movers = getMovers(screen);
  expect(movers).toHaveLength(3);
  // 激活页乙可移动且为末个可移动项：上移可用、下移禁用；可移除故移除可用
  expect(movers[0]).not.toHaveClass("oo-ui-widget-disabled");
  expect(movers[1]).toHaveClass("oo-ui-widget-disabled");
  expect(movers[2]).not.toHaveClass("oo-ui-widget-disabled");
  expect(
    movers[0]!.querySelector(".oo-ui-buttonElement-button")!.getAttribute("title"),
  ).toBe("Move item up");

  clickButton(movers[0]!);
  await tick();
  expect(onMoveOption).toHaveBeenCalledWith("b", -1);
  clickButton(movers[2]!);
  await tick();
  expect(onRemoveOption).toHaveBeenCalledWith("b");
});

it("editable：激活页不可移动也不可移除时三个控制按钮全禁用", async () => {
  const screen = await render(
    <BookletLayout options={makeOptions()} outlined editable defaultValue="c" />,
  );
  for (const mover of getMovers(screen)) {
    expect(mover).toHaveClass("oo-ui-widget-disabled");
  }
});

it("激活页被移除：按原版stack口径补选（下一个未被移除项→新末项）并回调onChange", async () => {
  const onChange = vi.fn<(value: string | number) => void>();
  const options = makeOptions();
  const screen = await render(
    <BookletLayout options={options} defaultValue="b" onChange={onChange} />,
  );
  const [first, , third] = options;
  await screen.rerender(
    <BookletLayout options={[first!, third!]} defaultValue="b" onChange={onChange} />,
  );
  await tick();
  expect(onChange).toHaveBeenCalledWith("c");
  const pages = getPages(screen);
  expect(pages[1]).toHaveClass("oo-ui-pageLayout-active");
});
