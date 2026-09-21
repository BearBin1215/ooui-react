import { describe, expect, it, vi } from "vitest";
import { useRef } from "react";
import { render } from "vitest-browser-react";
import { Select } from ".";
import {
  clickElement,
  getRoot,
  pressMouse,
  pressKey,
  snapshotHTML,
  tick,
} from "../../testing";

const OPTIONS = [
  { children: "甲", value: "a" },
  { children: "乙", value: "b" },
  { children: "丙", value: "c", disabled: true },
  { children: "分组", value: undefined },
  { children: "丁", value: "d" },
] as const;

/**
 * Select（对齐原版OO.ui.SelectWidget）的浏览器渲染契约：
 * listbox根与状态类、aria-activedescendant的落点与选中项回退、键盘导航与选定、
 * 组禁用下发到选项（含图标变体抑制）、点击选定的choose/select双通道、
 * MenuOption的checkIcon落点（选项根首个子元素）。
 */
it("listbox根：selectWidget类链+role=listbox+缺省不输出tabindex", async () => {
  const screen = await render(<Select options={[...OPTIONS]} />);
  const root = getRoot(screen);
  expect(root).toHaveClass("oo-ui-widget");
  expect(root).toHaveClass("oo-ui-selectWidget");
  expect(root).toHaveClass("oo-ui-selectWidget-unpressed");
  expect(root).toHaveAttribute("role", "listbox");
  // 对齐原版SelectWidget根无tabindex（不进Tab序、不可聚焦），故缺省不写该属性
  expect(root).not.toHaveAttribute("tabindex");
});

it("aria-activedescendant仅随高亮输出在listbox根；focusOwnerRef路径下无高亮回退指向选中项", async () => {
  function Host() {
    const ownerRef = useRef<HTMLDivElement>(null);
    return (
      <>
        <div data-testid="owner" ref={ownerRef} />
        <Select options={[...OPTIONS]} defaultValue="b" focusOwnerRef={ownerRef} />
      </>
    );
  }
  await render(<Host />);
  await tick();
  const root = document.querySelector("[role=listbox]")!;
  // 焦点归属元素存在时listbox根不再输出activedescendant（对齐原版$focusOwner机制）
  expect(root).not.toHaveAttribute("aria-activedescendant");
  // 无高亮时归属元素指向当前选中项（对齐原版MenuSelectWidget.toggle(true)的selectedItem分支）
  const owner = document.querySelector("[data-testid=owner]")!;
  const selected = root.querySelector(".oo-ui-optionWidget-selected")!;
  expect(owner.getAttribute("aria-activedescendant")).toBe(selected.getAttribute("id"));
});

it("无选中无高亮且无focusOwner时不输出aria-activedescendant", async () => {
  const screen = await render(<Select options={[...OPTIONS]} />);
  await tick();
  expect(getRoot(screen)).not.toHaveAttribute("aria-activedescendant");
});

it("键盘导航：ArrowDown移动高亮并更新activedescendant，Enter提交onChange", async () => {
  const onChange = vi.fn<(value: string | number, event?: unknown) => void>();
  const screen = await render(<Select options={[...OPTIONS]} onChange={onChange} />);
  const root = getRoot(screen);
  // 根不可聚焦（缺省无tabindex），直接对根派发keydown验证其按键管线（前缀/导航/Enter）
  pressKey(root, "ArrowDown");
  await tick();
  const highlighted = root.querySelector(".oo-ui-optionWidget-highlighted")!;
  expect(highlighted.textContent).toContain("甲");
  expect(root.getAttribute("aria-activedescendant")).toBe(highlighted.getAttribute("id"));
  pressKey(root, "Enter");
  expect(onChange).toHaveBeenCalledOnce();
  expect(onChange.mock.calls[0]?.[0]).toBe("a");
});

