import { expect, it, vi } from "vitest";
import { render } from "vitest-browser-react";
import { openSettled, tick } from "../../testing";
import { DIALOG_FLOAT_Z_INDEX } from "../../hooks";
import { Dropdown } from "../../widgets/Dropdown";
import { PopupButton } from "../../widgets/PopupButton";
import { Dialog } from ".";

/**
 * Dialog（对齐原版OO.ui.Dialog/Window）的浏览器渲染契约：
 * 经WindowManager portal至body、role=dialog落window根、开关动画类时序、
 * ESC关闭回调、滚动锁的body类与iOS触摸滚动兜底类、内容隔离（背景aria-hidden/inert）与
 * 弹窗内浮层的portal去向（管理器根）与层值。
 */
it("open=false：window以hidden类留在manager内，无active类", async () => {
  await render(
    <Dialog open={false}>
      <p>内容</p>
    </Dialog>,
  );
  const win = document.querySelector(".oo-ui-dialog.oo-ui-window")!;
  expect(win).toHaveClass("oo-ui-element-hidden");
  expect(win).not.toHaveClass("oo-ui-window-active");
  expect(win).toHaveAttribute("role", "dialog");
});

it("open=true：依次进入active/setup/ready动画态，manager输出尺寸类", async () => {
  await render(
    <Dialog open size="full">
      <p>内容</p>
    </Dialog>,
  );
  const win = document.querySelector(".oo-ui-dialog.oo-ui-window")!;
  await openSettled();
  expect(win).toHaveClass("oo-ui-window-active");
  expect(win).toHaveClass("oo-ui-window-setup");
  expect(win).toHaveClass("oo-ui-window-ready");
  expect(win).not.toHaveClass("oo-ui-element-hidden");
  const manager = win.parentElement!;
  expect(manager).toHaveClass("oo-ui-windowManager");
  expect(manager).toHaveClass("oo-ui-windowManager-modal");
  // size='full'恒输出size-full（浏览器默认视口414px下medium等档位会窄屏自动满屏）
  expect(manager).toHaveClass("oo-ui-windowManager-size-full");
});

it("escapable时按ESC回调onEscape；escapable=false时不回调", async () => {
  const onEscape = vi.fn<() => void>();
  const screen = await render(
    <Dialog open escapable onEscape={onEscape}>
      <p>内容</p>
    </Dialog>,
  );
  await openSettled();
  const win = document.querySelector(".oo-ui-dialog.oo-ui-window")!;
  win.dispatchEvent(
    new KeyboardEvent("keydown", { key: "Escape", bubbles: true, cancelable: true }),
  );
  expect(onEscape).toHaveBeenCalledOnce();

  await screen.rerender(
    <Dialog open escapable={false} onEscape={onEscape}>
      <p>内容</p>
    </Dialog>,
  );
  win.dispatchEvent(
    new KeyboardEvent("keydown", { key: "Escape", bubbles: true, cancelable: true }),
  );
  expect(onEscape).toHaveBeenCalledOnce();
});

it("打开期间body获得滚动锁类，卸载后移除（scrollLock登记）", async () => {
  const screen = await render(
    <Dialog open>
      <p>内容</p>
    </Dialog>,
  );
  await openSettled();
  expect(document.body).toHaveClass("oo-ui-windowManager-modal-active");
  await screen.unmount();
  expect(document.body).not.toHaveClass("oo-ui-windowManager-modal-active");
});

it("满屏弹窗ready后施加iOS触摸滚动兜底类，卸载后摘除（类落body与html两处）", async () => {
  // 能力判定目标在桌面Chromium下为0，用例内临时改作触摸设备（判定依据见scrollLock.ts）
  Object.defineProperty(navigator, "maxTouchPoints", { value: 5, configurable: true });
  try {
    const screen = await render(
      <Dialog open size="full">
        <p>内容</p>
      </Dialog>,
    );
    await openSettled();
    expect(document.documentElement).toHaveClass("oo-ui-windowManager-ios-modal-ready");
    expect(document.body).toHaveClass("oo-ui-windowManager-ios-modal-ready");

    await screen.unmount();
    expect(document.documentElement).not.toHaveClass(
      "oo-ui-windowManager-ios-modal-ready",
    );
    expect(document.body).not.toHaveClass("oo-ui-windowManager-ios-modal-ready");
  } finally {
    delete (navigator as { maxTouchPoints?: number }).maxTouchPoints;
  }
});

