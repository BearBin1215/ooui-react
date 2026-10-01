import { describe, expect, it, vi } from "vitest";
import { render } from "vitest-browser-react";
import { Dropdown } from ".";
import { clickElement, getRoot, pressKey, snapshotHTML, tick } from "../../testing";

const OPTIONS = [
  { children: "甲", value: "a" },
  { children: "乙", value: "b" },
] as const;

/**
 * Dropdown（对齐原版OO.ui.DropdownWidget）的浏览器渲染契约：
 * handle落点（tabIndex/aria状态/combobox角色）、aria-owns随开合增删、
 * portal菜单的显隐类、聚焦期键盘直选（screenReaderMode形态）、
 * disabled下handle不可聚焦且不响应点击/按键、受控value随父级更新（点击只回调）。
 */
it("收起态：handle承载combobox语义与tabIndex，根输出dropdown类链，无aria-owns", async () => {
  const screen = await render(<Dropdown options={[...OPTIONS]} label="请选择" />);
  const root = getRoot(screen);
  expect(root).toHaveClass("oo-ui-dropdownWidget");
  expect(root).toHaveClass("oo-ui-widget-enabled");
  const handle = root.querySelector(".oo-ui-dropdownWidget-handle")!;
  expect(handle).toHaveAttribute("role", "combobox");
  expect(handle).toHaveAttribute("tabIndex", "0");
  // aria-haspopup取原版字面量'true'（oojs-ui-core.js:9118），不是语义更precise的'listbox'
  expect(handle).toHaveAttribute("aria-haspopup", "true");
  expect(handle).toHaveAttribute("aria-expanded", "false");
  expect(handle).not.toHaveAttribute("aria-owns");
  // 未选中时显示label占位
  expect(handle.textContent).toContain("请选择");
});

it("展开：root加open类、handle aria-expanded/aria-owns指向portal菜单；菜单面板不隐藏", async () => {
  const screen = await render(<Dropdown options={[...OPTIONS]} defaultValue="a" />);
  const handle = getRoot(screen).querySelector(".oo-ui-dropdownWidget-handle")!;
  await (handle as HTMLElement).click();
  const root = getRoot(screen);
  expect(root).toHaveClass("oo-ui-dropdownWidget-open");
  expect(handle).toHaveAttribute("aria-expanded", "true");
  const menuId = handle.getAttribute("aria-owns")!;
  const menu = document.getElementById(menuId)!;
  expect(menu).toHaveClass("oo-ui-menuSelectWidget");
  expect(menu).not.toHaveClass("oo-ui-element-hidden");
});

it("再次点击收起：aria-owns从handle移除、菜单回到隐藏态", async () => {
  const screen = await render(<Dropdown options={[...OPTIONS]} />);
  const handle = getRoot(screen).querySelector(".oo-ui-dropdownWidget-handle")!;
  await (handle as HTMLElement).click();
  await (handle as HTMLElement).click();
  expect(handle).toHaveAttribute("aria-expanded", "false");
  expect(handle).not.toHaveAttribute("aria-owns");
});

it("disabled：handle不可聚焦，点击与按键均不展开", async () => {
  const screen = await render(
    <Dropdown options={[...OPTIONS]} defaultValue="a" disabled />,
  );
  const root = getRoot(screen);
  expect(root).toHaveClass("oo-ui-widget-disabled");
  const handle = root.querySelector<HTMLElement>(".oo-ui-dropdownWidget-handle")!;
  expect(handle).toHaveAttribute("tabIndex", "-1");
  expect(handle).toHaveAttribute("aria-disabled", "true");

  clickElement(handle);
  await tick();
  expect(handle).toHaveAttribute("aria-expanded", "false");
  pressKey(handle, "Enter");
  await tick();
  expect(handle).not.toHaveAttribute("aria-owns");
});

it("受控value：显示随父级value更新（点击只回调，不改内部显示）", async () => {
  const onChange = vi.fn<(value: string | number) => void>();
  const screen = await render(
    <Dropdown options={[...OPTIONS]} value="a" onChange={onChange} />,
  );
  const handle = getRoot(screen).querySelector<HTMLElement>(
    ".oo-ui-dropdownWidget-handle",
  )!;
  expect(handle.textContent).toContain("甲");

  await screen.rerender(
    <Dropdown options={[...OPTIONS]} value="b" onChange={onChange} />,
  );
  expect(handle.textContent).toContain("乙");
});

it("展开时aria-activedescendant回退指向选中项（handle为焦点归属元素）", async () => {
  const screen = await render(<Dropdown options={[...OPTIONS]} defaultValue="b" />);
  const handle = getRoot(screen).querySelector(".oo-ui-dropdownWidget-handle")!;
  await (handle as HTMLElement).click();
  await tick();
  const selected = document.querySelector(
    ".oo-ui-menuSelectWidget .oo-ui-optionWidget-selected",
  )!;
  expect(handle.getAttribute("aria-activedescendant")).toBe(selected.getAttribute("id"));
});

it("聚焦期方向键直接改选而不展开菜单（对齐原版DropdownWidget的screenReaderMode）", async () => {
  const onChange = vi.fn<(value: string | number, event?: unknown) => void>();
  const screen = await render(<Dropdown options={[...OPTIONS]} onChange={onChange} />);
  const handle = getRoot(screen).querySelector<HTMLElement>(
    ".oo-ui-dropdownWidget-handle",
  )!;
  handle.focus();
  // onFocus置位的聚焦态经React调度异步生效，须等一拍后再按键（否则useMenuPopup闭包内
  // screenReaderMode仍为false）
  await tick();
  handle.dispatchEvent(
    new KeyboardEvent("keydown", { key: "ArrowDown", bubbles: true, cancelable: true }),
  );
  await tick();
  expect(onChange).toHaveBeenCalledTimes(1);
  expect(onChange.mock.calls[0]?.[0]).toBe("a");
  // 菜单未展开：root无open类、handle仍aria-expanded=false
  const root = getRoot(screen);
  expect(root).not.toHaveClass("oo-ui-dropdownWidget-open");
  expect(handle).toHaveAttribute("aria-expanded", "false");
});

it("选定后handle显示选中项文本", async () => {
  const screen = await render(<Dropdown options={[...OPTIONS]} defaultValue="b" />);
  const handle = getRoot(screen).querySelector(".oo-ui-dropdownWidget-handle")!;
  expect(handle.textContent).toContain("乙");
});

describe("HTML快照", () => {
  it("收起态", async () => {
    const screen = await render(
      <Dropdown
        options={[
          { children: "甲", value: "a" },
          { children: "乙", value: "b" },
        ]}
        defaultValue="a"
      />,
    );
    expect(snapshotHTML(getRoot(screen))).toMatchInlineSnapshot(
      `"<span aria-autocomplete="list" aria-expanded="false" aria-haspopup="true" aria-labelledby="r#" class="oo-ui-dropdownWidget-handle" role="combobox" tabindex="0"><span class="oo-ui-iconElement-icon oo-ui-iconElement-noIcon"></span><span aria-readonly="true" class="oo-ui-labelElement-label" id="r#" role="textbox">甲</span><span class="oo-ui-indicatorElement-indicator oo-ui-indicator-down"></span></span>"`,
    );
  });
});
