import { expect, it, vi } from "vitest";
import { render } from "vitest-browser-react";
import { getRoot, tick } from "../../testing";
import { CheckboxMultiselectInput } from ".";

const OPTIONS = [
  { children: "甲", value: "a" },
  { children: "乙", value: "b" },
  { children: "丙", value: "c", disabled: true },
] as const;

const getInput = (screen: { container: Element }, value: string) =>
  getRoot(screen).querySelector<HTMLInputElement>(`input[value="${value}"]`)!;
const getOption = (screen: { container: Element }, name: string) =>
  [...getRoot(screen).querySelectorAll<HTMLElement>("[role=checkbox]")].find(
    (option) => option.textContent === name,
  )!;

/**
 * CheckboxMultiselectInput（对齐原版OO.ui.CheckboxMultiselectInputWidget）的浏览器渲染契约：
 * CheckboxMultiselect展示 + 各选项checkbox写入name与value承载表单提交、
 * 勾选提交完整值数组、组禁用下发。
 */
it("结构：根承载input/checkboxMultiselectInput类链，各选项checkbox写入name与value", async () => {
  const screen = await render(
    <CheckboxMultiselectInput options={[...OPTIONS]} name="tags" />,
  );
  const root = getRoot(screen);
  expect(root).toHaveClass("oo-ui-widget");
  expect(root).toHaveClass("oo-ui-inputWidget");
  expect(root).toHaveClass("oo-ui-checkboxMultiselectInputWidget");
  expect(root.querySelector(".oo-ui-checkboxMultiselectWidget")).toBeTruthy();

  const inputs = [...root.querySelectorAll<HTMLInputElement>("input[type=checkbox]")];
  expect(inputs).toHaveLength(3);
  expect(inputs.map((input) => input.getAttribute("name"))).toEqual([
    "tags",
    "tags",
    "tags",
  ]);
  // 选项value由组件注入checkbox（调用方传入的checkboxProps.value会被覆盖）
  expect(inputs.map((input) => input.value)).toEqual(["a", "b", "c"]);
});

it("勾选：变更提交完整值数组", async () => {
  const onChange = vi.fn<(value: Array<string | number>) => void>();
  const screen = await render(
    <CheckboxMultiselectInput options={[...OPTIONS]} name="tags" onChange={onChange} />,
  );
  getInput(screen, "a").dispatchEvent(
    new MouseEvent("click", { bubbles: true, cancelable: true }),
  );
  await tick();
  expect(onChange.mock.calls[0]?.[0]).toEqual(["a"]);

  getInput(screen, "b").dispatchEvent(
    new MouseEvent("click", { bubbles: true, cancelable: true }),
  );
  await tick();
  expect(onChange.mock.calls[1]?.[0]).toEqual(["a", "b"]);
});

it("defaultValue设定初始勾选集合", async () => {
  const screen = await render(
    <CheckboxMultiselectInput options={[...OPTIONS]} defaultValue={["b"]} />,
  );
  expect(getInput(screen, "b").checked).toBe(true);
  expect(getInput(screen, "a").checked).toBe(false);
});

it("组禁用：根与全部选项输出禁用态，点击不提交", async () => {
  const onChange = vi.fn<(value: Array<string | number>) => void>();
  const screen = await render(
    <CheckboxMultiselectInput options={[...OPTIONS]} disabled onChange={onChange} />,
  );
  const root = getRoot(screen);
  expect(root).toHaveClass("oo-ui-widget-disabled");
  expect(root).toHaveAttribute("aria-disabled", "true");
  for (const option of root.querySelectorAll("[role=checkbox]")) {
    expect(option).toHaveClass("oo-ui-widget-disabled");
  }
  getOption(screen, "甲").dispatchEvent(
    new MouseEvent("click", { bubbles: true, cancelable: true }),
  );
  await tick();
  expect(onChange).not.toHaveBeenCalled();
});
