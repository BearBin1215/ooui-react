import { describe, expect, it, vi } from "vitest";
import { render } from "vitest-browser-react";
import { getRoot, snapshotHTML, tick } from "../../testing";
import { CheckboxInput } from ".";

/**
 * CheckboxInput（对齐原版OO.ui.CheckboxInputWidget）的浏览器渲染契约：
 * 原生checkbox勾选管线、value的表单提交值语义、indeterminate手动同步、禁用态。
 */
it("常规：根span输出input/checkboxInput类链，内含checkIcon", async () => {
  const screen = await render(<CheckboxInput name="agree" />);
  const root = getRoot(screen);
  expect(root).toHaveClass("oo-ui-inputWidget");
  expect(root).toHaveClass("oo-ui-checkboxInputWidget");
  const input = root.querySelector("input")!;
  expect(input).toHaveAttribute("type", "checkbox");
  expect(input).toHaveAttribute("name", "agree");
  // 选中态的视觉绘制图标（wikimediaui主题以image-invert反色）
  expect(root.querySelector(".oo-ui-checkboxInputWidget-checkIcon")).toBeTruthy();
});

it("点击切换：非受控时翻转勾选并按新状态回调onChange", async () => {
  const onChange = vi.fn<(checked: boolean, event?: unknown) => void>();
  const screen = await render(<CheckboxInput onChange={onChange} />);
  const input = screen.container.querySelector<HTMLInputElement>("input")!;
  expect(input.checked).toBe(false);
  await input.click();
  expect(input.checked).toBe(true);
  expect(onChange).toHaveBeenLastCalledWith(true, expect.anything());
  await input.click();
  expect(onChange).toHaveBeenLastCalledWith(false, expect.anything());
});

it("受控：勾选状态随checked prop，点击只回调不自行翻转", async () => {
  const onChange = vi.fn<(checked: boolean, event?: unknown) => void>();
  const screen = await render(<CheckboxInput checked={false} onChange={onChange} />);
  const input = screen.container.querySelector<HTMLInputElement>("input")!;
  await input.click();
  expect(onChange).toHaveBeenCalledTimes(1);
  expect(input.checked).toBe(false);
  await screen.rerender(<CheckboxInput checked onChange={onChange} />);
  expect(input.checked).toBe(true);
});

it("value是表单提交值语义：写入input的value属性而非勾选状态", async () => {
  const screen = await render(<CheckboxInput value="yes" defaultChecked />);
  const input = screen.container.querySelector<HTMLInputElement>("input")!;
  expect(input).toHaveAttribute("value", "yes");
  expect(input.checked).toBe(true);
});

it("indeterminate手动同步到DOM（非React受控属性）", async () => {
  const screen = await render(<CheckboxInput indeterminate />);
  await tick();
  const input = screen.container.querySelector<HTMLInputElement>("input")!;
  expect(input.indeterminate).toBe(true);
});

it("disabled：input禁用+tabIndex=-1，根输出禁用类，点击无效", async () => {
  const onChange = vi.fn<(checked: boolean, event?: unknown) => void>();
  const screen = await render(<CheckboxInput disabled onChange={onChange} />);
  const root = getRoot(screen);
  expect(root).toHaveClass("oo-ui-widget-disabled");
  const input = root.querySelector("input")!;
  expect(input).toHaveAttribute("disabled");
  expect(input).toHaveAttribute("tabIndex", "-1");
  await input.click();
  expect(input.checked).toBe(false);
  expect(onChange).not.toHaveBeenCalled();
});

describe("HTML快照", () => {
  // 快照锁结构：差异须有意识地更新，勿靠 -u 反推（靶心为原版DOM，见comparison-guide「渲染契约的靶心」）
  it("选中态+提交值", async () => {
    const screen = await render(
      <CheckboxInput name="agree" value="yes" defaultChecked />,
    );
    expect(snapshotHTML(screen.container)).toMatchInlineSnapshot(
      `"<span class="oo-ui-widget oo-ui-widget-enabled oo-ui-inputWidget oo-ui-checkboxInputWidget"><input checked="" class="oo-ui-inputWidget-input" name="agree" tabindex="0" type="checkbox" value="yes"><span class="oo-ui-iconElement-icon oo-ui-icon-check oo-ui-checkboxInputWidget-checkIcon oo-ui-image-invert oo-ui-widget oo-ui-widget-enabled oo-ui-iconElement oo-ui-iconWidget oo-ui-labelElement-invisible"></span></span>"`,
    );
  });
});
