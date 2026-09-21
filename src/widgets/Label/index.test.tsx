import { expect, it } from "vitest";
import { render } from "vitest-browser-react";
import { getRoot } from "../../testing";
import { Label } from ".";

/**
 * Label（对齐原版OO.ui.LabelWidget）的浏览器渲染契约：
 * 根元素为<label>（原版static.tagName='label'）；根类链（widget+labelWidget+labelElement）、
 * invisibleLabel的裁剪类落点（根不再输出labelElement、label元素保留可访问名）、disabled类链、
 * title兜底解析。
 */
it("常规：根label元素输出widget/labelWidget/labelElement类链（对齐原版static.tagName）", async () => {
  const screen = await render(<Label>标签文本</Label>);
  const root = getRoot(screen);
  expect(root.tagName).toBe("LABEL");
  expect(root).toHaveClass("oo-ui-widget");
  expect(root).toHaveClass("oo-ui-labelWidget");
  expect(root).toHaveClass("oo-ui-labelElement");
  expect(root).toHaveClass("oo-ui-labelElement-label");
  expect(root.textContent).toBe("标签文本");
});

it("invisibleLabel：根不再输出oo-ui-labelElement，裁剪类落在label元素且可访问名保留", async () => {
  const screen = await render(<Label invisibleLabel>标签文本</Label>);
  const root = getRoot(screen);
  expect(root).not.toHaveClass("oo-ui-labelElement");
  expect(root).toHaveClass("oo-ui-labelElement-label");
  expect(root).toHaveClass("oo-ui-labelElement-invisible");
  expect(root.textContent).toBe("标签文本");
});

it("disabled：widget-disabled类与aria-disabled", async () => {
  const screen = await render(<Label disabled>标签文本</Label>);
  const root = getRoot(screen);
  expect(root).toHaveClass("oo-ui-widget-disabled");
  expect(root).toHaveAttribute("aria-disabled", "true");
});

it("title解析：显式title优先，invisibleLabel以标签文本兜底", async () => {
  const screen = await render(<Label title="提示">标签文本</Label>);
  expect(getRoot(screen)).toHaveAttribute("title", "提示");
  // 可见标签无title兜底（对齐原版TitledElement不回退）
  const screen2 = await render(<Label>标签文本</Label>);
  expect(getRoot(screen2)).not.toHaveAttribute("title");
  // 不可见标签以字符串标签兜底title，保持可访问名
  const screen3 = await render(<Label invisibleLabel>标签文本</Label>);
  expect(getRoot(screen3)).toHaveAttribute("title", "标签文本");
});
