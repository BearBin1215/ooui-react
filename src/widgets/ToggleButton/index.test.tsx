import { describe, expect, it, vi } from "vitest";
import { render } from "vitest-browser-react";
import { getRoot, tick } from "../../testing";
import { FieldLayout } from "../../layouts/FieldLayout";
import { ToggleButton } from ".";

/** 开关状态落在按钮锚点上（对齐原版ToggleWidget的aria状态写入$tabIndexed=$button） */
const getAnchor = (screen: { container: Element }) =>
  screen.container.querySelector<HTMLElement>("[role=button]")!;

/**
 * ToggleButton（对齐原版OO.ui.ToggleButtonWidget）的浏览器渲染契约：
 * 继承链类（toggle→toggleButton，**不含**buttonWidget）、on/off形态类与aria-pressed落点、
 * 受控/非受控切换、禁用拦截，以及Button组合继承来的FieldLayout标签联动。
 */
it("继承链不含oo-ui-buttonWidget（主题按钮行距规则不应命中）", async () => {
  const screen = await render(<ToggleButton>开关</ToggleButton>);
  const root = getRoot(screen);
  expect(root).toHaveClass("oo-ui-toggleWidget");
  expect(root).toHaveClass("oo-ui-toggleButtonWidget");
  expect(root).not.toHaveClass("oo-ui-buttonWidget");
  expect(getAnchor(screen)).toHaveAttribute("aria-pressed", "false");
});

it("点击切换：非受控时翻转并按新状态回调onChange", async () => {
  const onChange = vi.fn<(checked: boolean) => void>();
  const screen = await render(<ToggleButton onChange={onChange}>开关</ToggleButton>);
  const root = getRoot(screen);

  await getAnchor(screen).click();
  await tick();
  expect(onChange).toHaveBeenLastCalledWith(true);
  expect(root).toHaveClass("oo-ui-toggleWidget-on");
  expect(root).toHaveClass("oo-ui-buttonElement-active");
  expect(getAnchor(screen)).toHaveAttribute("aria-pressed", "true");

  // 再次点击翻回关态
  await getAnchor(screen).click();
  await tick();
  expect(onChange).toHaveBeenLastCalledWith(false);
  expect(root).toHaveClass("oo-ui-toggleWidget-off");
  expect(root).not.toHaveClass("oo-ui-buttonElement-active");
});

it("受控：显示态随checked，点击只回调", async () => {
  const onChange = vi.fn<(checked: boolean) => void>();
  const screen = await render(
    <ToggleButton checked={false} onChange={onChange}>
      开关
    </ToggleButton>,
  );
  const root = getRoot(screen);
  await getAnchor(screen).click();
  await tick();
  expect(onChange).toHaveBeenCalledExactlyOnceWith(true);
  expect(root).toHaveClass("oo-ui-toggleWidget-off");
  expect(getAnchor(screen)).toHaveAttribute("aria-pressed", "false");
});

it("disabled：点击不触发onChange，锚点退出Tab序", async () => {
  const onChange = vi.fn<(checked: boolean) => void>();
  const screen = await render(
    <ToggleButton disabled onChange={onChange}>
      开关
    </ToggleButton>,
  );
  const anchor = getAnchor(screen);
  expect(anchor).toHaveAttribute("tabIndex", "-1");
  anchor.dispatchEvent(new MouseEvent("click", { bubbles: true, cancelable: true }));
  await tick();
  expect(onChange).not.toHaveBeenCalled();
});

it("FieldLayout内：锚点经aria-labelledby关联label，点击标签聚焦锚点", async () => {
  const screen = await render(
    <FieldLayout label="切换开关">
      <ToggleButton>开关</ToggleButton>
    </FieldLayout>,
  );
  const label = screen.getByText("切换开关");
  const anchor = getAnchor(screen);
  expect(anchor).toHaveAttribute("aria-labelledby", label.element().id);

  await label.click();
  await tick();
  expect(document.activeElement).toBe(anchor);
});

describe("HTML快照", () => {
  // 快照锁结构：差异须有意识地更新，勿靠 -u 反推（靶心为原版DOM，见comparison-guide「渲染契约的靶心」）。
  // 根为span对齐原版（ToggleButtonWidget继承ButtonWidget故沿用ButtonElement的标签名）
  it("关", async () => {
    const screen = await render(<ToggleButton>开关</ToggleButton>);
    expect(screen.container.innerHTML).toMatchInlineSnapshot(
      `"<span class="oo-ui-toggleWidget-off oo-ui-widget oo-ui-widget-enabled oo-ui-labelElement oo-ui-toggleWidget oo-ui-toggleButtonWidget oo-ui-buttonElement oo-ui-buttonElement-framed"><a class="oo-ui-buttonElement-button" role="button" tabindex="0" rel="nofollow" aria-pressed="false"><span class="oo-ui-iconElement-icon oo-ui-iconElement-noIcon"></span><span class="oo-ui-labelElement-label">开关</span><span class="oo-ui-indicatorElement-indicator oo-ui-indicatorElement-noIndicator"></span></a></span>"`,
    );
  });

  it("开", async () => {
    const screen = await render(
      <ToggleButton defaultChecked disabled>
        开关
      </ToggleButton>,
    );
    expect(screen.container.innerHTML).toMatchInlineSnapshot(
      `"<span class="oo-ui-toggleWidget-on oo-ui-widget oo-ui-widget-disabled oo-ui-labelElement oo-ui-toggleWidget oo-ui-toggleButtonWidget oo-ui-buttonElement oo-ui-buttonElement-framed oo-ui-buttonElement-active" aria-disabled="true"><a class="oo-ui-buttonElement-button" role="button" tabindex="-1" aria-disabled="true" rel="nofollow" aria-pressed="true"><span class="oo-ui-iconElement-icon oo-ui-iconElement-noIcon oo-ui-image-invert"></span><span class="oo-ui-labelElement-label">开关</span><span class="oo-ui-indicatorElement-indicator oo-ui-indicatorElement-noIndicator oo-ui-image-invert"></span></a></span>"`,
    );
  });
});