it("非满屏弹窗不施加iOS兜底类（收掉文档高度会让背景可见地跳动）", async () => {
  Object.defineProperty(navigator, "maxTouchPoints", { value: 5, configurable: true });
  try {
    // small档（300px）在测试视口内不会被窄屏规则抬成满屏（medium及以上会，见上一条用例注释）
    await render(
      <Dialog open size="small">
        <p>内容</p>
      </Dialog>,
    );
    await openSettled();
    expect(document.querySelector(".oo-ui-windowManager")).toHaveClass(
      "oo-ui-windowManager-size-small",
    );
    expect(document.documentElement).not.toHaveClass(
      "oo-ui-windowManager-ios-modal-ready",
    );
  } finally {
    delete (navigator as { maxTouchPoints?: number }).maxTouchPoints;
  }
});

it("ready后焦点移入弹窗内容（对齐原版ready时序的聚焦）", async () => {
  await render(
    <Dialog open>
      <p>内容</p>
    </Dialog>,
  );
  await openSettled();
  const content = document.querySelector(".oo-ui-dialog-content")!;
  expect(document.activeElement).toBe(content);
});

it("焦点陷阱：前后陷阱获得焦点时把焦点送回内容内首/末个可聚焦元素", async () => {
  await render(
    <Dialog open>
      <button type="button">一</button>
      <button type="button">二</button>
    </Dialog>,
  );
  await openSettled();
  const traps = document.querySelectorAll<HTMLElement>(".oo-ui-window-focusTrap");
  const buttons = document.querySelectorAll<HTMLElement>(".oo-ui-dialog-content button");
  // 后陷阱（Tab走出内容）→ 内容内首个；前陷阱（Shift+Tab走出）→ 内容内末个
  traps[1]!.focus();
  await tick();
  expect(document.activeElement).toBe(buttons[0]);
  traps[0]!.focus();
  await tick();
  expect(document.activeElement).toBe(buttons[1]);
});

it("关闭后把焦点归还打开前的元素（teardown后，且该节点仍在文档中）", async () => {
  function Host({ open }: { open: boolean }) {
    return (
      <>
        <button type="button" data-testid="trigger">
          触发
        </button>
        <Dialog open={open}>
          <p>内容</p>
        </Dialog>
      </>
    );
  }
  const screen = await render(<Host open={false} />);
  const trigger = screen.container.querySelector<HTMLElement>("[data-testid=trigger]")!;
  trigger.focus();

  await screen.rerender(<Host open />);
  await openSettled();
  expect(document.activeElement).not.toBe(trigger);

  // 归还发生在teardown（active移除）之后，非关闭瞬间
  await screen.rerender(<Host open={false} />);
  await expect.poll(() => document.activeElement === trigger).toBe(true);
});

it("打开期间隔离背景：管理器根路径以外的body子节点获得aria-hidden/inert，卸载后撤销", async () => {
  const background = document.createElement("div");
  document.body.appendChild(background);
  const screen = await render(
    <Dialog open>
      <p>内容</p>
    </Dialog>,
  );
  await openSettled();
  expect(background).toHaveAttribute("aria-hidden", "true");
  expect(background).toHaveAttribute("inert");
  // 管理器根在可见路径上
  expect(document.querySelector(".oo-ui-windowManager")).not.toHaveAttribute("inert");

  await screen.unmount();
  expect(background).not.toHaveAttribute("aria-hidden");
  expect(background).not.toHaveAttribute("inert");
  background.remove();
});

