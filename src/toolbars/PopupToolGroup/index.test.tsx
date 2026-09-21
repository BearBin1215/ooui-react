import { expect, it, vi } from "vitest";
import { render } from "vitest-browser-react";
import { getRoot, pressKey, pressMouse, tick } from "../../testing";
import { getPanel, getTool } from "../../testing/toolGroups";
import type { ToolProps } from "../Tool";
import { ToolbarPositionProvider } from "../Toolbar/context";
import { PopupToolGroupBase } from ".";

const TOOLS = [
  { name: "a", label: "工具甲" },
  { name: "b", label: "工具乙" },
];
const DISABLED_TOOLS = [
  { name: "a", label: "工具甲", disabled: true },
  { name: "b", label: "工具乙", disabled: true },
];

const getHandle = (screen: { container: Element }) =>
  getRoot(screen).querySelector<HTMLElement>(".oo-ui-popupToolGroup-handle")!;
/** data-tool-name就落在工具链接自身（a.oo-ui-tool-link），面板内可聚焦项即它 */
const getToolLink = (name: string) => getTool(name)!;
/** 面板Tab流转三分支都靠keydown驱动，故需cancelable事件以断言preventDefault */
const tabOn = (el: Element, shiftKey = false) => {
  const event = new KeyboardEvent("keydown", {
    key: "Tab",
    shiftKey,
    bubbles: true,
    cancelable: true,
  });
  el.dispatchEvent(event);
  return event;
};

/**
 * PopupToolGroupBase（MenuToolGroup/ListToolGroup的公共实现）的浏览器渲染契约：
 * 把手Enter/空格开合、面板Tab流转（Tab入面板首项、首项Shift+Tab回把手、末项Tab回把手并
 * 收起）、禁用时自动收起面板、点击外部与Escape关闭。
 * 面板经portal出容器子树，故面板与工具的定位复用`src/testing/toolGroups.ts`。
 */
it("把手Enter/空格开合：aria-expanded与面板显隐随之切换", async () => {
  const screen = await render(<PopupToolGroupBase label="更多" tools={[...TOOLS]} />);
  const handle = getHandle(screen);
  pressKey(handle, "Enter");
  await tick();
  expect(handle).toHaveAttribute("aria-expanded", "true");
  expect(getPanel()).not.toHaveClass("oo-ui-element-hidden");

  pressKey(handle, " ");
  await tick();
  expect(handle).toHaveAttribute("aria-expanded", "false");
  expect(getPanel()).toHaveClass("oo-ui-element-hidden");
});

it("面板Tab流转：Tab入首项、首项Shift+Tab回把手、末项Tab回把手并收起", async () => {
  const screen = await render(<PopupToolGroupBase label="更多" tools={[...TOOLS]} />);
  const handle = getHandle(screen);
  pressKey(handle, "Enter");
  await tick();

  // 开启期在把手上按Tab：焦点送入面板首个可聚焦工具（并阻止默认移焦）
  expect(tabOn(handle).defaultPrevented).toBe(true);
  await tick();
  expect(document.activeElement).toBe(getToolLink("a"));

  // 首项Shift+Tab：焦点回到把手（面板保持展开）
  tabOn(getToolLink("a"), true);
  await tick();
  expect(document.activeElement).toBe(handle);
  expect(handle).toHaveAttribute("aria-expanded", "true");

  // 末项Tab：焦点回到把手并收起面板（不preventDefault：此后Tab自把手继续）
  getToolLink("b").focus();
  tabOn(getToolLink("b"));
  await tick();
  expect(document.activeElement).toBe(handle);
  expect(handle).toHaveAttribute("aria-expanded", "false");
  expect(getPanel()).toHaveClass("oo-ui-element-hidden");
});

it("禁用时自动收起已展开的面板（对齐原版setDisabled）", async () => {
  const screen = await render(
    <PopupToolGroupBase label="更多" tools={[...TOOLS]} defaultOpen />,
  );
  await tick();
  expect(getPanel()).not.toHaveClass("oo-ui-element-hidden");

  await screen.rerender(
    <PopupToolGroupBase label="更多" tools={[...DISABLED_TOOLS]} defaultOpen />,
  );
  await tick();
  expect(getPanel()).toHaveClass("oo-ui-element-hidden");
});

