import { expect, it, vi } from "vitest";
import { render } from "vitest-browser-react";
import { ButtonSelect } from ".";
import { getRoot, pressMouse, pressKey, tick } from "../../testing";

const OPTIONS = [
  { children: "甲", value: "a" },
  { children: "乙", value: "b" },
  { children: "丙", value: "c", disabled: true },
] as const;

const getOption = (screen: { container: Element }, name: string) =>
  [...getRoot(screen).querySelectorAll<HTMLElement>("[role=option]")].find(
    (option) => option.textContent === name,
  )!;

/**
 * ButtonSelect（对齐原版OO.ui.ButtonSelectWidget）的浏览器渲染契约：
 * listbox根与按钮选项继承链、activedescendant指向选中项、点击/键盘直选、
 * 组禁用下发。
 */
it("结构：listbox根与select/buttonSelect类链，activedescendant指向选中项", async () => {
  const screen = await render(<ButtonSelect options={[...OPTIONS]} defaultValue="b" />);
  const root = getRoot(screen);
  expect(root).toHaveClass("oo-ui-widget");
  expect(root).toHaveClass("oo-ui-selectWidget");
  expect(root).toHaveClass("oo-ui-buttonSelectWidget");
  expect(root).toHaveClass("oo-ui-selectWidget-unpressed");
  expect(root).toHaveAttribute("role", "listbox");
  expect(root).toHaveAttribute("aria-multiselectable", "false");
  expect(root).toHaveAttribute("tabIndex", "0");

  const selected = root.querySelector(".oo-ui-optionWidget-selected")!;
  expect(selected.textContent).toContain("乙");
  // 选中态同时映射为按钮激活态（对齐原版setSelected连带setActive）
  expect(selected).toHaveClass("oo-ui-buttonElement-active");
  expect(root.getAttribute("aria-activedescendant")).toBe(selected.getAttribute("id"));
});

it("按钮选项flags：根输出flaggedElement类、图标按标志输出image变体（带边框禁用项仅图标不落标志变体）", async () => {
  const screen = await render(
    <ButtonSelect
      options={[
        { children: "删除", value: "del", icon: "trash", flags: ["destructive"] },
        {
          children: "禁用项",
          value: "off",
          icon: "trash",
          flags: ["destructive"],
          disabled: true,
        },
      ]}
    />,
  );
  const [active, disabled] = [
    ...getRoot(screen).querySelectorAll<HTMLElement>("[role=option]"),
  ];
  expect(active.querySelector(".oo-ui-iconElement-icon")).toHaveClass(
    "oo-ui-image-destructive",
  );
  expect(disabled.querySelector(".oo-ui-iconElement-icon")).not.toHaveClass(
    "oo-ui-image-destructive",
  );
  // 根的flaggedElement类对齐原版FlaggedElement（不受禁用门控）：wikimediaui主题的
  // 按钮作用域flagged规则按它给选项按钮底色/边框
  expect(active).toHaveClass("oo-ui-flaggedElement-destructive");
  expect(disabled).toHaveClass("oo-ui-flaggedElement-destructive");
});

it("无选中项时不输出activedescendant", async () => {
  const screen = await render(<ButtonSelect options={[...OPTIONS]} />);
  expect(getRoot(screen)).not.toHaveAttribute("aria-activedescendant");
});

it("点击选项选定：onChange派发、选中态与activedescendant随之更新", async () => {
  const onChange = vi.fn<(value: string | number) => void>();
  const screen = await render(
    <ButtonSelect options={[...OPTIONS]} defaultValue="a" onChange={onChange} />,
  );
  const root = getRoot(screen);
  pressMouse(getOption(screen, "乙"));
  await tick();
  expect(onChange).toHaveBeenCalledWith("b");
  const selected = root.querySelector(".oo-ui-optionWidget-selected")!;
  expect(selected.textContent).toContain("乙");
  expect(root.getAttribute("aria-activedescendant")).toBe(selected.getAttribute("id"));
});

it("键盘直选：←→↑↓在可选值间环绕改选并跳过禁用项，Enter重申当前项不派发", async () => {
  const onChange = vi.fn<(value: string | number) => void>();
  const screen = await render(
    <ButtonSelect options={[...OPTIONS]} defaultValue="a" onChange={onChange} />,
  );
  const root = getRoot(screen);
  root.focus();
  // a的下一项乙可选中；乙的下一项丙禁用：环绕回首项甲
  pressKey(root, "ArrowDown");
  await tick();
  expect(onChange.mock.calls[0]?.[0]).toBe("b");
  pressKey(root, "ArrowDown");
  await tick();
  expect(onChange.mock.calls[1]?.[0]).toBe("a");
  pressKey(root, "ArrowUp");
  await tick();
  expect(onChange.mock.calls[2]?.[0]).toBe("b");
  // Enter重申当前项：值未变化不提交
  pressKey(root, "Enter");
  await tick();
  expect(onChange).toHaveBeenCalledTimes(3);
});

it("点击选项后焦点收进组根：无需先聚焦即可方向键改选（略优于原版）", async () => {
  const onChange = vi.fn<(value: string | number) => void>();
  const screen = await render(
    <ButtonSelect options={[...OPTIONS]} defaultValue="a" onChange={onChange} />,
  );
  const root = getRoot(screen);
  const outside = document.createElement("button");
  document.body.append(outside);
  outside.focus();
  expect(document.activeElement).toBe(outside);
  pressMouse(getOption(screen, "乙"));
  await tick();
  expect(document.activeElement).toBe(root);
  // 点击已提交b；b的下一项丙禁用：←→环绕回首项甲
  pressKey(root, "ArrowRight");
  await tick();
  expect(onChange.mock.calls[1]?.[0]).toBe("a");
  outside.remove();
});

it("组禁用：根与全部选项输出禁用态，键盘与点击均不提交", async () => {
  const onChange = vi.fn<(value: string | number) => void>();
  const screen = await render(
    <ButtonSelect options={[...OPTIONS]} disabled onChange={onChange} />,
  );
  const root = getRoot(screen);
  expect(root).toHaveClass("oo-ui-widget-disabled");
  expect(root).toHaveAttribute("aria-disabled", "true");
  expect(root).toHaveAttribute("tabIndex", "-1");
  for (const option of root.querySelectorAll("[role=option]")) {
    expect(option).toHaveClass("oo-ui-widget-disabled");
  }
  pressKey(root, "ArrowDown");
  pressMouse(getOption(screen, "甲"));
  await tick();
  expect(onChange).not.toHaveBeenCalled();
});
