import { expect, it, vi } from "vitest";
import { render } from "vitest-browser-react";
import { clickElement, getRoot, tick } from "../../testing";
import { RadioSelect } from ".";

const OPTIONS = [
  { children: "甲", value: "a" },
  { children: "乙", value: "b" },
  { children: "丙", value: "c", disabled: true },
  { children: "丁", value: "d" },
] as const;

const getOptions = (screen: { container: Element }) => [
  ...getRoot(screen).querySelectorAll<HTMLElement>("[role=radio]"),
];
const getOption = (screen: { container: Element }, name: string) =>
  getOptions(screen).find((option) => option.textContent === name)!;

/**
 * RadioSelect（对齐原版OO.ui.RadioSelectWidget）的浏览器渲染契约：
 * radiogroup语义与按压态类、点击改选、↑↓←→环绕直接改选（跳过禁用项）、
 * 聚焦无选中项时自动选中首个非禁用项、组禁用的键盘/鼠标全禁。
 */
it("结构：radiogroup角色+select/radioSelect类链+unpressed类，radio选项屏蔽原生语义", async () => {
  const screen = await render(<RadioSelect options={[...OPTIONS]} />);
  const root = getRoot(screen);
  expect(root).toHaveClass("oo-ui-widget");
  expect(root).toHaveClass("oo-ui-selectWidget");
  expect(root).toHaveClass("oo-ui-radioSelectWidget");
  expect(root).toHaveClass("oo-ui-selectWidget-unpressed");
  expect(root).toHaveAttribute("role", "radiogroup");
  expect(root).toHaveAttribute("tabIndex", "0");
  // 内层radio以tabIndex=-1+role=presentation屏蔽，由外层label承担读屏语义
  const input = getOption(screen, "甲").querySelector("input")!;
  expect(input).toHaveAttribute("tabIndex", "-1");
  expect(input).toHaveAttribute("role", "presentation");
});

it("点击改选：onChange派发、选项输出selected类与aria-checked", async () => {
  const onChange = vi.fn<(value: string | number) => void>();
  const screen = await render(<RadioSelect options={[...OPTIONS]} onChange={onChange} />);
  clickElement(getOption(screen, "乙"));
  await tick();
  expect(onChange).toHaveBeenCalledOnce();
  expect(onChange.mock.calls[0]?.[0]).toBe("b");
  expect(getOption(screen, "乙")).toHaveClass("oo-ui-optionWidget-selected");
  expect(getOption(screen, "乙")).toHaveAttribute("aria-checked", "true");
  expect(getOption(screen, "甲")).toHaveAttribute("aria-checked", "false");

  clickElement(getOption(screen, "甲"));
  await tick();
  expect(onChange.mock.calls[1]?.[0]).toBe("a");
  expect(getOption(screen, "乙")).toHaveAttribute("aria-checked", "false");
});

it("按压态：左键按下输出pressed类，抬起/移出复位", async () => {
  const screen = await render(<RadioSelect options={[...OPTIONS]} />);
  const root = getRoot(screen);
  root.dispatchEvent(
    new MouseEvent("mousedown", { bubbles: true, cancelable: true, button: 0 }),
  );
  await tick();
  expect(root).toHaveClass("oo-ui-selectWidget-pressed");
  expect(root).not.toHaveClass("oo-ui-selectWidget-unpressed");
  root.dispatchEvent(new MouseEvent("mouseup", { bubbles: true }));
  await tick();
  expect(root).toHaveClass("oo-ui-selectWidget-unpressed");
  root.dispatchEvent(
    new MouseEvent("mousedown", { bubbles: true, cancelable: true, button: 0 }),
  );
  // React的onMouseLeave由mouseout委托驱动（原生mouseleave不冒泡）
  root.dispatchEvent(new MouseEvent("mouseout", { bubbles: true }));
  await tick();
  expect(root).toHaveClass("oo-ui-selectWidget-unpressed");
});

it("键盘改选：↑↓←→在可选值间环绕直接改选，禁用项跳过", async () => {
  const onChange = vi.fn<(value: string | number) => void>();
  const screen = await render(
    <RadioSelect options={[...OPTIONS]} defaultValue="a" onChange={onChange} />,
  );
  const root = getRoot(screen);
  root.focus();
  await tick();
  const pressKey = (key: string) =>
    root.dispatchEvent(
      new KeyboardEvent("keydown", { key, bubbles: true, cancelable: true }),
    );
  // a的下一项是乙
  pressKey("ArrowDown");
  await tick();
  expect(onChange.mock.calls[0]?.[0]).toBe("b");
  expect(getOption(screen, "乙")).toHaveAttribute("aria-checked", "true");
  // 乙的下一项丙禁用：直接到丁
  pressKey("ArrowDown");
  await tick();
  expect(onChange.mock.calls[1]?.[0]).toBe("d");
  expect(getOption(screen, "丁")).toHaveAttribute("aria-checked", "true");
  // 末项向下环绕回首项
  pressKey("ArrowDown");
  await tick();
  expect(onChange.mock.calls[2]?.[0]).toBe("a");
  // 首项向上环绕回末项
  pressKey("ArrowUp");
  await tick();
  expect(onChange.mock.calls[3]?.[0]).toBe("d");
});

it("聚焦组且无选中项时自动选中首个非禁用项（对齐原版SelectWidget.onFocus）", async () => {
  const onChange = vi.fn<(value: string | number) => void>();
  const screen = await render(<RadioSelect options={[...OPTIONS]} onChange={onChange} />);
  getRoot(screen).focus();
  await tick();
  expect(onChange).toHaveBeenCalledOnce();
  expect(onChange.mock.calls[0]?.[0]).toBe("a");
  expect(getOption(screen, "甲")).toHaveAttribute("aria-checked", "true");
});

it("聚焦组但已有选中项时不重复提交；Enter重申当前项不派发onChange", async () => {
  const onChange = vi.fn<(value: string | number) => void>();
  const screen = await render(
    <RadioSelect options={[...OPTIONS]} defaultValue="b" onChange={onChange} />,
  );
  const root = getRoot(screen);
  root.focus();
  await tick();
  expect(onChange).not.toHaveBeenCalled();
  root.dispatchEvent(
    new KeyboardEvent("keydown", { key: "Enter", bubbles: true, cancelable: true }),
  );
  expect(onChange).not.toHaveBeenCalled();
});

it("组禁用：root与全部选项输出disabled类链，键盘与点击均不提交", async () => {
  const onChange = vi.fn<(value: string | number) => void>();
  const screen = await render(
    <RadioSelect options={[...OPTIONS]} disabled onChange={onChange} />,
  );
  const root = getRoot(screen);
  expect(root).toHaveClass("oo-ui-widget-disabled");
  expect(root).toHaveAttribute("aria-disabled", "true");
  expect(root).toHaveAttribute("tabIndex", "-1");
  for (const option of getOptions(screen)) {
    expect(option).toHaveClass("oo-ui-widget-disabled");
    expect(option).toHaveAttribute("aria-disabled", "true");
  }
  root.focus();
  root.dispatchEvent(
    new KeyboardEvent("keydown", { key: "ArrowDown", bubbles: true, cancelable: true }),
  );
  clickElement(getOption(screen, "甲"));
  await tick();
  expect(onChange).not.toHaveBeenCalled();
});
