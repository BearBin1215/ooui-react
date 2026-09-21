import { describe, expect, it, vi } from "vitest";
import { render } from "vitest-browser-react";
import { NumberInput } from ".";
import { getRoot, pressKey, tick, typeValue } from "../../testing";

/**
 * NumberInput（对齐原版OO.ui.NumberInputWidget）的浏览器渲染契约：
 * number输入元素与三段类链、非法文本归空、按钮步进（空值从0起步、min/max钳制、step取整）、
 * 数值合法性软校验（step倍数/min/max/required空值，挂载期即校验）。
 */
it("常规：number输入元素+numberInput类链，缺省输出步进按钮", async () => {
  const screen = await render(<NumberInput defaultValue={5} />);
  const root = getRoot(screen);
  expect(root).toHaveClass("oo-ui-inputWidget");
  expect(root).toHaveClass("oo-ui-textInputWidget");
  expect(root).toHaveClass("oo-ui-numberInputWidget");
  expect(root).toHaveClass("oo-ui-numberInputWidget-buttoned");
  const input = root.querySelector("input")!;
  expect(input).toHaveAttribute("type", "number");
  expect(input.value).toBe("5");
  expect(root.querySelector(".oo-ui-numberInputWidget-minusButton")).toBeTruthy();
  expect(root.querySelector(".oo-ui-numberInputWidget-plusButton")).toBeTruthy();
});

it("非法文本解析为空值：不提交NaN（type=number对非法输入消毒为空串）", async () => {
  const onChange = vi.fn<(value: number | "", event?: unknown) => void>();
  const screen = await render(<NumberInput defaultValue="" onChange={onChange} />);
  const input = screen.container.querySelector<HTMLInputElement>("input")!;
  await typeValue(input, "42");
  expect(onChange).toHaveBeenLastCalledWith(42, expect.anything());
  await typeValue(input, "abc");
  expect(onChange).toHaveBeenLastCalledWith("", expect.anything());
  expect(input.value).toBe("");
});

it("按钮步进：空值从0起步", async () => {
  const onChange = vi.fn<(value: number | "", event?: unknown) => void>();
  const screen = await render(<NumberInput defaultValue="" onChange={onChange} />);
  const plus = getRoot(screen).querySelector(".oo-ui-numberInputWidget-plusButton")!;
  await plus.querySelector("a")!.click();
  expect(onChange).toHaveBeenLastCalledWith(0);
});

it("按钮步进按buttonStep；超max钳制后不再提交", async () => {
  const onChange = vi.fn<(value: number | "", event?: unknown) => void>();
  const screen = await render(
    <NumberInput defaultValue={8} min={0} max={10} onChange={onChange} />,
  );
  const root = getRoot(screen);
  const plus = root
    .querySelector(".oo-ui-numberInputWidget-plusButton")!
    .querySelector("a")!;
  const minus = root
    .querySelector(".oo-ui-numberInputWidget-minusButton")!
    .querySelector("a")!;
  await plus.click();
  expect(onChange).toHaveBeenLastCalledWith(9);
  await plus.click();
  expect(onChange).toHaveBeenLastCalledWith(10);
  // 已到max：再点不提交新值
  const calls = onChange.mock.calls.length;
  await plus.click();
  expect(onChange.mock.calls.length).toBe(calls);
  await minus.click();
  expect(onChange).toHaveBeenLastCalledWith(9);
});

it("按钮步进：减到min后不再提交（下界钳制与上界同口径）", async () => {
  const onChange = vi.fn<(value: number | "", event?: unknown) => void>();
  const screen = await render(
    <NumberInput defaultValue={2} min={1} max={10} onChange={onChange} />,
  );
  const minus = getRoot(screen)
    .querySelector(".oo-ui-numberInputWidget-minusButton")!
    .querySelector("a")!;
  await minus.click();
  expect(onChange).toHaveBeenLastCalledWith(1);
  // 已到min：再点不提交新值
  const calls = onChange.mock.calls.length;
  await minus.click();
  expect(onChange.mock.calls.length).toBe(calls);
});

it("键盘步进：↑↓按buttonStep、PageUp/PageDown按10倍，并阻止默认移焦", async () => {
  const onChange = vi.fn<(value: number | "", event?: unknown) => void>();
  const screen = await render(
    <NumberInput defaultValue={5} min={0} max={100} onChange={onChange} />,
  );
  const input = getRoot(screen).querySelector("input")!;
  const keyEvent = (key: string) => {
    const event = new KeyboardEvent("keydown", { key, bubbles: true, cancelable: true });
    input.dispatchEvent(event);
    return event;
  };
  // 阻止默认：否则方向键会把光标移到输入框首/末
  expect(keyEvent("ArrowUp").defaultPrevented).toBe(true);
  expect(onChange).toHaveBeenLastCalledWith(6);
  // 每次步进后须落一轮渲染：步进量基于已提交值（经ref读取），同帧连按会读到旧值
  await tick();
  keyEvent("ArrowDown");
  await tick();
  expect(onChange).toHaveBeenLastCalledWith(5);
  keyEvent("PageUp");
  await tick();
  expect(onChange).toHaveBeenLastCalledWith(15);
  keyEvent("PageDown");
  await tick();
  expect(onChange).toHaveBeenLastCalledWith(5);
});

