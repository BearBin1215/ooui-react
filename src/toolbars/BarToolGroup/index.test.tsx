import { expect, it, vi } from "vitest";
import { render } from "vitest-browser-react";
import { getRoot, tick } from "../../testing";
import { BarToolGroup } from ".";

const TOOLS = [
  { name: "a", label: "工具甲", icon: "picture" },
  { name: "b", label: "工具乙", icon: "code" },
] as const;

/** 工具容器（原版ToolGroup的$group，见下方结构用例的原版出处） */
const getTools = (screen: { container: Element }) =>
  getRoot(screen).querySelector<HTMLElement>(".oo-ui-barToolGroup-tools")!;
/** 工具链接（data-tool-name为React侧定位钩子，原版经$link.parent()上的jQuery data定位） */
const getLink = (screen: { container: Element }, name: string) =>
  getRoot(screen).querySelector<HTMLElement>(`[data-tool-name="${name}"]`)!;
/** 工具根元素（链接的父span，承载oo-ui-tool类链与按压/激活态） */
const getToolSpan = (screen: { container: Element }, name: string) =>
  getLink(screen, name).parentElement as HTMLElement;

/** 鼠标按压：组级按压流委托在工具容器上，合成事件冒泡即入流 */
const press = (link: Element, type: "mousedown" | "mouseup" | "mouseout") =>
  link.dispatchEvent(new MouseEvent(type, { bubbles: true, cancelable: true }));

/**
 * BarToolGroup（对齐原版OO.ui.BarToolGroup）的浏览器渲染契约：
 * barToolGroup类链与工具容器、工具链接的图标/标题/快捷键槽位、
 * 组禁用与空组的下发、Bar专属的tooltip拼接（titleTooltips与accelTooltips皆true）、
 * displayBothIconAndLabel的标签类、符号名类与按压流。
 * 工具链接的键盘/指针语义由Toolbar与Tool的共享按压流承担，此处只覆盖Bar组自身的契约。
 */
it("结构：barToolGroup类链与工具容器，工具链接输出图标/标题/快捷键槽位", async () => {
  const screen = await render(
    <BarToolGroup tools={[{ ...TOOLS[0], accelerator: "Ctrl+K" }]} />,
  );
  const root = getRoot(screen);
  // 根：Widget基类类链 + ToolGroup的oo-ui-toolGroup（oojs-ui-toolbars.js:1149-1151），
  // BarToolGroup构造期追加oo-ui-barToolGroup（oojs-ui-toolbars.js:2012）
  expect(root.tagName).toBe("DIV");
  expect(root).toHaveClass("oo-ui-widget");
  expect(root).toHaveClass("oo-ui-widget-enabled");
  expect(root).toHaveClass("oo-ui-toolGroup");
  expect(root).toHaveClass("oo-ui-barToolGroup");

  const tools = getTools(screen);
  expect(tools).toHaveClass("oo-ui-toolGroup-tools"); // oojs-ui-toolbars.js:1148
  expect(tools).toHaveClass("oo-ui-barToolGroup-tools"); // oojs-ui-toolbars.js:2013
  expect(tools).toHaveClass("oo-ui-toolGroup-enabled-tools"); // oojs-ui-toolbars.js:1250

  // 工具：span.oo-ui-tool > a.oo-ui-tool-link > checkIcon + icon + title + accel
  // （oojs-ui-toolbars.js:763-768 的$element/$link组装）
  const link = getLink(screen, "a");
  expect(link.tagName).toBe("A");
  expect(link).toHaveClass("oo-ui-tool-link");
  expect(link).toHaveAttribute("role", "button");
  expect(link).toHaveAttribute("tabIndex", "0");
  // checkIcon是完整IconWidget（oojs-ui-toolbars.js:721-724），工具图标是IconElement裸span
  expect(link.querySelector(".oo-ui-tool-checkIcon")).toHaveClass("oo-ui-icon-check");
  expect(link.querySelector(".oo-ui-icon-picture")).toHaveClass("oo-ui-iconElement-icon");
  expect(link.querySelector(".oo-ui-tool-title")!.textContent).toBe("工具甲");
  const accel = link.querySelector(".oo-ui-tool-accel")!;
  expect(accel.textContent).toBe("Ctrl+K");
  // lang/dir按原版固定（oojs-ui-toolbars.js:746-750）
  expect(accel).toHaveAttribute("dir", "ltr");
  expect(accel).toHaveAttribute("lang", "en");

  const toolSpan = getToolSpan(screen, "a");
  expect(toolSpan.tagName).toBe("SPAN");
  expect(toolSpan).toHaveClass("oo-ui-tool");
  expect(toolSpan).toHaveClass("oo-ui-tool-name-a");
  expect(toolSpan).toHaveClass("oo-ui-tool-with-icon"); // oojs-ui-toolbars.js:1047
});

it("符号名类：路径形式取前两段（'a/b/c'→oo-ui-tool-name-a-b）", async () => {
  const screen = await render(
    <BarToolGroup tools={[{ name: "a/b/c", label: "工具甲" }]} />,
  );
  // 原版同一正则：oojs-ui-toolbars.js:766-767
  expect(getToolSpan(screen, "a/b/c")).toHaveClass("oo-ui-tool-name-a-b");
});

it("Bar组tooltip：title与快捷键拼为「标题 快捷键」，label不入tooltip", async () => {
  const screen = await render(
    <BarToolGroup
      tools={[
        { name: "a", label: "工具甲", title: "提示", accelerator: "Ctrl+K" },
        { name: "b", label: "工具乙" },
      ]}
    />,
  );
  // BarToolGroup的titleTooltips与accelTooltips皆为true（oojs-ui-toolbars.js:2026、2032）
  expect(getLink(screen, "a")).toHaveAttribute("title", "提示 Ctrl+K");
  // 两者都为空时不输出title属性（label恒为可见文本，不参与tooltip）
  expect(getLink(screen, "b").getAttribute("title")).toBeNull();
});

