import { describe, expect, it, vi } from "vitest";
import { render } from "vitest-browser-react";
import { getRoot, snapshotHTML } from "../../testing";
import { RadioInput } from ".";

/**
 * RadioInput（对齐原版OO.ui.RadioInputWidget）的浏览器渲染契约：
 * 原生radio勾选管线、已选中项再点击不取消（radio语义）、禁用态、表单提交值。
 */
it("常规：根span输出input/radioInput类链，内含radio元素", async () => {
  const screen = await render(<RadioInput name="pick" />);
  const root = getRoot(screen);
  expect(root).toHaveClass("oo-ui-inputWidget");
  expect(root).toHaveClass("oo-ui-radioInputWidget");
  const input = root.querySelector("input")!;
  expect(input).toHaveAttribute("type", "radio");
  expect(input).toHaveAttribute("name", "pick");
});

it("未选中点击勾选并回调onChange(true)", async () => {
  const onChange = vi.fn<(checked: boolean, event?: unknown) => void>();
  const screen = await render(<RadioInput onChange={onChange} />);
  const input = screen.container.querySelector<HTMLInputElement>("input")!;
  await input.click();
  expect(input.checked).toBe(true);
  expect(onChange).toHaveBeenLastCalledWith(true, expect.anything());
});

it("已选中再点击保持勾选（radio不可反选）", async () => {
  const onChange = vi.fn<(checked: boolean, event?: unknown) => void>();
  const screen = await render(<RadioInput checked onChange={onChange} />);
  const input = screen.container.querySelector<HTMLInputElement>("input")!;
  expect(input.checked).toBe(true);
  await input.click();
  expect(input.checked).toBe(true);
  // 原生radio语义：已选中项的再次点击不产生change
  expect(onChange).not.toHaveBeenCalled();
});

it("value：提交值写入input的value（不影响勾选态）", async () => {
  const screen = await render(<RadioInput name="pick" value="yes" />);
  const input = screen.container.querySelector<HTMLInputElement>("input")!;
  expect(input).toHaveAttribute("value", "yes");
  expect(input.checked).toBe(false);
});

it("disabled：input禁用+tabIndex=-1，点击无效", async () => {
  const onChange = vi.fn<(checked: boolean, event?: unknown) => void>();
  const screen = await render(<RadioInput disabled onChange={onChange} />);
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
  it("单选框", async () => {
    const screen = await render(<RadioInput name="pick" />);
    expect(snapshotHTML(screen.container)).toMatchInlineSnapshot(
      `"<span class="oo-ui-widget oo-ui-widget-enabled oo-ui-inputWidget oo-ui-radioInputWidget"><input class="oo-ui-inputWidget-input" name="pick" tabindex="0" type="radio" value=""><span></span></span>"`,
    );
  });
});
