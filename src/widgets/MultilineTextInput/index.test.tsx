import { describe, expect, it, vi } from "vitest";
import { render } from "vitest-browser-react";
import { MultilineTextInput } from ".";
import { getRoot, typeValue } from "../../testing";

/**
 * MultilineTextInput（对齐原版OO.ui.MultilineTextInputWidget）的浏览器渲染契约：
 * textarea元素与rows属性、autosize类、值管线、多行输入不折叠换行。
 */
it("textarea元素：rows属性与autosized类", async () => {
  const screen = await render(<MultilineTextInput rows={3} autosize />);
  const root = getRoot(screen);
  // 多行输入恒输出type-text类（对齐原版继承TextInputWidget的type类）
  expect(root).toHaveClass("oo-ui-textInputWidget-type-text");
  const textarea = root.querySelector("textarea")!;
  expect(textarea).toHaveAttribute("rows", "3");
  expect(textarea).toHaveClass("oo-ui-textInputWidget-autosized");
});

it("非受控：输入更新值并按值优先回调onChange（换行原样保留）", async () => {
  const onChange = vi.fn<(value: string, event?: unknown) => void>();
  const screen = await render(<MultilineTextInput defaultValue="" onChange={onChange} />);
  const textarea = screen.container.querySelector<HTMLTextAreaElement>("textarea")!;
  await typeValue(textarea, "第一行\n第二行");
  expect(onChange).toHaveBeenCalledWith("第一行\n第二行", expect.anything());
  expect(textarea.value).toContain("\n");
});

it("受控：显示值随props更新", async () => {
  const screen = await render(<MultilineTextInput value="a" />);
  const textarea = screen.container.querySelector<HTMLTextAreaElement>("textarea")!;
  expect(textarea.value).toBe("a");
  await screen.rerender(<MultilineTextInput value="b" />);
  expect(textarea.value).toBe("b");
});

it("disabled：textarea禁用+tabIndex=-1，根输出禁用类", async () => {
  const screen = await render(<MultilineTextInput disabled />);
  const root = getRoot(screen);
  expect(root).toHaveClass("oo-ui-widget-disabled");
  const textarea = root.querySelector("textarea")!;
  expect(textarea).toHaveAttribute("disabled");
  expect(textarea).toHaveAttribute("tabIndex", "-1");
});

describe("HTML快照", () => {
  // 快照锁结构：差异须有意识地更新，勿靠 -u 反推（靶心为原版DOM，见comparison-guide「渲染契约的靶心」）
  it("多行文本框", async () => {
    const screen = await render(
      <MultilineTextInput rows={3} defaultValue={"第一行\n第二行"} />,
    );
    expect(screen.container.innerHTML).toMatchInlineSnapshot(`
      "<div class="oo-ui-widget oo-ui-widget-enabled oo-ui-inputWidget oo-ui-textInputWidget oo-ui-textInputWidget-type-text"><textarea tabindex="0" class="oo-ui-inputWidget-input" rows="3">第一行
      第二行</textarea><span class="oo-ui-iconElement-icon oo-ui-iconElement-noIcon"></span><span class="oo-ui-indicatorElement-indicator oo-ui-indicatorElement-noIndicator" style="right: 2px;"></span></div>"
    `);
  });
});
