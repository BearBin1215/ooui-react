import { expect, it, vi } from "vitest";
import { render } from "vitest-browser-react";
import { getRoot, pressMouse, tick } from "../../testing";
import { getPanel, getTool } from "../../testing/toolGroups";
import { ToolbarNarrowProvider } from "../Toolbar/context";
import { ListToolGroup } from ".";

const TOOLS = [
  { name: "a", label: "工具甲" },
  { name: "b", label: "工具乙" },
  { name: "c", label: "工具丙" },
] as const;

/**
 * ListToolGroup（对齐原版OO.ui.ListToolGroup）的浏览器渲染契约：
 * 弹出工具组的把手/面板结构、可折叠工具的收起与More/Fewer切换项、
 * forceExpand/defaultExpanded的名单推导、禁用与空组的下发、
 * 面板开合的受控通道、窄容器下的铺满容器与窄栏配置的把手替换。
 */
it("结构：listToolGroup类链与把手，工具进portal面板且收起时带hidden类", async () => {
  const screen = await render(
    <ListToolGroup label="更多" icon="menu" tools={[TOOLS[0]]} />,
  );
  const root = getRoot(screen);
  // 根即容器首子（组名类经className注入PopupToolGroupBase的根div）；面板另经portal出容器子树
  expect(root).toBe(document.querySelector(".oo-ui-listToolGroup"));
  expect(root).toHaveClass("oo-ui-toolGroup");
  expect(root).toHaveClass("oo-ui-popupToolGroup");
  expect(root).toHaveClass("oo-ui-labelElement");
  expect(root).toHaveClass("oo-ui-iconElement");
  expect(root).toHaveClass("oo-ui-indicatorElement");

  const handle = root.querySelector(".oo-ui-popupToolGroup-handle")!;
  expect(handle).toHaveClass("oo-ui-toolGroup-handle");
  expect(handle).toHaveAttribute("role", "button");
  expect(handle).toHaveAttribute("aria-expanded", "false");
  expect(handle.querySelector(".oo-ui-labelElement-label")!.textContent).toBe("更多");

  const panel = getPanel();
  expect(panel).toHaveClass("oo-ui-listToolGroup-tools");
  expect(panel).toHaveClass("oo-ui-element-hidden");
  expect(getTool("a")).toBeTruthy();
});

it("非Bar组工具的快捷键：accel槽位输出文案，但不拼tooltip（原版accelTooltips=false）", async () => {
  await render(
    <ListToolGroup
      label="更多"
      tools={[{ name: "a", label: "工具甲", accelerator: "Ctrl+K" }]}
    />,
  );
  // getTool返回的即工具链接（data-tool-name落在a.oo-ui-tool-link上）
  const link = getTool("a")!;
  expect(link).toHaveClass("oo-ui-tool-link");
  expect(link.querySelector(".oo-ui-tool-accel")!.textContent).toBe("Ctrl+K");
  expect(link.getAttribute("title")).toBeNull();
});

it("allowCollapse：未展开时可折叠工具不入面板，尾部More切换项展开后显示Fewer", async () => {
  await render(<ListToolGroup label="更多" tools={[...TOOLS]} allowCollapse={["b"]} />);
  expect(getTool("a")).toBeTruthy();
  expect(getTool("b")).toBeNull();
  const moreFewer = getTool("more-fewer")!;
  expect(moreFewer.textContent).toContain("More");

  pressMouse(moreFewer);
  await tick();
  expect(getTool("b")).toBeTruthy();
  expect(getTool("more-fewer")!.textContent).toContain("Fewer");

  // 再次切换收起
  pressMouse(getTool("more-fewer")!);
  await tick();
  expect(getTool("b")).toBeNull();
});

it("forceExpand：未列入的工具均可折叠（与allowCollapse名单取交集）", async () => {
  await render(<ListToolGroup label="更多" tools={[...TOOLS]} forceExpand={["a"]} />);
  expect(getTool("a")).toBeTruthy();
  expect(getTool("b")).toBeNull();
  expect(getTool("c")).toBeNull();
  expect(getTool("more-fewer")).toBeTruthy();
});

it("defaultExpanded：可折叠工具初始即展开，切换项显示Fewer", async () => {
  await render(
    <ListToolGroup label="更多" tools={[...TOOLS]} forceExpand={["a"]} defaultExpanded />,
  );
  expect(getTool("b")).toBeTruthy();
  expect(getTool("c")).toBeTruthy();
  expect(getTool("more-fewer")!.textContent).toContain("Fewer");
});

