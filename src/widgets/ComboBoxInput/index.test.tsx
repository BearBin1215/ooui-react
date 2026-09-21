import { describe, expect, it, vi } from "vitest";
import { render } from "vitest-browser-react";
import { ComboBoxInput } from ".";
import {
  clickElement,
  getRoot,
  pressMouse,
  pressKey,
  snapshotHTML,
  tick,
  typeValue,
} from "../../testing";

const OPTIONS = [
  { children: "甲", value: "a" },
  { children: "乙", value: "b" },
  { children: "丙", value: "c", disabled: true },
] as const;

/** 合成一次带键值的keypress（KeyboardEvent构造器无法直接设keyCode/which，需defineProperty）；
 * keypress通道无法经keydown派生（见testing的pressKey说明），React委托监听仅认keypress */
const pressKeypress = (el: Element, key: string) => {
  const ev = new KeyboardEvent("keypress", {
    key,
    bubbles: true,
    cancelable: true,
  });
  Object.defineProperty(ev, "keyCode", { get: () => 13 });
  Object.defineProperty(ev, "which", { get: () => 13 });
  el.dispatchEvent(ev);
  return ev;
};

const getInput = (screen: { container: Element }) =>
  getRoot(screen).querySelector<HTMLInputElement>("input")!;
const getDropdownButton = (screen: { container: Element }) =>
  getRoot(screen).querySelector<HTMLAnchorElement>(
    ".oo-ui-comboBoxInputWidget-dropdownButton > .oo-ui-buttonElement-button",
  )!;

/**
 * ComboBoxInput（对齐原版OO.ui.ComboBoxInputWidget）的浏览器渲染契约：
 * 根类链与combobox语义（role/aria-expanded/aria-owns随开合、装饰落根级）、输入即展开菜单、
 * 下拉按钮开合并把焦点交还输入框、↑↓+Enter选定写入输入框、
 * readOnly同步禁用下拉通道、空选项的-empty类。
 */
it("结构：input/inputText/comboBoxInput类链，input承载combobox语义，下拉按钮为a且载controls", async () => {
  const screen = await render(<ComboBoxInput options={[...OPTIONS]} />);
  const root = getRoot(screen);
  expect(root).toHaveClass("oo-ui-inputWidget");
  expect(root).toHaveClass("oo-ui-textInputWidget");
  expect(root).toHaveClass("oo-ui-comboBoxInputWidget");
  const input = getInput(screen);
  expect(input).toHaveAttribute("role", "combobox");
  expect(input).toHaveAttribute("aria-autocomplete", "list");
  expect(input).toHaveAttribute("aria-expanded", "false");
  // 收起期不声明aria-owns（对齐原版MenuSelectWidget.onToggle的removeAttr；原版构造期
  // 先向$input写一次，该口径差异已记DEVIATIONS「增强」节）
  expect(input).not.toHaveAttribute("aria-owns");
  expect(input).toHaveAttribute("autocomplete", "off");
  // 图标/指示器为根级直接子节点且在-field之前（主题装饰规则为直接子选择器）
  expect(getRoot(screen).firstElementChild).toHaveClass("oo-ui-iconElement-icon");
  const button = getDropdownButton(screen);
  expect(button.tagName).toBe("A");
  expect(button).toHaveAttribute("role", "button");
  expect(button).toHaveAttribute("rel", "nofollow");
  // invisibleLabel的ButtonWidget按原版以label兼作title（“Toggle options”）
  expect(button).toHaveAttribute("title", "Toggle options");
  // 原版不给该按钮aria-haspopup（菜单归属由输入框的aria-owns声明）
  expect(button).not.toHaveAttribute("aria-haspopup");
  // aria-controls恒指向菜单（收起期菜单隐藏但存在），且与后续aria-owns同源
  const menu = document.getElementById(button.getAttribute("aria-controls")!)!;
  expect(menu).toHaveClass("oo-ui-menuSelectWidget");
});

it("options为空时输出-empty类", async () => {
  const screen = await render(<ComboBoxInput options={[]} />);
  expect(getRoot(screen)).toHaveClass("oo-ui-comboBoxInputWidget-empty");
});

it("输入即展开菜单：aria-expanded/aria-owns与root的-open类随开合", async () => {
  const screen = await render(<ComboBoxInput options={[...OPTIONS]} />);
  await typeValue(getInput(screen), "甲");
  const root = getRoot(screen);
  const input = getInput(screen);
  expect(root).toHaveClass("oo-ui-comboBoxInputWidget-open");
  expect(input).toHaveAttribute("aria-expanded", "true");
  const menuId = input.getAttribute("aria-owns")!;
  expect(document.getElementById(menuId)).toHaveClass("oo-ui-menuSelectWidget");

  pressKey(input, "Escape");
  await tick();
  expect(root).not.toHaveClass("oo-ui-comboBoxInputWidget-open");
  expect(input).toHaveAttribute("aria-expanded", "false");
  expect(input).not.toHaveAttribute("aria-owns");
});