it("禁用组：全部选项（含分组标题）下发组禁用（对齐原版isDisabled含组禁用），选中项图标不再输出progressive变体", async () => {
  const screen = await render(
    <Select options={[...OPTIONS]} defaultValue="b" disabled />,
  );
  const root = getRoot(screen);
  expect(root).toHaveClass("oo-ui-widget-disabled");
  for (const option of root.querySelectorAll(".oo-ui-optionWidget")) {
    expect(option).toHaveClass("oo-ui-widget-disabled");
    expect(option).toHaveAttribute("aria-disabled", "true");
  }
  const selected = root.querySelector(".oo-ui-optionWidget-selected")!;
  const selectedIcon = selected.querySelector(
    ".oo-ui-iconElement-icon:not(.oo-ui-menuOptionWidget-checkIcon)",
  )!;
  expect(selectedIcon).not.toHaveClass("oo-ui-image-progressive");
  // checkIcon是独立IconWidget，原版主题的变体类只写选项自身的$icon/$indicator
  expect(selected.querySelector(".oo-ui-menuOptionWidget-checkIcon")).not.toHaveClass(
    "oo-ui-image-progressive",
  );
});

it("启用组内的选中项输出progressive着色（组禁用不残留）", async () => {
  const screen = await render(<Select options={[...OPTIONS]} defaultValue="b" />);
  const selected = getRoot(screen).querySelector(".oo-ui-optionWidget-selected")!;
  expect(
    selected.querySelector(
      ".oo-ui-iconElement-icon:not(.oo-ui-menuOptionWidget-checkIcon)",
    ),
  ).toHaveClass("oo-ui-image-progressive");
});

it("选项flags：按标志输出image变体（icon与indicator同落），禁用项与未声明项不输出", async () => {
  const screen = await render(
    <Select
      options={[
        { children: "删除", value: "del", flags: ["destructive"] },
        { children: "分组", flags: ["warning"] },
        { children: "禁用项", value: "off", flags: ["destructive"], disabled: true },
      ]}
    />,
  );
  const root = getRoot(screen);
  const [destructive, section, disabled] = [
    ...root.querySelectorAll<HTMLElement>(
      ".oo-ui-menuOptionWidget, .oo-ui-menuSectionOptionWidget",
    ),
  ];
  // MenuOption：icon与indicator同落（对齐主题Theme.updateElementClasses）；
  // 图标选择器须排除checkIcon（它也是.iconElement-icon且DOM在首位）
  expect(
    destructive.querySelector(
      ".oo-ui-iconElement-icon:not(.oo-ui-menuOptionWidget-checkIcon)",
    ),
  ).toHaveClass("oo-ui-image-destructive");
  expect(destructive.querySelector(".oo-ui-indicatorElement-indicator")).toHaveClass(
    "oo-ui-image-destructive",
  );
  // 分组标题（MenuSectionOption）同样按flags着色
  expect(
    section.querySelector(
      ".oo-ui-iconElement-icon:not(.oo-ui-menuOptionWidget-checkIcon)",
    ),
  ).toHaveClass("oo-ui-image-warning");
  // 禁用项不输出变体（主题只在!isDisabled()分支写变体）
  expect(disabled.querySelector(".oo-ui-image-destructive")).toBeNull();
  expect(disabled.querySelector(".oo-ui-image-warning")).toBeNull();
});

it("选项flags与选中态叠加：progressive与标志变体同时落在图标上", async () => {
  const screen = await render(
    <Select
      options={[{ children: "删除", value: "del", flags: ["destructive"] }]}
      defaultValue="del"
    />,
  );
  const icon = screen.container.querySelector(
    ".oo-ui-optionWidget-selected .oo-ui-iconElement-icon:not(.oo-ui-menuOptionWidget-checkIcon)",
  )!;
  expect(icon).toHaveClass("oo-ui-image-destructive");
  expect(icon).toHaveClass("oo-ui-image-progressive");
});

it("MenuOption输出原版的checkIcon：选项根首个子元素，恒无变体类", async () => {
  const screen = await render(<Select options={[...OPTIONS]} defaultValue="b" />);
  const option = screen.container.querySelector(".oo-ui-menuOptionWidget")!;
  // 原版MenuOptionWidget构造期prepend一个checkIcon（dist/oojs-ui.js:8366-8379），
  // 故它是选项根的首个子元素；主题以`>`直接子选择器隐藏选中项的普通图标
  const checkIcon = option.firstElementChild!;
  expect(checkIcon).toHaveClass("oo-ui-menuOptionWidget-checkIcon");
  expect(checkIcon).toHaveClass("oo-ui-iconElement-icon");
  expect(checkIcon).toHaveClass("oo-ui-icon-check");
  expect(checkIcon).not.toHaveClass("oo-ui-image-progressive");
  // 分组标题（MenuSectionOption）不输出该图标
  expect(
    screen.container.querySelector(".oo-ui-menuSectionOptionWidget")?.firstElementChild,
  ).not.toHaveClass("oo-ui-menuOptionWidget-checkIcon");
});

