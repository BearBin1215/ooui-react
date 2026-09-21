import { expect, it, vi } from "vitest";
import { render } from "vitest-browser-react";
import { getRoot, pressMouse, tick } from "../../testing";
import { IndexLayout, type IndexLayoutTabProps } from ".";

const OPTIONS: IndexLayoutTabProps[] = [
  { value: "a", label: "甲页", children: <p>甲内容</p> },
  { value: "b", label: "乙页", children: <p>乙内容</p> },
  { value: "c", label: "禁用页", disabled: true, children: <p>丙内容</p> },
];

const getTabs = (screen: { container: Element }) => [
  ...getRoot(screen).querySelectorAll<HTMLElement>("[role=tab]"),
];
const getPanels = (screen: { container: Element }) => [
  ...getRoot(screen).querySelectorAll<HTMLElement>("[role=tabpanel]"),
];

/**
 * IndexLayout（对齐原版OO.ui.IndexLayout）的浏览器渲染契约：
 * MenuLayout顶部页签 + stack容器内面板的两段结构、页签与面板的aria互指、
 * 非激活面板的until-found隐藏（禁用页签恒完全隐藏）、切换与continuous/autoFocus。
 */
it("结构：indexLayout根 + 顶部菜单容器（TabSelect）+ 面板栈容器", async () => {
  const screen = await render(<IndexLayout options={OPTIONS} />);
  const root = getRoot(screen);
  expect(root).toHaveClass("oo-ui-layout");
  expect(root).toHaveClass("oo-ui-menuLayout");
  expect(root).toHaveClass("oo-ui-indexLayout");
  expect(root).toHaveClass("oo-ui-menuLayout-top");
  expect(root.children[0]).toHaveClass("oo-ui-menuLayout-menu");
  expect(root.children[1]).toHaveClass("oo-ui-menuLayout-content");

  const tabPanel = root.querySelector(".oo-ui-indexLayout-tabPanel")!;
  expect(tabPanel.querySelector("[role=tablist]")).toBeTruthy();
  const stack = root.querySelector(".oo-ui-indexLayout-stackLayout")!;
  expect(stack).toHaveClass("oo-ui-stackLayout");
  expect(stack.querySelectorAll("[role=tabpanel]")).toHaveLength(3);
});

it("缺省选中首个页签：aria互指、until-found隐藏与禁用页完全隐藏", async () => {
  const screen = await render(<IndexLayout options={OPTIONS} />);
  const tabs = getTabs(screen);
  const panels = getPanels(screen);

  expect(tabs[0]).toHaveAttribute("aria-selected", "true");
  expect(panels[0]).toHaveClass("oo-ui-tabPanelLayout-active");
  expect(panels[0]).not.toHaveAttribute("hidden");
  // 页签经aria-controls指向面板，面板经aria-labelledby反向关联页签
  expect(tabs[0]!.getAttribute("aria-controls")).toBe(panels[0]!.getAttribute("id"));
  expect(panels[0]!.getAttribute("aria-labelledby")).toBe(tabs[0]!.getAttribute("id"));

  // openMatchedPanels缺省true：普通未激活面板以until-found隐藏（对浏览器查找可见）
  expect(panels[1]).not.toHaveClass("oo-ui-tabPanelLayout-active");
  expect(panels[1]!.getAttribute("hidden")).toBe("until-found");
  // 禁用页签的面板不参与查找定位，恒完全隐藏
  expect(panels[2]!.getAttribute("hidden")).not.toBe("until-found");
});

it("beforematch：命中面板派发该事件（不冒泡）后切到对应页签", async () => {
  const screen = await render(<IndexLayout options={OPTIONS} />);
  const panels = getPanels(screen);

  // 与浏览器一致：事件直接派发在命中面板元素上（不冒泡，依赖stack上的捕获监听）
  panels[1]!.dispatchEvent(new Event("beforematch"));
  await tick();

  const tabs = getTabs(screen);
  expect(tabs[1]).toHaveAttribute("aria-selected", "true");
  expect(panels[1]).toHaveClass("oo-ui-tabPanelLayout-active");
  expect(panels[1]).not.toHaveAttribute("hidden");
  // 原激活面板转为until-found隐藏
  expect(panels[0]!.getAttribute("hidden")).toBe("until-found");
});

