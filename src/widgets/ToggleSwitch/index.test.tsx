import { describe, expect, it, vi } from "vitest";
import { render } from "vitest-browser-react";
import { ToggleSwitch } from ".";
import { getRoot, pressKey, tick } from "../../testing";

/**
 * ToggleSwitch（对齐原版OO.ui.ToggleSwitchWidget）的浏览器渲染契约：
 * role=switch与aria-checked、on/off形态类、glow/grip结构、左键与Space/Enter切换、禁用态。
 */
it("常规：role=switch + aria-checked，内含glow/grip装饰元素", async () => {
  const screen = await render(<ToggleSwitch defaultChecked />);
  const root = getRoot(screen);
  // 根为div：原版ToggleSwitchWidget未覆写getTagName，沿用Widget基类的div
  expect(root.tagName).toBe("DIV");
  expect(root).toHaveAttribute("role", "switch");
  expect(root).toHaveAttribute("aria-checked", "true");
  expect(root).toHaveClass("oo-ui-toggleSwitchWidget");
  expect(root).toHaveClass("oo-ui-toggleWidget-on");
  expect(root).not.toHaveClass("oo-ui-toggleWidget-off");
  expect(root.querySelector(".oo-ui-toggleSwitchWidget-glow")).toBeTruthy();
  expect(root.querySelector(".oo-ui-toggleSwitchWidget-grip")).toBeTruthy();
});

it("点击切换：非受控时翻转并按新状态回调onChange", async () => {
  const onChange = vi.fn<(checked: boolean) => void>();
  const screen = await render(<ToggleSwitch onChange={onChange} />);
  const root = getRoot(screen);
  await (root as HTMLElement).click();
  expect(root).toHaveClass("oo-ui-toggleWidget-on");
  expect(root).toHaveAttribute("aria-checked", "true");
  expect(onChange).toHaveBeenLastCalledWith(true);
});

it("Space/Enter切换并阻止Space滚动页面", async () => {
  const onChange = vi.fn<(checked: boolean) => void>();
  const screen = await render(<ToggleSwitch onChange={onChange} />);
  const root = getRoot(screen);
  const space = new KeyboardEvent("keydown", {
    key: " ",
    bubbles: true,
    cancelable: true,
  });
  root.dispatchEvent(space);
  await tick();
  expect(onChange).toHaveBeenLastCalledWith(true);
  // 空格须阻止默认行为（否则会滚动页面）
  expect(space.defaultPrevented).toBe(true);
  pressKey(root, "Enter");
  await tick();
  expect(onChange).toHaveBeenLastCalledWith(false);
});

it("受控：显示态随checked prop，点击只回调", async () => {
  const onChange = vi.fn<(checked: boolean) => void>();
  const screen = await render(<ToggleSwitch checked={false} onChange={onChange} />);
  const root = getRoot(screen);
  await (root as HTMLElement).click();
  expect(onChange).toHaveBeenCalledTimes(1);
  expect(root).toHaveAttribute("aria-checked", "false");
});

it("disabled：点击无效、tabIndex=-1", async () => {
  const onChange = vi.fn<(checked: boolean) => void>();
  const screen = await render(<ToggleSwitch disabled onChange={onChange} />);
  const root = getRoot(screen);
  expect(root).toHaveClass("oo-ui-widget-disabled");
  expect(root).toHaveAttribute("tabIndex", "-1");
  await (root as HTMLElement).click();
  expect(onChange).not.toHaveBeenCalled();
});

describe("HTML快照", () => {
  // 快照锁结构：差异须有意识地更新，勿靠 -u 反推（靶心为原版DOM，见comparison-guide「渲染契约的靶心」）。
  // 根为div对齐原版（ToggleSwitchWidget未覆写getTagName），内层glow/grip仍为span
  it("关", async () => {
    const screen = await render(<ToggleSwitch />);
    expect(screen.container.innerHTML).toMatchInlineSnapshot(
      `"<div class="oo-ui-widget oo-ui-widget-enabled oo-ui-toggleWidget oo-ui-toggleSwitchWidget oo-ui-toggleWidget-off" role="switch" aria-checked="false" tabindex="0"><span class="oo-ui-toggleSwitchWidget-glow"></span><span class="oo-ui-toggleSwitchWidget-grip"></span></div>"`,
    );
  });

  it("开", async () => {
    const screen = await render(<ToggleSwitch defaultChecked />);
    expect(screen.container.innerHTML).toMatchInlineSnapshot(
      `"<div class="oo-ui-widget oo-ui-widget-enabled oo-ui-toggleWidget oo-ui-toggleSwitchWidget oo-ui-toggleWidget-on" role="switch" aria-checked="true" tabindex="0"><span class="oo-ui-toggleSwitchWidget-glow"></span><span class="oo-ui-toggleSwitchWidget-grip"></span></div>"`,
    );
  });
});
