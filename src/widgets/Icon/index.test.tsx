import { describe, expect, it } from "vitest";
import { render } from "vitest-browser-react";
import { getRoot, snapshotHTML } from "../../testing";
import { Icon } from ".";

/**
 * Icon（对齐原版OO.ui.IconWidget）的浏览器渲染契约：
 * widget根类、图标类与noIcon占位、invisible裁剪类落点、flag变体双类、禁用态与透传。
 */
it("常规icon：widget根类+图标类，无noIcon占位", async () => {
  const screen = await render(<Icon icon="check" />);
  const icon = getRoot(screen);
  expect(icon).toHaveClass("oo-ui-iconWidget");
  expect(icon).toHaveClass("oo-ui-iconElement-icon");
  expect(icon).toHaveClass("oo-ui-icon-check");
  expect(icon).not.toHaveClass("oo-ui-iconElement-noIcon");
});

it("无icon时输出noIcon占位类（对齐原版setIcon的空占位，主题CSS以其隐藏空占位）", async () => {
  const screen = await render(<Icon />);
  const icon = getRoot(screen);
  expect(icon).toHaveClass("oo-ui-iconElement-noIcon");
  expect(icon.className).not.toMatch(/oo-ui-icon-/);
});

it("flags同时输出flagged类与image着色变体类", async () => {
  const screen = await render(<Icon icon="check" flags="progressive" />);
  const icon = getRoot(screen);
  expect(icon).toHaveClass("oo-ui-flaggedElement-progressive");
  expect(icon).toHaveClass("oo-ui-image-progressive");
});

it("disabled：widget禁用类与aria-disabled", async () => {
  const screen = await render(<Icon icon="check" disabled />);
  const icon = getRoot(screen);
  expect(icon).toHaveClass("oo-ui-widget-disabled");
  expect(icon).toHaveAttribute("aria-disabled", "true");
});

it("根元素即label元素：恒携带invisible裁剪类", async () => {
  const screen = await render(<Icon icon="check" />);
  expect(getRoot(screen)).toHaveClass("oo-ui-labelElement-invisible");
});

it("className与id等透传属性落到根元素", async () => {
  const screen = await render(<Icon icon="check" className="cmp-extra" id="cmp-icon" />);
  const icon = getRoot(screen);
  expect(icon).toHaveClass("cmp-extra");
  expect(icon).toHaveAttribute("id", "cmp-icon");
});

describe("HTML快照", () => {
  // 快照锁结构：差异须有意识地更新，勿靠 -u 反推（靶心为原版DOM，见comparison-guide「渲染契约的靶心」）
  it("快照：常规icon的完整类串与顺序", async () => {
    const screen = await render(<Icon icon="check" />);
    expect(snapshotHTML(screen.container)).toMatchInlineSnapshot(
      `"<span class="oo-ui-iconElement-icon oo-ui-icon-check oo-ui-widget oo-ui-widget-enabled oo-ui-iconElement oo-ui-iconWidget oo-ui-labelElement-invisible"></span>"`,
    );
  });

  it("flags变体", async () => {
    const screen = await render(<Icon icon="check" flags="progressive" />);
    expect(snapshotHTML(screen.container)).toMatchInlineSnapshot(
      `"<span class="oo-ui-iconElement-icon oo-ui-icon-check oo-ui-widget oo-ui-widget-enabled oo-ui-iconElement oo-ui-iconWidget oo-ui-labelElement-invisible oo-ui-flaggedElement-progressive oo-ui-image-progressive"></span>"`,
    );
  });
});
