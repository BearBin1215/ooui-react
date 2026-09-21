import { expect, it, vi } from "vitest";
import { render } from "vitest-browser-react";
import { BarToolGroup } from "../BarToolGroup";
import { Toolbar } from ".";

const TOOLS = [
  { name: "foo", title: "工具甲", icon: "picture" },
  { name: "bar", title: "工具乙", icon: "code" },
] as const;

/**
 * Toolbar（对齐原版OO.ui.Toolbar）的浏览器渲染契约：
 * position类、align=after工具组分发到右侧after容器、actions动作区、
 * 空白处按下的事件拦截（对齐原版onPointerDown，防焦点转移与文本选择）、
 * 工具上的按下不拦截且选择回调经按压流触发。
 * 窄栏判定依赖主题CSS的布局值（测试环境无样式），不在本文件覆盖。
 */
it("结构：toolbar根与position类，工具组进tools容器，actions进动作区", async () => {
  await render(
    <Toolbar actions={<span data-testid="actions">动作区</span>}>
      <BarToolGroup tools={[...TOOLS]} />
    </Toolbar>,
  );
  const root = document.querySelector(".oo-ui-toolbar")!;
  expect(root).toHaveClass("oo-ui-toolbar-position-top");
  const tools = root.querySelector(".oo-ui-toolbar-tools:not(.oo-ui-toolbar-after)")!;
  expect(tools.querySelector('[data-tool-name="foo"]')).toBeTruthy();
  expect(tools.querySelector('[data-tool-name="bar"]')).toBeTruthy();
  expect(
    root
      .querySelector(".oo-ui-toolbar-actions")!
      .contains(root.querySelector("[data-testid=actions]")!),
  ).toBe(true);
});

it("align=after的工具组分发到右侧after容器", async () => {
  await render(
    <Toolbar>
      <BarToolGroup tools={[TOOLS[0]]} />
      <BarToolGroup tools={[TOOLS[1]]} align="after" />
    </Toolbar>,
  );
  const root = document.querySelector(".oo-ui-toolbar")!;
  const before = root.querySelector(".oo-ui-toolbar-tools:not(.oo-ui-toolbar-after)")!;
  const after = root.querySelector(".oo-ui-toolbar-after")!;
  expect(before.querySelector('[data-tool-name="foo"]')).toBeTruthy();
  expect(after.querySelector('[data-tool-name="bar"]')).toBeTruthy();
  expect(after.querySelector('[data-tool-name="foo"]')).toBeNull();
});

it("position=bottom：切换position类", async () => {
  await render(
    <Toolbar position="bottom">
      <BarToolGroup tools={[...TOOLS]} />
    </Toolbar>,
  );
  expect(document.querySelector(".oo-ui-toolbar")).toHaveClass(
    "oo-ui-toolbar-position-bottom",
  );
});

it("空白处mousedown拦截默认行为与传播，工具上的按下可冒泡至document", async () => {
  const onSelect = vi.fn<() => void>();
  await render(
    <Toolbar>
      <BarToolGroup tools={[{ ...TOOLS[0], onSelect }, TOOLS[1]]} />
    </Toolbar>,
  );
  const root = document.querySelector(".oo-ui-toolbar")!;
  let docSeen = 0;
  const onDoc = () => {
    docSeen += 1;
  };
  document.addEventListener("mousedown", onDoc);

  // 点在工具栏自身（无oo-ui-widget祖先）：拦截默认行为并阻止传播（对齐原版onPointerDown）
  const blankEvent = new MouseEvent("mousedown", { bubbles: true, cancelable: true });
  root.dispatchEvent(blankEvent);
  expect(blankEvent.defaultPrevented).toBe(true);
  expect(docSeen).toBe(0);

  // 点在工具链接（处于工具组的oo-ui-widget内）：不因空白拦截而阻止传播——
  // 冒泡至document（defaultPrevented由工具组按压流置位，与空白拦截无关）
  const toolLink = root.querySelector('[data-tool-name="foo"]')!;
  const toolEvent = new MouseEvent("mousedown", { bubbles: true, cancelable: true });
  toolLink.dispatchEvent(toolEvent);
  expect(docSeen).toBe(1);
  // 按压流未被空白拦截吞掉：松开后onSelect照常提交（BarToolGroup侧另有该流的完整用例）
  toolLink.dispatchEvent(new MouseEvent("mouseup", { bubbles: true, cancelable: true }));
  expect(onSelect).toHaveBeenCalledOnce();
  document.removeEventListener("mousedown", onDoc);
});

// 工具快捷键文案/tooltip拼接与按压流的完整分支由 BarToolGroup/index.test.tsx 覆盖：
// Toolbar不改写子节点props（只按align分发容器），故此处不复测
