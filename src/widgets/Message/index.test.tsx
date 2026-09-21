import { describe, expect, it, vi } from "vitest";
import { render } from "vitest-browser-react";
import { getRoot } from "../../testing";
import { Message } from ".";

/**
 * Message（对齐原版OO.ui.MessageWidget）的浏览器渲染契约：
 * 类型→图标/标志类/播报语义（error打断式）、inline形态、关闭按钮回调、非法type回退。
 */
it("常规：块级消息，type输出flagged类与图标着色变体", async () => {
  const screen = await render(<Message type="warning">注意</Message>);
  const root = getRoot(screen);
  expect(root).toHaveClass("oo-ui-messageWidget");
  expect(root).toHaveClass("oo-ui-messageWidget-block");
  expect(root).toHaveClass("oo-ui-flaggedElement-warning");
  const icon = root.querySelector(".oo-ui-iconElement-icon")!;
  expect(icon).toHaveClass("oo-ui-icon-alert");
  expect(icon).toHaveClass("oo-ui-image-warning");
  expect(root.querySelector(".oo-ui-labelElement-label")?.textContent).toBe("注意");
});

it("error类型用role=alert打断式播报，其余类型polite", async () => {
  const screen = await render(<Message type="error">出错</Message>);
  const root = getRoot(screen);
  expect(root).toHaveAttribute("role", "alert");
  expect(root).not.toHaveAttribute("aria-live");
  const screen2 = await render(<Message type="notice">提示</Message>);
  const root2 = getRoot(screen2);
  expect(root2).toHaveAttribute("aria-live", "polite");
  expect(root2).not.toHaveAttribute("role", "alert");
});

it("非法type回退notice（含默认info图标）", async () => {
  const screen = await render(<Message type={"oops" as "notice"}>内容</Message>);
  const root = getRoot(screen);
  expect(root).toHaveClass("oo-ui-flaggedElement-notice");
  expect(root.querySelector(".oo-ui-iconElement-icon")).toHaveClass(
    "oo-ui-icon-infoFilled",
  );
});

it("显式icon覆盖类型默认图标", async () => {
  const screen = await render(
    <Message type="warning" icon="check">
      内容
    </Message>,
  );
  expect(getRoot(screen).querySelector(".oo-ui-iconElement-icon")).toHaveClass(
    "oo-ui-icon-check",
  );
});

it("inline：无block类，即使showClose也不渲染关闭按钮", async () => {
  const onClose = vi.fn<() => void>();
  const screen = await render(
    <Message inline showClose onClose={onClose}>
      内容
    </Message>,
  );
  const root = getRoot(screen);
  expect(root).not.toHaveClass("oo-ui-messageWidget-block");
  expect(root).not.toHaveClass("oo-ui-messageWidget-showClose");
  expect(root.querySelector(".oo-ui-messageWidget-close")).toBeNull();
});

it("showClose渲染关闭按钮（aria标签取消息），点击回调onClose且不自行隐藏", async () => {
  const onClose = vi.fn<() => void>();
  const screen = await render(
    <Message showClose onClose={onClose}>
      内容
    </Message>,
  );
  const root = getRoot(screen);
  const close = root.querySelector(".oo-ui-messageWidget-close [role=button]")!;
  // 可访问名来自invisibleLabel的标签文本（默认英文消息"Close"），非aria-label属性
  expect(close.textContent).toContain("Close");
  await (close as HTMLElement).click();
  expect(onClose).toHaveBeenCalledOnce();
  // 组件不自行隐藏：消息仍渲染，显隐由调用方控制
  expect(root).toHaveClass("oo-ui-messageWidget");
});

describe("HTML快照", () => {
  // 快照锁结构：差异须有意识地更新，勿靠 -u 反推（靶心为原版DOM，见comparison-guide「渲染契约的靶心」）
  it("warning块级消息", async () => {
    const screen = await render(<Message type="warning">注意</Message>);
    expect(screen.container.innerHTML).toMatchInlineSnapshot(
      `"<div class="oo-ui-widget oo-ui-widget-enabled oo-ui-iconElement oo-ui-labelElement oo-ui-messageWidget oo-ui-messageWidget-block oo-ui-flaggedElement-warning" aria-live="polite"><span class="oo-ui-iconElement-icon oo-ui-icon-alert oo-ui-image-warning"></span><span class="oo-ui-labelElement-label">注意</span></div>"`,
    );
  });

  it("error带关闭按钮", async () => {
    const screen = await render(
      <Message type="error" showClose>
        出错
      </Message>,
    );
    expect(screen.container.innerHTML).toMatchInlineSnapshot(
      `"<div class="oo-ui-widget oo-ui-widget-enabled oo-ui-iconElement oo-ui-labelElement oo-ui-messageWidget oo-ui-messageWidget-block oo-ui-messageWidget-showClose oo-ui-flaggedElement-error" role="alert"><span class="oo-ui-iconElement-icon oo-ui-icon-error oo-ui-image-error"></span><span class="oo-ui-labelElement-label">出错</span><span class="oo-ui-messageWidget-close oo-ui-widget oo-ui-widget-enabled oo-ui-iconElement oo-ui-buttonWidget oo-ui-buttonElement oo-ui-buttonElement-frameless"><a class="oo-ui-buttonElement-button" role="button" tabindex="0" rel="nofollow" title="Close"><span class="oo-ui-iconElement-icon oo-ui-icon-close"></span><span class="oo-ui-labelElement-label oo-ui-labelElement-invisible">Close</span><span class="oo-ui-indicatorElement-indicator oo-ui-indicatorElement-noIndicator"></span></a></span></div>"`,
    );
  });
});