it("全部工具禁用即组禁用：根与把手输出禁用态，把手退出Tab序", async () => {
  const screen = await render(
    <ListToolGroup
      label="更多"
      tools={[{ name: "a", label: "工具甲", disabled: true }]}
    />,
  );
  const root = getRoot(screen);
  expect(root).toHaveClass("oo-ui-widget-disabled");
  expect(root).toHaveAttribute("aria-disabled", "true");
  const handle = root.querySelector(".oo-ui-popupToolGroup-handle")!;
  expect(handle).toHaveAttribute("aria-disabled", "true");
  expect(handle).toHaveAttribute("tabIndex", "-1");
});

it("空组：标记toolGroup-empty整体隐藏，且按全部工具禁用判定为禁用组", async () => {
  const screen = await render(<ListToolGroup label="空组" tools={[]} />);
  const root = getRoot(screen);
  expect(root).toHaveClass("oo-ui-toolGroup-empty");
  expect(root).toHaveClass("oo-ui-widget-disabled");
});

it("受控开合：open驱动面板显隐，切换与选中工具都经onOpenChange回调", async () => {
  const onOpenChange = vi.fn<(open: boolean) => void>();
  const screen = await render(
    <ListToolGroup
      label="更多"
      tools={[TOOLS[0]]}
      open={false}
      onOpenChange={onOpenChange}
    />,
  );
  getRoot(screen).querySelector<HTMLElement>(".oo-ui-popupToolGroup-handle")!.click();
  await tick();
  // 受控下父级未采纳：面板保持收起，但仍回调打开请求
  expect(onOpenChange).toHaveBeenLastCalledWith(true);
  expect(getPanel()).toHaveClass("oo-ui-element-hidden");

  await screen.rerender(
    <ListToolGroup label="更多" tools={[TOOLS[0]]} open onOpenChange={onOpenChange} />,
  );
  await tick();
  expect(getPanel()).not.toHaveClass("oo-ui-element-hidden");

  // 选中工具收起面板：经同一通道回调false（keepOpenToolNames除外）
  pressMouse(getTool("a")!);
  await tick();
  expect(onOpenChange).toHaveBeenLastCalledWith(false);
});

it("窄容器下铺满容器：前几侧都放不下时面板宽取容器可用宽（对齐原版setActive末步）", async () => {
  const host = document.createElement("div");
  host.style.width = "60px";
  host.style.overflow = "auto";
  document.body.appendChild(host);
  const screen = await render(
    <ListToolGroup
      label="更多"
      tools={[
        { name: "a", label: "很长的工具标题甲乙丙" },
        { name: "b", label: "很长的工具标题丁戊己" },
      ]}
    />,
    { container: host },
  );
  try {
    getRoot(screen).querySelector<HTMLElement>(".oo-ui-popupToolGroup-handle")!.click();
    await tick();
    const panel = getPanel();
    const expectedWidth = `${host.clientWidth}px`;
    expect(panel.style.width).toBe(expectedWidth);
    expect(panel.style.minWidth).toBe(expectedWidth);
    expect(panel.style.left).toBe(
      `${host.getBoundingClientRect().left + window.scrollX}px`,
    );
  } finally {
    // 断言失败也须摘除自建容器：残留的host及其portal面板会被后续用例的全局查询取到
    host.remove();
  }
});

it("窄栏配置：窄栏时以已定义字段替换把手图标/标签/可见性，退出窄栏还原", async () => {
  const wide = await render(
    <ListToolGroup label="更多" icon="menu" tools={[TOOLS[0]]} />,
  );
  expect(wide.container.querySelector(".oo-ui-icon-menu")).toBeTruthy();

  // 工具栏窄栏态经context下发（原版经onToolbarResize替换；测试环境无主题CSS，
  // 无法经Toolbar以栏宽实测判定，故直接下发窄栏态）
  const narrow = await render(
    <ToolbarNarrowProvider value>
      <ListToolGroup
        label="更多"
        icon="menu"
        tools={[TOOLS[0]]}
        narrowConfig={{ icon: "ellipsis", label: "窄栏", invisibleLabel: true }}
      />
    </ToolbarNarrowProvider>,
  );
  const root = getRoot(narrow);
  expect(root.querySelector(".oo-ui-icon-ellipsis")).toBeTruthy();
  expect(root.querySelector(".oo-ui-icon-menu")).toBeNull();
  const label = root.querySelector(".oo-ui-labelElement-label")!;
  expect(label.textContent).toBe("窄栏");
  // 标签不可见：裁剪类落label元素，根元素的oo-ui-labelElement被抑制（原版setInvisibleLabel）
  expect(label).toHaveClass("oo-ui-labelElement-invisible");
  expect(root).not.toHaveClass("oo-ui-labelElement");
});