it("滚轮步进：仅聚焦时步进并阻止页面滚动，悬停未聚焦不拦截", async () => {
  const onChange = vi.fn<(value: number | "", event?: unknown) => void>();
  const screen = await render(
    <NumberInput defaultValue={5} min={0} max={10} onChange={onChange} />,
  );
  const input = getRoot(screen).querySelector("input")!;
  const wheelAt = (deltaY: number) => {
    const event = new WheelEvent("wheel", { deltaY, bubbles: true, cancelable: true });
    input.dispatchEvent(event);
    return event;
  };

  const idle = wheelAt(-1);
  await tick();
  expect(onChange).not.toHaveBeenCalled();
  expect(idle.defaultPrevented).toBe(false);

  input.focus();
  const wheel = wheelAt(-1);
  await tick();
  expect(onChange).toHaveBeenLastCalledWith(6);
  expect(wheel.defaultPrevented).toBe(true);
});

it("disabled/readOnly：步进通道停用，禁用态只由disabled输出到根", async () => {
  const onChange = vi.fn<(value: number | "", event?: unknown) => void>();
  const screen = await render(
    <NumberInput value={5} min={0} max={10} disabled onChange={onChange} />,
  );
  const root = getRoot(screen);
  expect(root).toHaveClass("oo-ui-widget-disabled");
  expect(root).toHaveAttribute("aria-disabled", "true");
  pressKey(root.querySelector("input")!, "ArrowUp");
  await tick();
  expect(onChange).not.toHaveBeenCalled();

  await screen.rerender(
    <NumberInput value={5} min={0} max={10} readOnly onChange={onChange} />,
  );
  // 只读不是禁用：根不输出禁用态（仅步进按钮停用，对齐原版isDisabled与isReadOnly分离）
  expect(root).not.toHaveClass("oo-ui-widget-disabled");
  pressKey(root.querySelector("input")!, "ArrowUp");
  await tick();
  expect(onChange).not.toHaveBeenCalled();
});

it("受控：显示值随value prop，步进只回调不改写", async () => {
  const onChange = vi.fn<(value: number | "", event?: unknown) => void>();
  const screen = await render(
    <NumberInput value={5} min={0} max={10} onChange={onChange} />,
  );
  const root = getRoot(screen);
  const input = root.querySelector("input")!;
  await root
    .querySelector(".oo-ui-numberInputWidget-plusButton")!
    .querySelector("a")!
    .click();
  expect(onChange).toHaveBeenLastCalledWith(6);
  // 受控不写内部state：父级未采纳前显示值不变
  expect(input.value).toBe("5");
});

it("step取整：步进结果收敛到step倍数（buttonStep显式取1）", async () => {
  const onChange = vi.fn<(value: number | "", event?: unknown) => void>();
  const screen = await render(
    <NumberInput defaultValue={4} step={5} buttonStep={1} onChange={onChange} />,
  );
  const plus = getRoot(screen)
    .querySelector(".oo-ui-numberInputWidget-plusButton")!
    .querySelector("a")!;
  // 4+1=5，收敛到step=5的倍数
  await plus.click();
  expect(onChange).toHaveBeenLastCalledWith(5);
});

it("数值合法性：非step倍数在挂载期即输出invalid标志（对齐原版setStep构造期校验）", async () => {
  const screen = await render(<NumberInput defaultValue={3} step={5} />);
  const root = getRoot(screen);
  expect(root).toHaveClass("oo-ui-flaggedElement-invalid");
  const input = root.querySelector("input")!;
  expect(input).toHaveAttribute("aria-invalid", "true");
});

it("required且空值在挂载期即输出invalid标志（对齐原版构造期校验）", async () => {
  const screen = await render(<NumberInput defaultValue="" required />);
  expect(getRoot(screen)).toHaveClass("oo-ui-flaggedElement-invalid");
});

describe("HTML快照", () => {
  // 快照锁结构：差异须有意识地更新，勿靠 -u 反推（靶心为原版DOM，见comparison-guide「渲染契约的靶心」）
  it("带步进按钮", async () => {
    const screen = await render(<NumberInput defaultValue={5} min={0} max={10} />);
    expect(screen.container.innerHTML).toMatchInlineSnapshot(
      `"<div class="oo-ui-widget oo-ui-widget-enabled oo-ui-inputWidget oo-ui-textInputWidget oo-ui-numberInputWidget oo-ui-textInputWidget-type-number oo-ui-numberInputWidget-buttoned"><span class="oo-ui-iconElement-icon oo-ui-iconElement-noIcon"></span><span class="oo-ui-indicatorElement-indicator oo-ui-indicatorElement-noIndicator"></span><div class="oo-ui-numberInputWidget-field"><span aria-hidden="true" class="oo-ui-numberInputWidget-minusButton oo-ui-widget oo-ui-widget-enabled oo-ui-iconElement oo-ui-buttonWidget oo-ui-buttonElement oo-ui-buttonElement-framed"><a class="oo-ui-buttonElement-button" role="button" tabindex="-1" rel="nofollow"><span class="oo-ui-iconElement-icon oo-ui-icon-subtract"></span><span class="oo-ui-labelElement-label"></span><span class="oo-ui-indicatorElement-indicator oo-ui-indicatorElement-noIndicator"></span></a></span><input tabindex="0" class="oo-ui-inputWidget-input" type="number" min="0" max="10" step="any" value="5"><span aria-hidden="true" class="oo-ui-numberInputWidget-plusButton oo-ui-widget oo-ui-widget-enabled oo-ui-iconElement oo-ui-buttonWidget oo-ui-buttonElement oo-ui-buttonElement-framed"><a class="oo-ui-buttonElement-button" role="button" tabindex="-1" rel="nofollow"><span class="oo-ui-iconElement-icon oo-ui-icon-add"></span><span class="oo-ui-labelElement-label"></span><span class="oo-ui-indicatorElement-indicator oo-ui-indicatorElement-noIndicator"></span></a></span></div></div>"`,
    );
  });
});
