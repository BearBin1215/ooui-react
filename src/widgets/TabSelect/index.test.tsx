import { expect, it, vi } from "vitest";
import { render } from "vitest-browser-react";
import { TabSelect } from ".";
import { getRoot, pressMouse, pressKey, tick } from "../../testing";

const OPTIONS = [
  { children: "甲", value: "a" },
  { children: "乙", value: "b" },
  { children: "丙", value: "c", disabled: true },
  { children: "丁", value: "d" },
] as const;

const getOption = (screen: { container: Element }, name: string) =>
  [...getRoot(screen).querySelectorAll<HTMLElement>("[role=tab]")].find(
    (option) => option.textContent === name,
  )!;

/**
 * TabSelect（对齐原版OO.ui.TabSelectWidget）的浏览器渲染契约：
 * tablist根与framed/frameless类、点击与键盘直选（环绕、跳过禁用项）、组禁用、
 * aria-activedescendant（指向选中页签）。
 */
it("结构：tablist根与select/tabSelect类链，framed缺省输出边框类", async () => {
  const screen = await render(<TabSelect options={[...OPTIONS]} defaultValue="a" />);
  const root = getRoot(screen);
  expect(root).toHaveClass("oo-ui-widget");
  expect(root).toHaveClass("oo-ui-selectWidget");
  expect(root).toHaveClass("oo-ui-tabSelectWidget");
  expect(root).toHaveClass("oo-ui-tabSelectWidget-framed");
  expect(root).toHaveAttribute("role", "tablist");
  expect(root).toHaveAttribute("tabIndex", "0");
  expect(root.querySelectorAll("[role=tab]")).toHaveLength(4);
  expect(getOption(screen, "丙")).toHaveClass("oo-ui-widget-disabled");
  expect(getOption(screen, "甲")).toHaveClass("oo-ui-widget-enabled");
  expect(getOption(screen, "甲")).toHaveAttribute("aria-selected", "true");

  await screen.rerender(<TabSelect options={[...OPTIONS]} framed={false} />);
  expect(getRoot(screen)).toHaveClass("oo-ui-tabSelectWidget-frameless");
});

it("点击页签选定：onChange派发并更新aria-selected", async () => {
  const onChange = vi.fn<(value: string | number) => void>();
  const screen = await render(
    <TabSelect options={[...OPTIONS]} defaultValue="a" onChange={onChange} />,
  );
  pressMouse(getOption(screen, "乙"));
  await tick();
  expect(onChange).toHaveBeenCalledWith("b");
  expect(getOption(screen, "乙")).toHaveAttribute("aria-selected", "true");
  expect(getOption(screen, "甲")).toHaveAttribute("aria-selected", "false");
});

it("aria-activedescendant：指向选中页签（初始选中与改选）", async () => {
  const screen = await render(<TabSelect options={[...OPTIONS]} defaultValue="a" />);
  const root = getRoot(screen);
  expect(root.getAttribute("aria-activedescendant")).toBe(getOption(screen, "甲").id);
  pressMouse(getOption(screen, "乙"));
  await tick();
  expect(root.getAttribute("aria-activedescendant")).toBe(getOption(screen, "乙").id);
});

it("aria-activedescendant：无选中项时不输出", async () => {
  const screen = await render(<TabSelect options={[...OPTIONS]} />);
  expect(getRoot(screen)).not.toHaveAttribute("aria-activedescendant");
});

it("键盘直选：←→环绕改选并跳过禁用项", async () => {
  const onChange = vi.fn<(value: string | number) => void>();
  const screen = await render(
    <TabSelect options={[...OPTIONS]} defaultValue="b" onChange={onChange} />,
  );
  const root = getRoot(screen);
  root.focus();
  // 乙的下一项丙禁用：直接到丁
  pressKey(root, "ArrowRight");
  await tick();
  expect(onChange.mock.calls[0]?.[0]).toBe("d");
  // 末项向后环绕回首项
  pressKey(root, "ArrowRight");
  await tick();
  expect(onChange.mock.calls[1]?.[0]).toBe("a");
  // 首项向前环绕回末项
  pressKey(root, "ArrowLeft");
  await tick();
  expect(onChange.mock.calls[2]?.[0]).toBe("d");
});

it("点击页签后焦点收进组根：无需先聚焦即可方向键改选（略优于原版）", async () => {
  const onChange = vi.fn<(value: string | number) => void>();
  const screen = await render(
    <TabSelect options={[...OPTIONS]} defaultValue="a" onChange={onChange} />,
  );
  const root = getRoot(screen);
  // 点击前焦点在别处：模拟先点按钮、再点页签的真实序列
  const outside = document.createElement("button");
  document.body.append(outside);
  outside.focus();
  expect(document.activeElement).toBe(outside);
  pressMouse(getOption(screen, "乙"));
  await tick();
  expect(document.activeElement).toBe(root);
  pressKey(root, "ArrowRight");
  await tick();
  expect(onChange).toHaveBeenCalledWith("d");
  outside.remove();
});

it("组禁用：根与选项均输出禁用态并退出Tab序，键盘与点击均不提交", async () => {
  const onChange = vi.fn<(value: string | number) => void>();
  const screen = await render(
    <TabSelect options={[...OPTIONS]} disabled onChange={onChange} />,
  );
  const root = getRoot(screen);
  expect(root).toHaveClass("oo-ui-widget-disabled");
  expect(root).toHaveAttribute("aria-disabled", "true");
  expect(root).toHaveAttribute("tabIndex", "-1");
  // 组禁用下发到选项（原版GroupWidget.setDisabled传播；主题禁用外观只认选项自身的类）
  expect(getOption(screen, "甲")).toHaveClass("oo-ui-widget-disabled");
  expect(getOption(screen, "甲")).toHaveAttribute("aria-disabled", "true");
  pressKey(root, "ArrowRight");
  pressMouse(getOption(screen, "甲"));
  await tick();
  expect(onChange).not.toHaveBeenCalled();
});
