import { expect, it, vi } from "vitest";
import { render } from "vitest-browser-react";
import { clickElement, getRoot, pressKey, tick } from "../../testing";
import { CheckboxMultiselect } from ".";

const OPTIONS = [
  { children: "甲", value: "a" },
  { children: "乙", value: "b" },
  { children: "丙", value: "c", disabled: true },
  { children: "丁", value: "d" },
] as const;

const getOptions = (screen: { container: Element }) => [
  ...getRoot(screen).querySelectorAll<HTMLElement>("[role=checkbox]"),
];
const getOption = (screen: { container: Element }, name: string) =>
  getOptions(screen).find((option) => option.textContent === name)!;
const getInput = (screen: { container: Element }, name: string) =>
  getOption(screen, name).querySelector<HTMLInputElement>("input")!;

/**
 * CheckboxMultiselect（对齐原版OO.ui.CheckboxMultiselectWidget）的浏览器渲染契约：
 * multiselect根类链与$group容器、点击勾选的值数组语义（受控/非受控）、
 * Shift+点击范围选择（禁用项跳过）、方向键焦点导航（环绕、跳过禁用项）。
 */
it("结构：multiselect/checkboxMultiselect类链，选项置于group容器", async () => {
  const screen = await render(<CheckboxMultiselect options={[...OPTIONS]} />);
  const root = getRoot(screen);
  expect(root).toHaveClass("oo-ui-widget");
  expect(root).toHaveClass("oo-ui-multiselectWidget");
  expect(root).toHaveClass("oo-ui-checkboxMultiselectWidget");
  expect(root.querySelector(".oo-ui-multiselectWidget-group")!).toBeTruthy();
  expect(root.querySelectorAll("[role=checkbox]")).toHaveLength(4);
});

it("非受控：点击勾选/取消勾选，onChange携带完整值数组", async () => {
  const onChange = vi.fn<(value: Array<string | number>) => void>();
  const screen = await render(
    <CheckboxMultiselect options={[...OPTIONS]} onChange={onChange} />,
  );
  clickElement(getInput(screen, "甲"));
  await tick();
  expect(onChange).toHaveBeenCalledOnce();
  expect(onChange.mock.calls[0]?.[0]).toEqual(["a"]);
  expect(getOption(screen, "甲")).toHaveClass("oo-ui-multioptionWidget-selected");
  expect(getOption(screen, "甲")).toHaveAttribute("aria-checked", "true");

  clickElement(getInput(screen, "乙"));
  await tick();
  expect(onChange.mock.calls[1]?.[0]).toEqual(["a", "b"]);

  clickElement(getInput(screen, "甲"));
  await tick();
  expect(onChange.mock.calls[2]?.[0]).toEqual(["b"]);
  expect(getOption(screen, "甲")).not.toHaveClass("oo-ui-multioptionWidget-selected");
});

it("defaultValue设定初始选中集合", async () => {
  const screen = await render(
    <CheckboxMultiselect options={[...OPTIONS]} defaultValue={["a", "d"]} />,
  );
  expect(getOption(screen, "甲")).toHaveClass("oo-ui-multioptionWidget-selected");
  expect(getOption(screen, "丁")).toHaveAttribute("aria-checked", "true");
  expect(getOption(screen, "乙")).not.toHaveClass("oo-ui-multioptionWidget-selected");
});

it("受控：点击只回调onChange，勾选态随props", async () => {
  const onChange = vi.fn<(value: Array<string | number>) => void>();
  const screen = await render(
    <CheckboxMultiselect options={[...OPTIONS]} value={[]} onChange={onChange} />,
  );
  clickElement(getInput(screen, "甲"));
  await tick();
  expect(onChange.mock.calls[0]?.[0]).toEqual(["a"]);
  expect(getOption(screen, "甲")).not.toHaveClass("oo-ui-multioptionWidget-selected");

  await screen.rerender(
    <CheckboxMultiselect options={[...OPTIONS]} value={["a"]} onChange={onChange} />,
  );
  expect(getOption(screen, "甲")).toHaveClass("oo-ui-multioptionWidget-selected");
});

it("Shift+点击范围选择：从上次点击项到当前项统一置为当前项翻转后的状态，禁用项保持原状", async () => {
  const onChange = vi.fn<(value: Array<string | number>) => void>();
  const screen = await render(
    <CheckboxMultiselect options={[...OPTIONS]} onChange={onChange} />,
  );
  // 先正常点击甲建立范围起点
  clickElement(getInput(screen, "甲"));
  await tick();
  // Shift+点击丁：区间甲乙丙丁统一置为勾选，禁用的丙保持未选
  clickElement(getInput(screen, "丁"), { shiftKey: true });
  await tick();
  expect(onChange.mock.calls[1]?.[0]).toEqual(["a", "b", "d"]);
  expect(getOption(screen, "乙")).toHaveAttribute("aria-checked", "true");
  expect(getOption(screen, "丙")).toHaveAttribute("aria-checked", "false");

  // 再Shift+点击乙（当前已勾选）：区间乙丙丁统一取消勾选，丙保持原状
  clickElement(getInput(screen, "乙"), { shiftKey: true });
  await tick();
  expect(onChange.mock.calls[2]?.[0]).toEqual(["a"]);
  expect(getOption(screen, "丁")).toHaveAttribute("aria-checked", "false");
});

it("方向键焦点导航：↑↓在非禁用项间移动焦点并环绕，跳过禁用项", async () => {
  const screen = await render(<CheckboxMultiselect options={[...OPTIONS]} />);
  getInput(screen, "甲").focus();

  pressKey(getOption(screen, "甲"), "ArrowDown");
  expect(document.activeElement).toBe(getInput(screen, "乙"));
  // 乙的下一项丙禁用：跳到丁
  pressKey(getOption(screen, "乙"), "ArrowDown");
  expect(document.activeElement).toBe(getInput(screen, "丁"));
  // 末项向下环绕回首项
  pressKey(getOption(screen, "丁"), "ArrowDown");
  expect(document.activeElement).toBe(getInput(screen, "甲"));
  // 向上环绕回末项
  pressKey(getOption(screen, "甲"), "ArrowUp");
  expect(document.activeElement).toBe(getInput(screen, "丁"));
});

it("组禁用：全部选项随组禁用（含未声明disabled的项），点击不提交", async () => {
  const onChange = vi.fn<(value: Array<string | number>) => void>();
  const screen = await render(
    <CheckboxMultiselect options={[...OPTIONS]} disabled onChange={onChange} />,
  );
  const root = getRoot(screen);
  expect(root).toHaveClass("oo-ui-widget-disabled");
  expect(root).toHaveAttribute("aria-disabled", "true");
  for (const option of root.querySelectorAll("[role=checkbox]")) {
    expect(option).toHaveClass("oo-ui-widget-disabled");
    expect(option).toHaveAttribute("aria-disabled", "true");
  }
  // 经label点击走原生激活路径：禁用控件不响应激活（直接对input派发click会绕过禁用拦截）
  clickElement(getOption(screen, "甲"));
  await tick();
  expect(onChange).not.toHaveBeenCalled();
});
