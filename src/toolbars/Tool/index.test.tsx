import { expect, it, vi } from "vitest";
import { render } from "vitest-browser-react";
import { getRoot, pressMouse, tick } from "../../testing";
import { BarToolGroup, type BarToolGroupProps } from "../BarToolGroup";
import { ToolbarNarrowProvider } from "../Toolbar/context";
import type { ToolProps } from ".";

const getToolSpan = (screen: { container: Element }, name: string) =>
  getRoot(screen).querySelector<HTMLElement>(`.oo-ui-tool-name-${name}`)!;
const getLink = (screen: { container: Element }, name: string) =>
  getToolSpan(screen, name).querySelector<HTMLElement>("a.oo-ui-tool-link")!;

/**
 * Tool（对齐原版OO.ui.Tool）模块的浏览器渲染契约。Tool在原版即为「数据+渲染」的抽象基类、
 * 不可独立渲染，故经BarToolGroup作为宿主驱动，只覆盖工具自身的两种扩展配置与窄栏配置：
 * 弹层工具（PopupTool，`popup`）、内嵌工具组（ToolGroupTool，`group`）与`narrowConfig`替换。
 * 工具链接的基础结构、类名与按压流见BarToolGroup的用例，此处不重复。
 */
const renderTool = (tool: ToolProps, groupProps?: Partial<BarToolGroupProps>) =>
  render(<BarToolGroup {...groupProps} tools={[tool]} />);

it("弹层工具：选中即开合浮层，浮层显隐期间工具呈激活态", async () => {
  const onOpenChange = vi.fn<(open: boolean) => void>();
  const screen = await renderTool({
    name: "help",
    label: "帮助",
    icon: "help",
    popup: {
      popupContent: <p data-testid="content">使用说明</p>,
      onOpenChange,
    },
  });
  const toolSpan = getToolSpan(screen, "help");
  expect(toolSpan).toHaveClass("oo-ui-popupTool");
  expect(toolSpan).not.toHaveClass("oo-ui-tool-active");

  const link = getLink(screen, "help");
  link.click();
  await tick();
  expect(onOpenChange).toHaveBeenLastCalledWith(true);
  // 原版PopupTool.onPopupToggle：浮层可见即setActive(true)（oojs-ui-toolbars.js:1765-1768）
  expect(toolSpan).toHaveClass("oo-ui-tool-active");
  const popup = document.querySelector<HTMLElement>(".oo-ui-popupTool-popup")!;
  expect(popup).toHaveClass("oo-ui-popupWidget");
  expect(popup).not.toHaveClass("oo-ui-element-hidden");
  expect(popup.querySelector("[data-testid=content]")!.textContent).toBe("使用说明");

  // 再次选中即收起
  link.click();
  await tick();
  expect(onOpenChange).toHaveBeenLastCalledWith(false);
  expect(toolSpan).not.toHaveClass("oo-ui-tool-active");
  expect(popup).toHaveClass("oo-ui-element-hidden");
});

it("弹层工具的onSelect不被浮层开合占用（本工程保留为通用回调）", async () => {
  const onSelect = vi.fn<() => void>();
  const screen = await renderTool({
    name: "help",
    label: "帮助",
    onSelect,
    popup: { popupContent: <p>使用说明</p> },
  });
  pressMouse(getLink(screen, "help"));
  await tick();
  expect(onSelect).toHaveBeenCalledOnce();
});

it("内嵌工具组：工具位渲染为内嵌组元素，不再渲染工具链接", async () => {
  const screen = await renderTool({
    name: "settings",
    group: <BarToolGroup tools={[{ name: "inner", label: "内层工具" }]} />,
  });
  const wrapper = getToolSpan(screen, "settings");
  expect(wrapper.tagName).toBe("SPAN");
  expect(wrapper).toHaveClass("oo-ui-tool");
  expect(wrapper).toHaveClass("oo-ui-toolGroupTool");
  // 原版ToolGroupTool构造期$link.remove()（oojs-ui-toolbars.js:1829-1832）：工具位无链接
  expect(getRoot(screen).querySelector('[data-tool-name="settings"]')).toBeNull();
  // 包装span的直接子节点即内嵌工具组根元素
  expect(wrapper.firstElementChild).toHaveClass("oo-ui-barToolGroup");
  expect(getRoot(screen).querySelector('[data-tool-name="inner"]')).toBeTruthy();
});

it("内嵌工具组：外层禁用传导到工具位，但不下发给内嵌组自身", async () => {
  const screen = await renderTool(
    {
      name: "settings",
      group: <BarToolGroup tools={[{ name: "inner", label: "内层工具" }]} />,
    },
    { disabled: true },
  );
  const wrapper = getToolSpan(screen, "settings");
  expect(wrapper).toHaveClass("oo-ui-widget-disabled");
  expect(wrapper).toHaveAttribute("aria-disabled", "true");
  // 反向不传导：内嵌组的禁用需在其元素上自行声明
  expect(wrapper.firstElementChild).toHaveClass("oo-ui-widget-enabled");
});

it("窄栏配置：窄栏时以已定义字段替换图标/标签/双显开关，退出窄栏还原", async () => {
  const tools: ToolProps[] = [
    {
      name: "a",
      label: "工具甲",
      icon: "picture",
      narrowConfig: { icon: "code", label: "窄栏工具", displayBothIconAndLabel: true },
    },
  ];
  const wide = await render(<BarToolGroup tools={tools} />);
  expect(getLink(wide, "a").querySelector(".oo-ui-icon-picture")).toBeTruthy();
  expect(getToolSpan(wide, "a")).not.toHaveClass("oo-ui-tool-with-label");

  // 工具栏窄栏态经context下发（原版经onToolbarResize替换；测试环境无主题CSS、无法经Toolbar实测宽度判定）
  const narrow = await render(
    <ToolbarNarrowProvider value>
      <BarToolGroup tools={tools} />
    </ToolbarNarrowProvider>,
  );
  const link = getLink(narrow, "a");
  expect(link.querySelector(".oo-ui-icon-code")).toBeTruthy();
  expect(link.querySelector(".oo-ui-icon-picture")).toBeNull();
  expect(link.querySelector(".oo-ui-tool-title")!.textContent).toBe("窄栏工具");
  expect(getToolSpan(narrow, "a")).toHaveClass("oo-ui-tool-with-label");
});