it("未指定value/defaultValue：挂载时自动选中首个页签并把生效值回写onChange", async () => {
  const onChange = vi.fn<(value: string | number) => void>();
  const screen = await render(<IndexLayout options={OPTIONS} onChange={onChange} />);
  await tick();
  expect(onChange).toHaveBeenLastCalledWith("a");
  expect(getPanels(screen)[0]).toHaveClass("oo-ui-tabPanelLayout-active");
});

it("点击页签切换面板：激活类/hidden随之转移；禁用页签不可激活", async () => {
  const onChange = vi.fn<(value: string | number) => void>();
  const screen = await render(<IndexLayout options={OPTIONS} onChange={onChange} />);
  // 挂载时的自动选中回调不计入后续断言
  await tick();
  onChange.mockClear();

  const tabs = getTabs(screen);
  const panels = getPanels(screen);
  pressMouse(tabs[1]!);
  await tick();
  expect(onChange).toHaveBeenCalledWith("b");
  expect(panels[1]).toHaveClass("oo-ui-tabPanelLayout-active");
  expect(panels[1]).not.toHaveAttribute("hidden");
  expect(panels[0]).not.toHaveClass("oo-ui-tabPanelLayout-active");
  expect(panels[0]!.getAttribute("hidden")).toBe("until-found");

  pressMouse(tabs[2]!);
  await tick();
  expect(onChange).toHaveBeenCalledOnce();
  expect(panels[1]).toHaveClass("oo-ui-tabPanelLayout-active");
});

it("激活页签被移除：回退首个可选页签（对齐原版selectFirstSelectableTabPanel，跳过禁用页签）", async () => {
  const onChange = vi.fn<(value: string | number) => void>();
  const [first, , third] = OPTIONS;
  const screen = await render(
    <IndexLayout options={OPTIONS} defaultValue="b" onChange={onChange} />,
  );
  // 移除乙页后剩甲页与禁用的丙页：首个可选是甲页（不是"原位置"的丙页）
  await screen.rerender(
    <IndexLayout options={[first!, third!]} defaultValue="b" onChange={onChange} />,
  );
  await tick();
  expect(onChange).toHaveBeenCalledWith("a");
  expect(getPanels(screen)[0]).toHaveClass("oo-ui-tabPanelLayout-active");
});

it("continuous：所有面板同时可见（无hidden），激活态仍标在对应面板", async () => {
  const screen = await render(<IndexLayout options={OPTIONS} continuous />);
  const panels = getPanels(screen);
  for (const panel of panels) {
    expect(panel).not.toHaveAttribute("hidden");
  }
  expect(panels[0]).toHaveClass("oo-ui-tabPanelLayout-active");
  expect(panels[1]).not.toHaveClass("oo-ui-tabPanelLayout-active");
});

it("openMatchedPanels=false：未激活面板直接完全隐藏（不输出until-found）", async () => {
  const screen = await render(
    <IndexLayout options={OPTIONS} openMatchedPanels={false} />,
  );
  const panels = getPanels(screen);
  expect(panels[1]!.getAttribute("hidden")).not.toBe("until-found");
  expect(panels[1]).not.toHaveClass("oo-ui-tabPanelLayout-active");
});

it("autoFocus：初始渲染不聚焦，切换页签后聚焦新面板内首个可聚焦元素", async () => {
  const screen = await render(
    <IndexLayout
      options={[
        { value: "a", label: "甲页", children: <input data-testid="a" /> },
        { value: "b", label: "乙页", children: <input data-testid="b" /> },
      ]}
    />,
  );
  const root = getRoot(screen);
  const inputA = root.querySelector<HTMLInputElement>('[data-testid="a"]')!;
  const inputB = root.querySelector<HTMLInputElement>('[data-testid="b"]')!;
  expect(document.activeElement).not.toBe(inputA);
  expect(document.activeElement).not.toBe(inputB);

  pressMouse(getTabs(screen)[1]!);
  await expect.poll(() => document.activeElement === inputB).toBe(true);
});
