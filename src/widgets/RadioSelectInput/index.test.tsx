import { expect, it, vi } from "vitest";
import { render } from "vitest-browser-react";
import type { ChangeEvent } from "react";
import { getRoot, tick } from "../../testing";
import { RadioSelectInput } from ".";

const OPTIONS = [
  { children: "甲", value: "a" },
  { children: "乙", value: "b" },
  { children: "丙", value: "c", disabled: true },
] as const;

const getHiddenInput = (screen: { container: Element }) =>
  getRoot(screen).querySelector<HTMLInputElement>(":scope > input")!;
const getOption = (screen: { container: Element }, name: string) =>
  [...getRoot(screen).querySelectorAll<HTMLElement>("[role=radio]")].find(
    (option) => option.textContent === name,
  )!;

/**
 * RadioSelectInput（对齐原版OO.ui.RadioSelectInputWidget）的浏览器渲染契约：
 * RadioSelect展示 + 隐藏input承载表单提交、始终存在选中项（非法值回退首个可选值）、
 * 改选同步隐藏input的值、禁用下发。
 */
it("结构：根承载input/radioSelectInput类链，隐藏input承载表单提交，内层RadioSelect展示", async () => {
  const screen = await render(<RadioSelectInput options={[...OPTIONS]} name="pick" />);
  const root = getRoot(screen);
  expect(root).toHaveClass("oo-ui-widget");
  expect(root).toHaveClass("oo-ui-inputWidget");
  expect(root).toHaveClass("oo-ui-radioSelectInputWidget");

  const hidden = getHiddenInput(screen);
  expect(hidden).toHaveClass("oo-ui-inputWidget-input");
  expect(hidden).toHaveClass("oo-ui-element-hidden");
  expect(hidden.getAttribute("name")).toBe("pick");
  // 提交载体：值由state驱动，readOnly仅屏蔽React受控告警（readonly字段照常参与提交）
  expect(hidden.readOnly).toBe(true);
  // 始终存在选中项：无值时生效值回退首个可选值
  expect(hidden.value).toBe("a");

  const group = root.querySelector(".oo-ui-radioSelectWidget")!;
  expect(group).toHaveAttribute("role", "radiogroup");
  expect(group.querySelectorAll("[role=radio]")).toHaveLength(3);
});

it("受控值为非法值时回退首个可选值并回写onChange", async () => {
  const onChange = vi.fn<(value: string | number) => void>();
  const screen = await render(
    <RadioSelectInput options={[...OPTIONS]} value="missing" onChange={onChange} />,
  );
  expect(getHiddenInput(screen).value).toBe("a");
  expect(onChange).toHaveBeenCalledWith("a");
});

it("改选：点击选项提交onChange并同步隐藏input的值，携带radio原生change事件", async () => {
  const onChange =
    vi.fn<(value: string | number, event?: ChangeEvent<HTMLInputElement>) => void>();
  const screen = await render(
    <RadioSelectInput options={[...OPTIONS]} defaultValue="a" onChange={onChange} />,
  );
  getOption(screen, "乙").dispatchEvent(
    new MouseEvent("click", { bubbles: true, cancelable: true }),
  );
  await tick();
  expect(getHiddenInput(screen).value).toBe("b");
  expect(onChange).toHaveBeenCalledTimes(1);
  const [value, event] = onChange.mock.calls[0];
  expect(value).toBe("b");
  expect(event?.type).toBe("change");
  expect((event?.target as HTMLElement)?.tagName).toBe("INPUT");
});

it("键盘改选：提交onChange但不携带原生事件（对齐原版chooseItem→setSelected的静默更新）", async () => {
  const onChange =
    vi.fn<(value: string | number, event?: ChangeEvent<HTMLInputElement>) => void>();
  const screen = await render(
    <RadioSelectInput options={[...OPTIONS]} defaultValue="a" onChange={onChange} />,
  );
  const group = getRoot(screen).querySelector<HTMLElement>("[role=radiogroup]")!;
  group.focus();
  group.dispatchEvent(
    new KeyboardEvent("keydown", { key: "ArrowDown", bubbles: true, cancelable: true }),
  );
  await tick();
  expect(getHiddenInput(screen).value).toBe("b");
  const [value, event] = onChange.mock.calls[0];
  expect(value).toBe("b");
  expect(event).toBeUndefined();
});

it("禁用：根与隐藏input输出禁用态，input.disabled使其退出表单提交", async () => {
  const screen = await render(<RadioSelectInput options={[...OPTIONS]} disabled />);
  const root = getRoot(screen);
  expect(root).toHaveClass("oo-ui-widget-disabled");
  expect(root).toHaveAttribute("aria-disabled", "true");
  expect(getHiddenInput(screen).disabled).toBe(true);
});