it("↑↓唤起菜单并移动高亮，Enter选定高亮项：文本写入输入框、onChange派发、菜单收起", async () => {
  const onChange = vi.fn<(value: string) => void>();
  const screen = await render(
    <ComboBoxInput options={[...OPTIONS]} onChange={onChange} />,
  );
  const input = getInput(screen);
  input.focus();
  pressKey(input, "ArrowDown");
  await tick();
  const menu = document.querySelector(".oo-ui-menuSelectWidget")!;
  expect(menu.querySelector(".oo-ui-optionWidget-highlighted")?.textContent).toContain(
    "甲",
  );
  pressKey(input, "Enter");
  await tick();
  expect(onChange).toHaveBeenCalledOnce();
  expect(onChange.mock.calls[0]?.[0]).toBe("a");
  expect(input.value).toBe("a");
  expect(getRoot(screen)).not.toHaveClass("oo-ui-comboBoxInputWidget-open");
});

it("点击菜单项选定：值写入输入框并收起菜单", async () => {
  const onChange = vi.fn<(value: string) => void>();
  const screen = await render(
    <ComboBoxInput options={[...OPTIONS]} onChange={onChange} />,
  );
  pressMouse(getDropdownButton(screen));
  clickElement(getDropdownButton(screen));
  await tick();
  const option = document
    .querySelector(".oo-ui-menuSelectWidget")!
    .querySelectorAll(".oo-ui-optionWidget")[1]!;
  pressMouse(option);
  clickElement(option);
  await tick();
  expect(onChange).toHaveBeenCalledOnce();
  expect(onChange.mock.calls[0]?.[0]).toBe("b");
  expect(getInput(screen).value).toBe("b");
  expect(getRoot(screen)).not.toHaveClass("oo-ui-comboBoxInputWidget-open");
});

it("下拉按钮键盘激活（keypress通道，对齐原版ButtonElement.onKeyPress）：Enter/空格开合并阻默认", async () => {
  const screen = await render(<ComboBoxInput options={[...OPTIONS]} />);
  const button = getDropdownButton(screen);
  button.focus();
  // Enter：开
  const enterEv = pressKeypress(button, "Enter");
  await tick();
  expect(getRoot(screen)).toHaveClass("oo-ui-comboBoxInputWidget-open");
  expect(enterEv.defaultPrevented).toBe(true);
  // Enter：关
  pressKeypress(button, "Enter");
  await tick();
  expect(getRoot(screen)).not.toHaveClass("oo-ui-comboBoxInputWidget-open");
  // 空格：开
  pressKeypress(button, " ");
  await tick();
  expect(getRoot(screen)).toHaveClass("oo-ui-comboBoxInputWidget-open");
  // 非激活键不触发（preventDefault也不发生）
  const otherEv = pressKeypress(button, "x");
  expect(otherEv.defaultPrevented).toBe(false);
});

it("受控值：选定只回调onChange，显示值仍随props", async () => {
  const onChange = vi.fn<(value: string) => void>();
  const screen = await render(
    <ComboBoxInput options={[...OPTIONS]} value="x" onChange={onChange} />,
  );
  pressKey(getInput(screen), "ArrowDown");
  await tick();
  pressKey(getInput(screen), "Enter");
  await tick();
  expect(onChange).toHaveBeenCalledWith("a");
  expect(getInput(screen).value).toBe("x");
});

it("非受控defaultValue：初始值渲染，选定与键入都更新内部值", async () => {
  const onChange = vi.fn<(value: string) => void>();
  const screen = await render(
    <ComboBoxInput options={[...OPTIONS]} defaultValue="a" onChange={onChange} />,
  );
  const input = getInput(screen);
  expect(input.value).toBe("a");

  // 键盘选定：起点为选中项（a）→↓到b→Enter写入
  input.focus();
  pressKey(input, "ArrowDown");
  await tick();
  pressKey(input, "Enter");
  await tick();
  expect(input.value).toBe("b");

  await typeValue(input, "自定");
  expect(input.value).toBe("自定");
  // ChangeHandler约定第二参为事件，故按首参断言
  expect(onChange.mock.calls.at(-1)?.[0]).toBe("自定");
});