it("点击外部与Escape关闭：经onOpenChange回调false", async () => {
  const onOpenChange = vi.fn<(open: boolean) => void>();
  const screen = await render(
    <PopupToolGroupBase
      label="更多"
      tools={[...TOOLS]}
      defaultOpen
      onOpenChange={onOpenChange}
    />,
  );
  await tick();
  document.body.dispatchEvent(new MouseEvent("mousedown", { bubbles: true }));
  await tick();
  expect(onOpenChange).toHaveBeenLastCalledWith(false);
  expect(getPanel()).toHaveClass("oo-ui-element-hidden");

  pressKey(getHandle(screen), "Enter");
  await tick();
  expect(getPanel()).not.toHaveClass("oo-ui-element-hidden");
  // Escape在捕获阶段处理，故派发到body即可
  document.body.dispatchEvent(
    new KeyboardEvent("keydown", { key: "Escape", bubbles: true, cancelable: true }),
  );
  await tick();
  expect(onOpenChange).toHaveBeenLastCalledWith(false);
  expect(getPanel()).toHaveClass("oo-ui-element-hidden");
});

it("指示器：缺省随工具栏位置翻转（bottom为up），显式indicator不被翻转", async () => {
  const screen = await render(
    <ToolbarPositionProvider value="bottom">
      <PopupToolGroupBase label="更多" tools={[...TOOLS]} />
    </ToolbarPositionProvider>,
  );
  expect(getHandle(screen).querySelector(".oo-ui-indicator-up")).toBeTruthy();

  await screen.rerender(
    <ToolbarPositionProvider value="bottom">
      <PopupToolGroupBase label="更多" tools={[...TOOLS]} indicator="down" />
    </ToolbarPositionProvider>,
  );
  expect(getHandle(screen).querySelector(".oo-ui-indicator-down")).toBeTruthy();
});

it("header：面板顶部渲染.oo-ui-popupToolGroup-header且文本即传入内容", async () => {
  await render(
    <PopupToolGroupBase label="更多" tools={[...TOOLS]} header="分组说明" defaultOpen />,
  );
  await tick();
  const header = getPanel().querySelector(".oo-ui-popupToolGroup-header");
  expect(header).toBeTruthy();
  expect(header?.textContent).toBe("分组说明");
});

it("onToolSelect：选中工具时工具自身onSelect与组级回调都触发", async () => {
  const onSelectA = vi.fn<() => void>();
  const onToolSelect = vi.fn<(tool: ToolProps) => void>();
  await render(
    <PopupToolGroupBase
      label="更多"
      tools={[{ name: "a", label: "工具甲", onSelect: onSelectA }, TOOLS[1]]}
      onToolSelect={onToolSelect}
      defaultOpen
    />,
  );
  await tick();
  pressMouse(getTool("a")!);
  await tick();
  expect(onSelectA).toHaveBeenCalledOnce();
  expect(onToolSelect).toHaveBeenCalledOnce();
  expect(onToolSelect).toHaveBeenCalledWith(expect.objectContaining({ name: "a" }));
});

it("keepOpenToolNames：名单内工具选中后面板不收起，名单外照常收起", async () => {
  const onOpenChange = vi.fn<(open: boolean) => void>();
  await render(
    <PopupToolGroupBase
      label="更多"
      tools={[...TOOLS]}
      keepOpenToolNames={["a"]}
      defaultOpen
      onOpenChange={onOpenChange}
    />,
  );
  await tick();
  expect(getPanel()).not.toHaveClass("oo-ui-element-hidden");

  pressMouse(getTool("a")!);
  await tick();
  expect(getPanel()).not.toHaveClass("oo-ui-element-hidden");
  expect(onOpenChange).not.toHaveBeenCalled();

  pressMouse(getTool("b")!);
  await tick();
  expect(getPanel()).toHaveClass("oo-ui-element-hidden");
  expect(onOpenChange).toHaveBeenLastCalledWith(false);
});
