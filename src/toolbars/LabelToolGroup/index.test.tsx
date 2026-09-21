import { expect, it } from "vitest";
import { render } from "vitest-browser-react";
import { getRoot } from "../../testing";
import { LabelToolGroup } from ".";

/**
 * LabelToolGroup（对齐原版OO.ui.LabelToolGroup）的浏览器渲染契约：
 * 只保留handle的静态文本块（无工具容器、不可交互）、把手图标与指示器槽位、
 * title落在根元素、禁用态与align不透传。
 */
it("结构：labelToolGroup类链与handle，不渲染工具容器", async () => {
  const screen = await render(
    <LabelToolGroup label="提示文本" icon="info" indicator="down" title="tooltip" />,
  );
  const root = getRoot(screen);
  // 根即容器首子（LabelToolGroup自持根div、无portal，与Menu/List机制不同但结论同）
  expect(root).toBe(document.querySelector(".oo-ui-labelToolGroup"));
  expect(root).toHaveClass("oo-ui-widget");
  expect(root).toHaveClass("oo-ui-toolGroup");
  expect(root).toHaveClass("oo-ui-labelElement");
  expect(root).toHaveClass("oo-ui-iconElement");
  expect(root).toHaveClass("oo-ui-indicatorElement");
  // 原版TitledElement的$titled即$element：title落在根元素
  expect(root.getAttribute("title")).toBe("tooltip");

  const handle = root.querySelector(
    ".oo-ui-toolGroup-handle.oo-ui-labelToolGroup-handle",
  )!;
  expect(handle.querySelector(".oo-ui-labelElement-label")!.textContent).toBe("提示文本");
  expect(handle.querySelector(".oo-ui-iconElement-icon")).toHaveClass("oo-ui-icon-info");
  expect(handle.querySelector(".oo-ui-indicatorElement-indicator")).toHaveClass(
    "oo-ui-indicator-down",
  );
  // 原版populate为空实现且移除了$group：不渲染工具容器
  expect(root.querySelector(".oo-ui-toolGroup-tools")).toBeNull();
});

it("disabled：输出禁用态类与aria-disabled", async () => {
  const screen = await render(<LabelToolGroup label="提示" disabled />);
  const root = getRoot(screen);
  expect(root).toHaveClass("oo-ui-widget-disabled");
  expect(root).toHaveAttribute("aria-disabled", "true");
});

it("align由Toolbar读取决定挂载位置，不透成DOM属性", async () => {
  const screen = await render(<LabelToolGroup label="提示" align="after" />);
  expect(getRoot(screen).hasAttribute("align")).toBe(false);
});
