import { expect, it, vi } from "vitest";
import { render } from "vitest-browser-react";
import { SearchWidget } from ".";
import { getRoot, pressKey, tick, typeValue } from "../../testing";

const RESULTS = [
  { children: "甲", value: "a" },
  { children: "乙", value: "b" },
  { children: "丙", value: "c", disabled: true },
] as const;

const getInput = (screen: { container: Element }) =>
  getRoot(screen).querySelector<HTMLInputElement>(".oo-ui-searchWidget-query input")!;

/**
 * SearchWidget（对齐原版OO.ui.SearchWidget）的浏览器渲染契约：
 * searchWidget根 + results结果列表 + query查询框、查询变化回调、键盘在结果间移动高亮
 * （环绕）与Enter选定、结果/查询变化清除高亮、
 * disabled下发（根/结果列表/查询框）与非受控defaultValue的初始查询值。
 */
it("结构：searchWidget根下results列表与query查询框，列表不作Tab停靠点", async () => {
  const screen = await render(<SearchWidget results={[...RESULTS]} placeholder="搜索" />);
  const root = getRoot(screen);
  expect(root).toHaveClass("oo-ui-widget");
  expect(root).toHaveClass("oo-ui-searchWidget");

  const listbox = root.querySelector(".oo-ui-searchWidget-results [role=listbox]")!;
  expect(listbox).toHaveClass("oo-ui-selectWidget");
  // 对齐原版SelectWidget根（非TabIndexedElement）：不输出tabindex，既不进Tab序也不可编程聚焦
  expect(listbox).not.toHaveAttribute("tabIndex");
  expect(listbox.querySelectorAll("[role=option]")).toHaveLength(3);

  const input = getInput(screen);
  expect(input.getAttribute("type")).toBe("search");
  expect(input.getAttribute("placeholder")).toBe("搜索");
});

it("查询区↑↓在结果间移动高亮并环绕（跳过禁用项），activedescendant落在查询框", async () => {
  const screen = await render(<SearchWidget results={[...RESULTS]} />);
  const root = getRoot(screen);
  const input = getInput(screen);

  pressKey(input, "ArrowDown");
  await tick();
  const highlighted = root.querySelector(".oo-ui-optionWidget-highlighted")!;
  expect(highlighted.textContent).toContain("甲");
  // 列表根不作activedescendant落点，统一写在持有焦点的查询框上（focusOwnerRef）
  expect(input.getAttribute("aria-activedescendant")).toBe(
    highlighted.getAttribute("id"),
  );
  expect(root.querySelector("[role=listbox]")).not.toHaveAttribute(
    "aria-activedescendant",
  );

  pressKey(input, "ArrowDown");
  await tick();
  expect(root.querySelector(".oo-ui-optionWidget-highlighted")!.textContent).toContain(
    "乙",
  );
  // 末个可选项向下环绕回首项
  pressKey(input, "ArrowDown");
  await tick();
  expect(root.querySelector(".oo-ui-optionWidget-highlighted")!.textContent).toContain(
    "甲",
  );
});

it("Enter选定高亮结果；无高亮时Enter不回调", async () => {
  const onChoose = vi.fn<(value: string | number) => void>();
  const screen = await render(
    <SearchWidget results={[...RESULTS]} onChoose={onChoose} />,
  );
  const input = getInput(screen);

  pressKey(input, "Enter");
  await tick();
  expect(onChoose).not.toHaveBeenCalled();

  pressKey(input, "ArrowDown");
  await tick();
  pressKey(input, "Enter");
  await tick();
  expect(onChoose).toHaveBeenCalledWith("a");
});

it("查询变化经onQueryChange提交（受控query驱动输入值）", async () => {
  const onQueryChange = vi.fn<(value: string) => void>();
  const screen = await render(
    <SearchWidget results={[...RESULTS]} onQueryChange={onQueryChange} />,
  );
  const input = getInput(screen);
  await typeValue(input, "kw");
  // 查询变化回调携带原始change事件（ChangeHandler的第二参数）
  expect(onQueryChange.mock.calls[0]?.[0]).toBe("kw");
  expect(input.value).toBe("kw");
});

it("disabled：根与结果列表输出禁用态，查询框input同步禁用", async () => {
  const screen = await render(<SearchWidget results={[...RESULTS]} disabled />);
  const root = getRoot(screen);
  expect(root).toHaveClass("oo-ui-widget-disabled");
  expect(root).toHaveAttribute("aria-disabled", "true");
  const listbox = root.querySelector(".oo-ui-searchWidget-results [role=listbox]")!;
  expect(listbox).toHaveClass("oo-ui-widget-disabled");
  expect(getInput(screen)).toHaveAttribute("disabled");

  // 查询区键盘通道随之关闭：↑↓不再移动高亮
  pressKey(getInput(screen), "ArrowDown");
  await tick();
  expect(root.querySelector(".oo-ui-optionWidget-highlighted")).toBeNull();
});

it("非受控defaultValue：初始查询值渲染，键入后回调携带新值", async () => {
  const onQueryChange = vi.fn<(value: string) => void>();
  const screen = await render(
    <SearchWidget
      results={[...RESULTS]}
      defaultValue="kw"
      onQueryChange={onQueryChange}
    />,
  );
  expect(getInput(screen).value).toBe("kw");
  await typeValue(getInput(screen), "kw2");
  // 同上：回调第二参为事件，按首参断言
  expect(onQueryChange.mock.calls.at(-1)?.[0]).toBe("kw2");
});

it("查询值变化清除结果高亮（对齐原版查询变化即清空结果的分工）", async () => {
  const screen = await render(<SearchWidget results={[...RESULTS]} />);
  const root = getRoot(screen);
  const input = getInput(screen);
  pressKey(input, "ArrowDown");
  await tick();
  expect(root.querySelector(".oo-ui-optionWidget-highlighted")).toBeTruthy();

  await typeValue(input, "kw");
  expect(root.querySelector(".oo-ui-optionWidget-highlighted")).toBeNull();
});