it("下拉按钮开合菜单并把焦点交还输入框；点击输入框重新展开", async () => {
  const screen = await render(<ComboBoxInput options={[...OPTIONS]} />);
  const input = getInput(screen);
  pressMouse(getDropdownButton(screen));
  clickElement(getDropdownButton(screen));
  await tick();
  expect(getRoot(screen)).toHaveClass("oo-ui-comboBoxInputWidget-open");
  expect(document.activeElement).toBe(input);

  pressMouse(getDropdownButton(screen));
  clickElement(getDropdownButton(screen));
  await tick();
  expect(getRoot(screen)).not.toHaveClass("oo-ui-comboBoxInputWidget-open");

  // 收起态点击输入框重新展开（对齐原版onEdit的mouseup分支）
  input.dispatchEvent(new MouseEvent("mouseup", { bubbles: true }));
  await tick();
  expect(getRoot(screen)).toHaveClass("oo-ui-comboBoxInputWidget-open");
});

it("菜单开启期点击外部收起", async () => {
  const screen = await render(<ComboBoxInput options={[...OPTIONS]} />);
  pressMouse(getDropdownButton(screen));
  clickElement(getDropdownButton(screen));
  await tick();
  expect(getRoot(screen)).toHaveClass("oo-ui-comboBoxInputWidget-open");
  document.body.dispatchEvent(new MouseEvent("mousedown", { bubbles: true }));
  await tick();
  expect(getRoot(screen)).not.toHaveClass("oo-ui-comboBoxInputWidget-open");
});

it("readOnly：下拉按钮同步禁用（类/tabIndex/aria-disabled），输入框不再展开菜单", async () => {
  const screen = await render(<ComboBoxInput options={[...OPTIONS]} readOnly />);
  const root = getRoot(screen);
  expect(root).not.toHaveClass("oo-ui-widget-disabled");
  // widget级禁用类在外层dropdownButton容器，tabIndex/aria-disabled落在可聚焦的按钮锚点上
  const buttonWrap = root.querySelector(".oo-ui-comboBoxInputWidget-dropdownButton")!;
  expect(buttonWrap).toHaveClass("oo-ui-widget-disabled");
  // Widget.setElementAccessibility的双落点：容器与锚点各写一次aria-disabled
  expect(buttonWrap).toHaveAttribute("aria-disabled", "true");
  const button = getDropdownButton(screen);
  expect(button).toHaveAttribute("aria-disabled", "true");
  expect(button).toHaveAttribute("tabIndex", "-1");

  pressMouse(button);
  clickElement(button);
  await tick();
  expect(root).not.toHaveClass("oo-ui-comboBoxInputWidget-open");
  const input = getInput(screen);
  input.dispatchEvent(new MouseEvent("mouseup", { bubbles: true }));
  await tick();
  expect(root).not.toHaveClass("oo-ui-comboBoxInputWidget-open");
});

it("disabled：根输出disabled类链，键盘与下拉通道均不响应", async () => {
  const screen = await render(<ComboBoxInput options={[...OPTIONS]} disabled />);
  const root = getRoot(screen);
  expect(root).toHaveClass("oo-ui-widget-disabled");
  expect(root).toHaveAttribute("aria-disabled", "true");
  pressKey(getInput(screen), "ArrowDown");
  await tick();
  expect(root).not.toHaveClass("oo-ui-comboBoxInputWidget-open");
});

describe("HTML快照", () => {
  it("收起态（field与下拉按钮结构）", async () => {
    const screen = await render(<ComboBoxInput options={[...OPTIONS]} />);
    expect(snapshotHTML(getRoot(screen))).toMatchInlineSnapshot(
      `"<span class="oo-ui-iconElement-icon oo-ui-iconElement-noIcon"></span><span class="oo-ui-indicatorElement-indicator oo-ui-indicatorElement-noIndicator"></span><div class="oo-ui-comboBoxInputWidget-field"><input tabindex="0" class="oo-ui-inputWidget-input" type="text" role="combobox" aria-autocomplete="list" aria-expanded="false" autocomplete="off" value=""><span class="oo-ui-comboBoxInputWidget-dropdownButton oo-ui-widget oo-ui-widget-enabled oo-ui-buttonWidget oo-ui-buttonElement oo-ui-buttonElement-framed oo-ui-indicatorElement"><a class="oo-ui-buttonElement-button" role="button" rel="nofollow" tabindex="0" aria-controls="r#" title="Toggle options"><span class="oo-ui-iconElement-icon oo-ui-iconElement-noIcon"></span><span class="oo-ui-labelElement-label oo-ui-labelElement-invisible">Toggle options</span><span class="oo-ui-indicatorElement-indicator oo-ui-indicator-down"></span></a></span></div>"`,
    );
  });
});