it("点击选项提交onChange，重复点击同项仅onChoose再触发", async () => {
  const onChange = vi.fn<(value: string | number, event?: unknown) => void>();
  const onChoose = vi.fn<(value: string | number, event?: unknown) => void>();
  const screen = await render(
    <Select options={[...OPTIONS]} onChange={onChange} onChoose={onChoose} />,
  );
  const option = screen.getByRole("option", { name: "乙" }).element() as HTMLElement;
  pressMouse(option);
  clickElement(option);
  await tick();
  expect(onChange).toHaveBeenCalledTimes(1);
  expect(onChange.mock.calls[0]?.[0]).toBe("b");
  expect(onChoose).toHaveBeenCalledTimes(1);
  pressMouse(option);
  clickElement(option);
  await tick();
  // 值未变化：onChange不再派发；choose为每次选定事件：仍派发
  expect(onChange).toHaveBeenCalledTimes(1);
  expect(onChoose).toHaveBeenCalledTimes(2);
});

it("分组标题（无value）渲染MenuSectionOption且不可选中", async () => {
  const onChange = vi.fn<(value: string | number, event?: unknown) => void>();
  const screen = await render(<Select options={[...OPTIONS]} onChange={onChange} />);
  const root = getRoot(screen);
  const section = root.querySelector(".oo-ui-menuSectionOptionWidget")!;
  expect(section.textContent).toContain("分组");
  pressMouse(section);
  clickElement(section);
  await tick();
  expect(onChange).not.toHaveBeenCalled();
});

it("拖拽跨项：mousemove落到另一可选项时按压随之迁移，mouseup提交落点项", async () => {
  const onChange = vi.fn<(value: string | number) => void>();
  const screen = await render(<Select options={[...OPTIONS]} onChange={onChange} />);
  const root = getRoot(screen);
  const options = [...root.querySelectorAll<HTMLElement>(".oo-ui-optionWidget")];

  options[0]!.dispatchEvent(
    new MouseEvent("mousedown", { bubbles: true, cancelable: true, button: 0 }),
  );
  await tick();
  expect(options[0]).toHaveClass("oo-ui-optionWidget-pressed");
  expect(root).toHaveClass("oo-ui-selectWidget-pressed");

  // 拖拽监听挂在document捕获阶段，故派发在落点项即可解析到该选项
  options[1]!.dispatchEvent(new MouseEvent("mousemove", { bubbles: true }));
  await tick();
  expect(options[1]).toHaveClass("oo-ui-optionWidget-pressed");
  expect(options[0]).not.toHaveClass("oo-ui-optionWidget-pressed");

  options[1]!.dispatchEvent(new MouseEvent("mouseup", { bubbles: true }));
  await tick();
  expect(onChange).toHaveBeenCalledWith("b");
  expect(root).toHaveClass("oo-ui-selectWidget-unpressed");
});

it("pointercancel中断拖拽：清理按压态，随后的mouseup不提交", async () => {
  const onChange = vi.fn<(value: string | number) => void>();
  const screen = await render(<Select options={[...OPTIONS]} onChange={onChange} />);
  const root = getRoot(screen);
  const options = [...root.querySelectorAll<HTMLElement>(".oo-ui-optionWidget")];
  options[0]!.dispatchEvent(
    new MouseEvent("mousedown", { bubbles: true, cancelable: true, button: 0 }),
  );
  await tick();
  expect(options[0]).toHaveClass("oo-ui-optionWidget-pressed");

  // 系统接管（触屏滚动）即中止：监听随之移除
  document.dispatchEvent(new Event("pointercancel"));
  await tick();
  expect(options[0]).not.toHaveClass("oo-ui-optionWidget-pressed");
  options[0]!.dispatchEvent(new MouseEvent("mouseup", { bubbles: true }));
  await tick();
  expect(onChange).not.toHaveBeenCalled();
});