it("displayBothIconAndLabel：仅开启且有标签时输出tool-with-label", async () => {
  const screen = await render(
    <BarToolGroup
      tools={[
        { name: "a", label: "工具甲", icon: "picture" },
        { name: "b", label: "工具乙", icon: "code", displayBothIconAndLabel: true },
        { name: "c", label: "工具丙" },
      ]}
    />,
  );
  // 原版setDisplayBothIconAndLabel的条件：有标题且开关开启（oojs-ui-toolbars.js:959）
  expect(getToolSpan(screen, "a")).not.toHaveClass("oo-ui-tool-with-label");
  expect(getToolSpan(screen, "b")).toHaveClass("oo-ui-tool-with-label");
  expect(getToolSpan(screen, "c")).not.toHaveClass("oo-ui-tool-with-label");
  // 无图标：不出图标类（原版setIcon的hasIcon判定，oojs-ui-toolbars.js:1047）
  expect(getToolSpan(screen, "c")).not.toHaveClass("oo-ui-tool-with-icon");
});

it("部分工具禁用：组保持启用，仅该工具链接退出Tab序并禁用", async () => {
  const screen = await render(
    <BarToolGroup tools={[{ ...TOOLS[0], disabled: true }, TOOLS[1]]} />,
  );
  const root = getRoot(screen);
  expect(root).toHaveClass("oo-ui-widget-enabled");
  expect(getTools(screen)).toHaveClass("oo-ui-toolGroup-enabled-tools");

  const disabledLink = getLink(screen, "a");
  expect(disabledLink).toHaveAttribute("tabIndex", "-1");
  expect(disabledLink).toHaveAttribute("aria-disabled", "true");
  expect(getToolSpan(screen, "a")).toHaveClass("oo-ui-widget-disabled");
  expect(getLink(screen, "b")).toHaveAttribute("tabIndex", "0");
});

it("全部工具禁用即组禁用：根与工具容器输出禁用态", async () => {
  const screen = await render(
    <BarToolGroup
      tools={[
        { ...TOOLS[0], disabled: true },
        { ...TOOLS[1], disabled: true },
      ]}
    />,
  );
  const root = getRoot(screen);
  expect(root).toHaveClass("oo-ui-widget-disabled");
  expect(root).toHaveAttribute("aria-disabled", "true");
  // 原版onDisable：$group切换disabled-tools/enabled-tools（oojs-ui-toolbars.js:1249-1250）
  expect(getTools(screen)).toHaveClass("oo-ui-toolGroup-disabled-tools");
  expect(getTools(screen)).not.toHaveClass("oo-ui-toolGroup-enabled-tools");
  expect(getLink(screen, "a")).toHaveAttribute("tabIndex", "-1");
});

it("组disabled prop：无论工具自身状态整组禁用", async () => {
  const screen = await render(<BarToolGroup tools={[...TOOLS]} disabled />);
  expect(getRoot(screen)).toHaveClass("oo-ui-widget-disabled");
  expect(getTools(screen)).toHaveClass("oo-ui-toolGroup-disabled-tools");
  expect(getLink(screen, "a")).toHaveAttribute("tabIndex", "-1");
});

it("空组：toolGroup-empty整体隐藏，且按全部工具禁用判定为禁用组", async () => {
  const screen = await render(<BarToolGroup tools={[]} />);
  const root = getRoot(screen);
  // 原版populate末尾的toggleClass（oojs-ui-toolbars.js:1460）
  expect(root).toHaveClass("oo-ui-toolGroup-empty");
  expect(root).toHaveClass("oo-ui-widget-disabled");
  expect(getTools(screen)).toHaveClass("oo-ui-toolGroup-disabled-tools");
});

it("按压流：按下进入tool-active、移出仅清视觉、松开仍触发onSelect", async () => {
  const onSelect = vi.fn<() => void>();
  const screen = await render(
    <BarToolGroup tools={[{ name: "a", label: "工具甲", onSelect }]} />,
  );
  const link = getLink(screen, "a");
  const toolSpan = getToolSpan(screen, "a");

  press(link, "mousedown");
  await tick();
  expect(toolSpan).toHaveClass("oo-ui-tool-active");

  // 指针移出：仅清除按压视觉（对齐原版onMouseOutBlur），按压流不结束
  press(link, "mouseout");
  await tick();
  expect(toolSpan).not.toHaveClass("oo-ui-tool-active");

  // 松开仍落在发起工具上：onSelect照常触发
  press(link, "mouseup");
  await tick();
  expect(onSelect).toHaveBeenCalledOnce();
});

it("禁用工具：按压流拒绝进入，onSelect不触发", async () => {
  const onSelect = vi.fn<() => void>();
  const screen = await render(
    <BarToolGroup tools={[{ name: "a", label: "工具甲", disabled: true, onSelect }]} />,
  );
  const link = getLink(screen, "a");

  press(link, "mousedown");
  await tick();
  expect(getToolSpan(screen, "a")).not.toHaveClass("oo-ui-tool-active");

  press(link, "mouseup");
  await tick();
  expect(onSelect).not.toHaveBeenCalled();
});

it("align由Toolbar读取决定挂载位置，不透成DOM属性；未声明属性落根元素", async () => {
  const screen = await render(
    <BarToolGroup tools={[...TOOLS]} align="after" id="bar" title="工具栏组" />,
  );
  const root = getRoot(screen);
  expect(root.hasAttribute("align")).toBe(false);
  expect(root.id).toBe("bar");
  expect(root.getAttribute("title")).toBe("工具栏组");
});
