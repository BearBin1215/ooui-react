import { describe, expect, it } from "vitest";
import { render } from "vitest-browser-react";
import { getRoot, snapshotHTML } from "../../testing";
import { Indicator } from ".";

/**
 * Indicator（对齐原版OO.ui.IndicatorWidget）的浏览器渲染契约：
 * 根span的widget/indicator类链、indicator变体类、noIndicator占位、禁用态。
 */
it("有indicator：widget根类+indicator类+方向变体类", async () => {
  const screen = await render(<Indicator indicator="down" />);
  const root = getRoot(screen);
  expect(root.tagName).toBe("SPAN");
  expect(root).toHaveClass("oo-ui-indicatorWidget");
  expect(root).toHaveClass("oo-ui-indicatorElement-indicator");
  expect(root).toHaveClass("oo-ui-indicator-down");
  // 单元素组件：根元素即label元素，恒携带invisible裁剪类
  expect(root).toHaveClass("oo-ui-labelElement-invisible");
  expect(root).not.toHaveClass("oo-ui-indicatorElement-noIndicator");
});

it("无indicator输出noIndicator占位类（主题CSS以其隐藏空占位）", async () => {
  const screen = await render(<Indicator />);
  const root = getRoot(screen);
  expect(root).toHaveClass("oo-ui-indicatorElement-noIndicator");
  expect(root.className).not.toMatch(/oo-ui-indicator-/);
});

it("disabled：widget禁用类与aria-disabled", async () => {
  const screen = await render(<Indicator indicator="up" disabled />);
  const root = getRoot(screen);
  expect(root).toHaveClass("oo-ui-widget-disabled");
  expect(root).toHaveAttribute("aria-disabled", "true");
});

it("className与id等透传属性落到根元素", async () => {
  const screen = await render(
    <Indicator indicator="clear" className="cmp-extra" id="cmp-indicator" />,
  );
  const root = getRoot(screen);
  expect(root).toHaveClass("cmp-extra");
  expect(root).toHaveAttribute("id", "cmp-indicator");
});

describe("HTML快照", () => {
  // 快照锁结构：差异须有意识地更新，勿靠 -u 反推（靶心为原版DOM，见comparison-guide「渲染契约的靶心」）
  it("快照：常规indicator的完整类串与顺序", async () => {
    const screen = await render(<Indicator indicator="down" />);
    expect(snapshotHTML(screen.container)).toMatchInlineSnapshot(
      `"<span class="oo-ui-indicatorElement-indicator oo-ui-indicator-down oo-ui-widget oo-ui-widget-enabled oo-ui-indicatorElement oo-ui-indicatorWidget oo-ui-labelElement-invisible"></span>"`,
    );
  });

  it("无indicator占位", async () => {
    const screen = await render(<Indicator />);
    expect(snapshotHTML(screen.container)).toMatchInlineSnapshot(
      `"<span class="oo-ui-indicatorElement-indicator oo-ui-indicatorElement-noIndicator oo-ui-widget oo-ui-widget-enabled oo-ui-indicatorWidget oo-ui-labelElement-invisible"></span>"`,
    );
  });
});
