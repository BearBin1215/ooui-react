import { describe, expect, it, vi } from "vitest";
import { render } from "vitest-browser-react";
import { getRoot } from "../../testing";
import { Button } from ".";

/**
 * Button（对齐原版OO.ui.ButtonWidget/ButtonElement）的浏览器渲染契约：
 * span>a[role=button]双层结构与类链落点、aria-disabled/tabIndex双落点、
 * flags与反色变体、title兜底、禁用拦截。
 */
it("常规按钮：根span输出widget/button类链，锚点a[role=button]承载label", async () => {
  const screen = await render(<Button>确定</Button>);
  const root = getRoot(screen);
  expect(root.tagName).toBe("SPAN");
  expect(root).toHaveClass("oo-ui-widget");
  expect(root).toHaveClass("oo-ui-widget-enabled");
  expect(root).toHaveClass("oo-ui-buttonWidget");
  expect(root).toHaveClass("oo-ui-buttonElement-framed");

  const anchor = root.firstElementChild!;
  expect(anchor.tagName).toBe("A");
  expect(anchor).toHaveClass("oo-ui-buttonElement-button");
  expect(anchor).toHaveAttribute("role", "button");
  expect(anchor).toHaveAttribute("tabIndex", "0");
  expect(anchor.querySelector(".oo-ui-labelElement-label")?.textContent).toBe("确定");
});

it("disabled：aria-disabled同时落根span与锚点（ChromeVox/NVDA不继承aria-disabled），tabIndex=-1且href移除", async () => {
  const screen = await render(
    <Button disabled href="https://example.com">
      链接
    </Button>,
  );
  const root = getRoot(screen);
  expect(root).toHaveClass("oo-ui-widget-disabled");
  expect(root).toHaveAttribute("aria-disabled", "true");
  const anchor = root.firstElementChild!;
  expect(anchor).toHaveAttribute("aria-disabled", "true");
  expect(anchor).toHaveAttribute("tabIndex", "-1");
  expect(anchor).not.toHaveAttribute("href");
});

it("href按钮：href/target/rel落锚点（rel缺省nofollow）", async () => {
  const screen = await render(
    <Button href="https://example.com" target="_blank">
      外链
    </Button>,
  );
  const anchor = getRoot(screen).firstElementChild!;
  expect(anchor).toHaveAttribute("href", "https://example.com");
  expect(anchor).toHaveAttribute("target", "_blank");
  expect(anchor).toHaveAttribute("rel", "nofollow");
});

it("flags输出flagged类，framed+primary时图标反色（对齐wikimediaui按钮着色规则）", async () => {
  const screen = await render(
    <Button icon="check" flags={["primary", "destructive"]}>
      操作
    </Button>,
  );
  const root = getRoot(screen);
  expect(root).toHaveClass("oo-ui-flaggedElement-primary");
  expect(root).toHaveClass("oo-ui-flaggedElement-destructive");
  const icon = root.querySelector(".oo-ui-iconElement-icon")!;
  expect(icon).toHaveClass("oo-ui-icon-check");
  // 带边框按钮primary整体反色：图标变体为invert而非按flag着色
  expect(icon).toHaveClass("oo-ui-image-invert");
  expect(icon).not.toHaveClass("oo-ui-image-primary");
});

it("active与pressed输出对应buttonElement态类", async () => {
  const screen = await render(
    <Button active pressed>
      切换
    </Button>,
  );
  const root = getRoot(screen);
  expect(root).toHaveClass("oo-ui-buttonElement-active");
  expect(root).toHaveClass("oo-ui-buttonElement-pressed");
});

it("invisibleLabel时title以label兜底落锚点（对齐原版TitledElement的fallback）", async () => {
  const screen = await render(<Button invisibleLabel>删除</Button>);
  const anchor = getRoot(screen).firstElementChild!;
  expect(anchor).toHaveAttribute("title", "删除");
});

it("禁用时点击不触发onClick（aria-disabled元素不参与playwright可动性判定，经原生click事件验证守卫）", async () => {
  const onClick = vi.fn<() => void>();
  const screen = await render(
    <Button disabled onClick={onClick}>
      不可点
    </Button>,
  );
  const anchor = getRoot(screen).firstElementChild!;
  anchor.dispatchEvent(new MouseEvent("click", { bubbles: true, cancelable: true }));
  expect(onClick).not.toHaveBeenCalled();
});

it("启用时点击触发onClick", async () => {
  const onClick = vi.fn<() => void>();
  const screen = await render(<Button onClick={onClick}>可点</Button>);
  await screen.getByRole("button").click();
  expect(onClick).toHaveBeenCalledOnce();
});

describe("HTML快照", () => {
  // 快照锁结构：差异须有意识地更新，勿靠 -u 反推（靶心为原版DOM，见comparison-guide「渲染契约的靶心」）
  it("图标+标签+指示器", async () => {
    const screen = await render(
      <Button icon="check" indicator="down">
        确定
      </Button>,
    );
    expect(screen.container.innerHTML).toMatchInlineSnapshot(
      `"<span class="oo-ui-widget oo-ui-widget-enabled oo-ui-iconElement oo-ui-indicatorElement oo-ui-labelElement oo-ui-buttonWidget oo-ui-buttonElement oo-ui-buttonElement-framed"><a class="oo-ui-buttonElement-button" role="button" tabindex="0" rel="nofollow"><span class="oo-ui-iconElement-icon oo-ui-icon-check"></span><span class="oo-ui-labelElement-label">确定</span><span class="oo-ui-indicatorElement-indicator oo-ui-indicator-down"></span></a></span>"`,
    );
  });

  it("flags+禁用", async () => {
    const screen = await render(
      <Button flags={["primary", "destructive"]} disabled>
        禁用
      </Button>,
    );
    expect(screen.container.innerHTML).toMatchInlineSnapshot(
      `"<span class="oo-ui-widget oo-ui-widget-disabled oo-ui-labelElement oo-ui-buttonWidget oo-ui-buttonElement oo-ui-buttonElement-framed oo-ui-flaggedElement-primary oo-ui-flaggedElement-destructive" aria-disabled="true"><a class="oo-ui-buttonElement-button" role="button" tabindex="-1" aria-disabled="true" rel="nofollow"><span class="oo-ui-iconElement-icon oo-ui-iconElement-noIcon oo-ui-image-invert"></span><span class="oo-ui-labelElement-label">禁用</span><span class="oo-ui-indicatorElement-indicator oo-ui-indicatorElement-noIndicator oo-ui-image-invert"></span></a></span>"`,
    );
  });
});
