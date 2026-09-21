import { expect, it, vi } from "vitest";
import { render } from "vitest-browser-react";
import type { ChangeEvent } from "react";
import { clickElement, getRoot, openSettled, pressMouse, tick } from "../../testing";
import { DropdownInput } from ".";
import { OOUIProvider } from "../../config";

const OPTIONS = [
  { children: "甲", value: "a" },
  { children: "分组" },
  { children: "乙", value: "b" },
] as const;

const getSelect = (screen: { container: Element }) =>
  getRoot(screen).querySelector<HTMLSelectElement>("select")!;

/**
 * DropdownInput（对齐原版OO.ui.DropdownInputWidget）的浏览器渲染契约：
 * Dropdown展示 + 隐藏select承载表单提交（分组标题→optgroup、值类型还原）、
 * 非法值回退首个可选值并回写、禁用/必填落点、isMobile形态类。
 */
it("结构：dropdownInput类链与隐藏select承载提交，分组标题为optgroup", async () => {
  const screen = await render(
    <DropdownInput options={[...OPTIONS]} name="pick" required />,
  );
  const root = getRoot(screen);
  expect(root).toHaveClass("oo-ui-widget");
  expect(root).toHaveClass("oo-ui-inputWidget");
  expect(root).toHaveClass("oo-ui-dropdownInputWidget");

  const select = getSelect(screen);
  expect(select).toHaveClass("oo-ui-inputWidget-input");
  expect(select.getAttribute("name")).toBe("pick");
  expect(select.required).toBe(true);
  // 分组标题与前后选项按声明顺序成组
  const optgroup = select.querySelector("optgroup")!;
  expect(optgroup.getAttribute("label")).toBe("分组");
  expect(optgroup.querySelector("option")!.getAttribute("value")).toBe("b");
  expect(select.value).toBe("a");

  // 独立下箭头指示器（移动端形态由主题CSS转为可见）+ 内层Dropdown展示
  expect(
    root.querySelector(".oo-ui-indicatorElement-indicator.oo-ui-indicator-down"),
  ).toBeTruthy();
  const handle = root.querySelector(".oo-ui-dropdownWidget-handle")!;
  expect(handle.textContent).toContain("甲");
});

it("受控值为非法值时回退首个可选值并回写onChange", async () => {
  const onChange = vi.fn<(value: string | number) => void>();
  const screen = await render(
    <DropdownInput options={[...OPTIONS]} value="missing" onChange={onChange} />,
  );
  expect(getSelect(screen).value).toBe("a");
  expect(onChange).toHaveBeenCalledWith("a");
});

it("原生select的change按选项原值类型提交onChange并携带原生事件", async () => {
  const onChange =
    vi.fn<(value: string | number, event?: ChangeEvent<HTMLSelectElement>) => void>();
  const screen = await render(
    <DropdownInput
      options={[
        { children: "甲", value: 1 },
        { children: "乙", value: 2 },
      ]}
      defaultValue={1}
      onChange={onChange}
    />,
  );
  const select = getSelect(screen);
  expect(select.value).toBe("1");
  select.value = "2";
  select.dispatchEvent(new Event("change", { bubbles: true }));
  await tick();
  // select的值恒为字符串，组件映射回选项原值（数字）再提交；第二参数为原生change事件
  expect(onChange).toHaveBeenCalledTimes(1);
  const [value, event] = onChange.mock.calls[0];
  expect(value).toBe(2);
  expect(event?.type).toBe("change");
  expect(event?.target).toBe(select);
});

it("桌面Dropdown菜单选定提交onChange但不携带原生事件", async () => {
  const onChange =
    vi.fn<(value: string | number, event?: ChangeEvent<HTMLSelectElement>) => void>();
  const screen = await render(
    <DropdownInput options={[...OPTIONS]} defaultValue="a" onChange={onChange} />,
  );
  const handle = getRoot(screen).querySelector<HTMLElement>(
    ".oo-ui-dropdownWidget-handle",
  )!;
  await handle.click();
  await openSettled();
  const menu = document.getElementById(handle.getAttribute("aria-owns")!)!;
  const option = [...menu.querySelectorAll<HTMLElement>("[role=option]")].find(
    (item) => item.textContent === "乙",
  )!;
  pressMouse(option);
  clickElement(option);
  await tick();
  const [value, event] = onChange.mock.calls.at(-1)!;
  expect(value).toBe("b");
  // 菜单选定无原生change事件（原版的change亦为程序化派发）
  expect(event).toBeUndefined();
  expect(getSelect(screen).value).toBe("b");
});

it("禁用：根与select输出禁用态，select.disabled使其退出表单提交", async () => {
  const screen = await render(<DropdownInput options={[...OPTIONS]} disabled />);
  const root = getRoot(screen);
  expect(root).toHaveClass("oo-ui-widget-disabled");
  expect(root).toHaveAttribute("aria-disabled", "true");
  expect(getSelect(screen).disabled).toBe(true);
});

it("isMobile配置：根输出oo-ui-isMobile类（主题据此显示原生select）", async () => {
  const screen = await render(
    <OOUIProvider isMobile>
      <DropdownInput options={[...OPTIONS]} />
    </OOUIProvider>,
  );
  expect(getRoot(screen)).toHaveClass("oo-ui-isMobile");
});