describe("HTML快照", () => {
  it("listbox与选项结构", async () => {
    const screen = await render(<Select options={[...OPTIONS]} defaultValue="b" />);
    expect(snapshotHTML(getRoot(screen))).toMatchInlineSnapshot(
      `"<div class="oo-ui-menuOptionWidget oo-ui-widget oo-ui-widget-enabled oo-ui-labelElement oo-ui-optionWidget oo-ui-decoratedOptionWidget" tabindex="-1" role="option" id="r#-0" aria-selected="false"><span class="oo-ui-iconElement-icon oo-ui-icon-check oo-ui-menuOptionWidget-checkIcon oo-ui-widget oo-ui-widget-enabled oo-ui-iconElement oo-ui-iconWidget oo-ui-labelElement-invisible"></span><span class="oo-ui-iconElement-icon oo-ui-iconElement-noIcon"></span><span class="oo-ui-labelElement-label">甲</span><span class="oo-ui-indicatorElement-indicator oo-ui-indicatorElement-noIndicator"></span></div><div class="oo-ui-menuOptionWidget oo-ui-optionWidget-selected oo-ui-widget oo-ui-widget-enabled oo-ui-labelElement oo-ui-optionWidget oo-ui-decoratedOptionWidget" tabindex="-1" role="option" id="r#-1" aria-selected="true"><span class="oo-ui-iconElement-icon oo-ui-icon-check oo-ui-menuOptionWidget-checkIcon oo-ui-widget oo-ui-widget-enabled oo-ui-iconElement oo-ui-iconWidget oo-ui-labelElement-invisible"></span><span class="oo-ui-iconElement-icon oo-ui-iconElement-noIcon oo-ui-image-progressive"></span><span class="oo-ui-labelElement-label">乙</span><span class="oo-ui-indicatorElement-indicator oo-ui-indicatorElement-noIndicator oo-ui-image-progressive"></span></div><div class="oo-ui-menuOptionWidget oo-ui-widget oo-ui-widget-disabled oo-ui-labelElement oo-ui-optionWidget oo-ui-decoratedOptionWidget" aria-disabled="true" tabindex="-1" role="option" id="r#-2" aria-selected="false"><span class="oo-ui-iconElement-icon oo-ui-icon-check oo-ui-menuOptionWidget-checkIcon oo-ui-widget oo-ui-widget-enabled oo-ui-iconElement oo-ui-iconWidget oo-ui-labelElement-invisible"></span><span class="oo-ui-iconElement-icon oo-ui-iconElement-noIcon"></span><span class="oo-ui-labelElement-label">丙</span><span class="oo-ui-indicatorElement-indicator oo-ui-indicatorElement-noIndicator"></span></div><div class="oo-ui-menuSectionOptionWidget oo-ui-widget oo-ui-widget-enabled oo-ui-labelElement oo-ui-optionWidget oo-ui-decoratedOptionWidget" tabindex="-1"><span class="oo-ui-iconElement-icon oo-ui-iconElement-noIcon"></span><span class="oo-ui-labelElement-label">分组</span><span class="oo-ui-indicatorElement-indicator oo-ui-indicatorElement-noIndicator"></span></div><div class="oo-ui-menuOptionWidget oo-ui-widget oo-ui-widget-enabled oo-ui-labelElement oo-ui-optionWidget oo-ui-decoratedOptionWidget" tabindex="-1" role="option" id="r#-4" aria-selected="false"><span class="oo-ui-iconElement-icon oo-ui-icon-check oo-ui-menuOptionWidget-checkIcon oo-ui-widget oo-ui-widget-enabled oo-ui-iconElement oo-ui-iconWidget oo-ui-labelElement-invisible"></span><span class="oo-ui-iconElement-icon oo-ui-iconElement-noIcon"></span><span class="oo-ui-labelElement-label">丁</span><span class="oo-ui-indicatorElement-indicator oo-ui-indicatorElement-noIndicator"></span></div>"`,
    );
  });
});