it("叠加打开：上层弹窗把下层弹窗的管理器根一并隔离，上层卸载后恢复", async () => {
  const lower = await render(
    <Dialog open>
      <p>下层</p>
    </Dialog>,
  );
  await openSettled();
  const lowerManager = document.querySelectorAll(".oo-ui-windowManager")[0];
  expect(lowerManager).not.toHaveAttribute("inert");

  const upper = await render(
    <Dialog open>
      <p>上层</p>
    </Dialog>,
  );
  await openSettled();
  // 下层弹窗的管理器根带 aria-hidden="false"（Dialog渲染aria-hidden={!active}），
  // 按原版的值判定须照常隔离——「有该属性就跳过」会让下层弹窗对AT仍然可达
  expect(lowerManager).toHaveAttribute("inert");
  expect(lowerManager).toHaveAttribute("aria-hidden", "true");

  await upper.unmount();
  await tick();
  expect(lowerManager).not.toHaveAttribute("inert");
  // 还原被覆盖的原值而非移除，保持与React渲染的该属性同步
  expect(lowerManager).toHaveAttribute("aria-hidden", "false");
  await lower.unmount();
});

it("关闭下层弹窗：关闭动画期间上层弹窗保持可达（重新登记不得扰动登记序）", async () => {
  const lower = await render(
    <Dialog open size="small">
      <p>下层</p>
    </Dialog>,
  );
  await openSettled();
  const upper = await render(
    <Dialog open size="small">
      <p>上层</p>
    </Dialog>,
  );
  await openSettled();
  const managers = document.querySelectorAll(".oo-ui-windowManager");
  const [lowerManager, upperManager] = [managers[0], managers[1]];
  expect(upperManager).not.toHaveAttribute("inert");

  // 下层关闭动画期间active仍为true、隔离effect会重新登记：若该路径「先注销再登记」，
  // 下层会排到登记表末位、被误判为最上层，可见的上层弹窗反而被inert+aria-hidden
  lower.rerender(
    <Dialog open={false} size="small">
      <p>下层</p>
    </Dialog>,
  );
  await expect.poll(() => lowerManager.hasAttribute("inert")).toBe(true);
  expect(upperManager).not.toHaveAttribute("inert");
  expect(upperManager).not.toHaveAttribute("aria-hidden", "true");

  await upper.unmount();
  await lower.unmount();
});

it("弹窗内菜单portal至管理器根并写入同层层值", async () => {
  await render(
    <Dialog open>
      <Dropdown options={[{ children: "甲", value: "a" }]} />
    </Dialog>,
  );
  await openSettled();
  const handle = document.querySelector<HTMLElement>(".oo-ui-dropdownWidget-handle")!;
  handle.click();
  await tick();
  const menu = document.getElementById(handle.getAttribute("aria-owns")!)!;
  const manager = document.querySelector(".oo-ui-windowManager")!;
  // 浮层是管理器根的**子节点**而非兄弟——隔离逐个标记兄弟，故不会波及弹窗内的浮层
  expect(menu.parentElement).toBe(manager);
  expect(menu).not.toHaveAttribute("inert");
  expect(menu).not.toHaveAttribute("aria-hidden");
  // 与所属弹窗同层（DOM靠后即压在弹窗之上），不再依赖主题给菜单的层值
  expect(menu.style.zIndex).toBe(String(DIALOG_FLOAT_Z_INDEX));
});

it("弹窗内的弹层（Popup）同样portal到管理器根并补上与弹窗同层的层值", async () => {
  await render(
    <Dialog open>
      <PopupButton popupContent={<p>面板</p>}>按钮</PopupButton>
    </Dialog>,
  );
  await openSettled();
  document
    .querySelector<HTMLElement>(".oo-ui-popupButtonWidget .oo-ui-buttonElement-button")!
    .click();
  const popup = document.querySelector<HTMLElement>(".oo-ui-popupButtonWidget-popup")!;
  expect(popup.parentElement).toBe(document.querySelector(".oo-ui-windowManager"));
  expect(popup).not.toHaveAttribute("inert");
  // 主题给 .oo-ui-popupWidget 只有1（低于弹窗的4）：没有本层值会被压在弹窗下面
  expect(popup.style.zIndex).toBe(String(DIALOG_FLOAT_Z_INDEX));
});
