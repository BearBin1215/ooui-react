import { useRef } from "react";
import { expect, it, vi } from "vitest";
import { render } from "vitest-browser-react";
import { useDismissablePopover } from "./dismiss";

function Harness({
  enabled = true,
  dismissOnClick,
  onClose,
  onEscape,
}: {
  enabled?: boolean;
  dismissOnClick?: boolean;
  onClose: () => void;
  onEscape?: () => void;
}) {
  const insideRef = useRef<HTMLDivElement>(null);
  useDismissablePopover({
    enabled,
    onClose,
    onEscape,
    dismissOnClick,
    ignore: [insideRef],
  });
  return (
    <div ref={insideRef} data-testid="inside">
      内部
    </div>
  );
}

const getInside = (screen: { container: Element }) =>
  screen.container.querySelector<HTMLElement>('[data-testid="inside"]')!;
const fire = (target: Element, type: "mousedown" | "click") =>
  target.dispatchEvent(new MouseEvent(type, { bubbles: true, cancelable: true }));
const pressEscape = (target: Element) => {
  const event = new KeyboardEvent("keydown", {
    key: "Escape",
    bubbles: true,
    cancelable: true,
  });
  target.dispatchEvent(event);
  return event;
};

/**
 * dismiss.ts的useDismissablePopover：下列用例逐条覆盖其可观察契约
 * （挂监听条件、mousedown/click去重、ignore与滚动条、Escape捕获阶段吞键）
 */
it("enabled=false时不挂监听：外点与Escape都不请求关闭", async () => {
  const onClose = vi.fn<() => void>();
  const screen = await render(<Harness enabled={false} onClose={onClose} />);
  fire(document.body, "mousedown");
  pressEscape(getInside(screen));
  expect(onClose).not.toHaveBeenCalled();
});

it("缺省只监听mousedown（菜单类浮层对齐原版autoHide）：click不触发关闭", async () => {
  const onClose = vi.fn<() => void>();
  await render(<Harness onClose={onClose} />);
  fire(document.body, "click");
  expect(onClose).not.toHaveBeenCalled();
  fire(document.body, "mousedown");
  expect(onClose).toHaveBeenCalledOnce();
});

it("dismissOnClick=true：同一次手势的mousedown与click以先触发者为准，只请求一次关闭", async () => {
  const onClose = vi.fn<() => void>();
  await render(<Harness dismissOnClick onClose={onClose} />);
  fire(document.body, "mousedown");
  fire(document.body, "click");
  expect(onClose).toHaveBeenCalledOnce();

  // 下一次手势以新的mousedown重置去重标记，click照旧不再重复
  fire(document.body, "mousedown");
  fire(document.body, "click");
  expect(onClose).toHaveBeenCalledTimes(2);
});

it("ignore目标内部的按下不关闭；滚动条（documentElement）上的按下不关闭", async () => {
  const onClose = vi.fn<() => void>();
  const screen = await render(<Harness onClose={onClose} />);
  fire(getInside(screen), "mousedown");
  expect(onClose).not.toHaveBeenCalled();

  fire(document.documentElement, "mousedown");
  expect(onClose).not.toHaveBeenCalled();

  fire(document.body, "mousedown");
  expect(onClose).toHaveBeenCalledOnce();
});

it("Escape在捕获阶段处理：请求关闭并附加onEscape，阻止默认且不再冒泡", async () => {
  const onClose = vi.fn<() => void>();
  const onEscape = vi.fn<() => void>();
  const bubbleListener = vi.fn<() => void>();
  const screen = await render(<Harness onClose={onClose} onEscape={onEscape} />);
  document.addEventListener("keydown", bubbleListener);
  try {
    const event = pressEscape(getInside(screen));
    expect(onClose).toHaveBeenCalledOnce();
    expect(onEscape).toHaveBeenCalledOnce();
    expect(event.defaultPrevented).toBe(true);
    // 捕获层已stopPropagation：冒泡阶段（含React根容器上的Dialog onKeyDown）收不到
    expect(bubbleListener).not.toHaveBeenCalled();
  } finally {
    document.removeEventListener("keydown", bubbleListener);
  }
});

it("已被defaultPrevented的Escape不处理", async () => {
  const onClose = vi.fn<() => void>();
  const onEscape = vi.fn<() => void>();
  const screen = await render(<Harness onClose={onClose} onEscape={onEscape} />);
  const event = new KeyboardEvent("keydown", {
    key: "Escape",
    bubbles: true,
    cancelable: true,
  });
  event.preventDefault();
  getInside(screen).dispatchEvent(event);
  expect(onClose).not.toHaveBeenCalled();
  expect(onEscape).not.toHaveBeenCalled();
});

it("enabled翻转：打开后挂监听、关闭后撤下（不吞外层浮层的Escape）", async () => {
  const onClose = vi.fn<() => void>();
  const screen = await render(<Harness enabled={false} onClose={onClose} />);
  await screen.rerender(<Harness enabled onClose={onClose} />);
  pressEscape(getInside(screen));
  expect(onClose).toHaveBeenCalledOnce();

  await screen.rerender(<Harness enabled={false} onClose={onClose} />);
  pressEscape(getInside(screen));
  expect(onClose).toHaveBeenCalledOnce();
});
