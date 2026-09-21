import { expect, it, vi } from "vitest";
import { render } from "vitest-browser-react";
import { clickElement, openSettled, tick } from "../../testing";
import { ProcessDialog } from ".";

const getWin = () => document.querySelector<HTMLElement>(".oo-ui-processDialog")!;
const getRegion = (selector: string) => getWin().querySelector<HTMLElement>(selector)!;
const getPrimaryButton = () =>
  getRegion(".oo-ui-processDialog-actions-primary .oo-ui-buttonElement-button");

/**
 * ProcessDialog（对齐原版OO.ui.ProcessDialog）的浏览器渲染契约：
 * 导航区三段（safe左/标题中/primary右）+ foot为other动作区、动作点击与pending态、
 * 错误面板（退出/重试）、不可恢复错误的动作禁用、mode过滤、close/back的纯图标按钮。
 */
it("结构：导航区三段与foot动作区，标题经aria-labelledby关联弹窗根", async () => {
  await render(
    <ProcessDialog
      open
      title="流程标题"
      actions={[
        { action: "cancel", label: "取消", flags: "safe" },
        { action: "continue", label: "继续", flags: "primary" },
        { action: "other", label: "其他" },
      ]}
    >
      <p>内容</p>
    </ProcessDialog>,
  );
  await openSettled();
  const win = getWin();
  expect(win.querySelector(".oo-ui-processDialog-navigation")).toBeTruthy();
  expect(getRegion(".oo-ui-processDialog-actions-safe").textContent).toContain("取消");
  expect(getRegion(".oo-ui-processDialog-actions-primary").textContent).toContain("继续");
  expect(getRegion(".oo-ui-processDialog-actions-other").textContent).toContain("其他");
  const title = getRegion(".oo-ui-processDialog-title");
  expect(title.textContent).toBe("流程标题");
  expect(win.getAttribute("aria-labelledby")).toBe(title.getAttribute("id"));
});

it("动作点击：调用onAction并回传动作名，执行期间导航区叠加pending条纹", async () => {
  let release!: () => void;
  const onAction = vi.fn<(action: string) => void>(
    () =>
      new Promise<void>((resolve) => {
        release = resolve;
      }),
  );
  await render(
    <ProcessDialog
      open
      actions={[{ action: "save", label: "保存", flags: "primary" }]}
      onAction={onAction}
    >
      <p>内容</p>
    </ProcessDialog>,
  );
  await openSettled();
  clickElement(getPrimaryButton());
  await tick();
  expect(onAction).toHaveBeenCalledWith("save");
  const navigation = getRegion(".oo-ui-processDialog-navigation");
  expect(navigation.querySelector(".oo-ui-pendingElement-pending")).toBeTruthy();

  release();
  await tick();
  await tick();
  expect(navigation.querySelector(".oo-ui-pendingElement-pending")).toBeNull();
});

it("动作失败：错误面板展示消息与退出/重试按钮，退出隐藏面板", async () => {
  const onAction = vi.fn<(action: string) => Promise<void>>(() =>
    Promise.reject({ message: "保存失败" }),
  );
  await render(
    <ProcessDialog
      open
      actions={[{ action: "save", label: "保存", flags: "primary" }]}
      onAction={onAction}
    >
      <p>内容</p>
    </ProcessDialog>,
  );
  await openSettled();
  clickElement(getPrimaryButton());
  await tick();
  await tick();

  const errors = getRegion(".oo-ui-processDialog-errors");
  expect(
    errors.querySelector(".oo-ui-processDialog-errors-title")!.textContent,
  ).toContain("Something went wrong");
  expect(errors.textContent).toContain("保存失败");
  const errorActions = getRegion(".oo-ui-processDialog-errors-actions");
  expect(errorActions.textContent).toContain("Back");
  expect(errorActions.textContent).toContain("Try again");

  const backButton = [
    ...errorActions.querySelectorAll(".oo-ui-buttonElement-button"),
  ].find((button) => button.textContent!.includes("Back"))!;
  clickElement(backButton);
  await tick();
  expect(getWin().querySelector(".oo-ui-processDialog-errors")).toBeNull();
});

it("不可恢复错误：触发动作被禁用、错误面板不再提供重试", async () => {
  const onAction = vi.fn<(action: string) => Promise<void>>(() =>
    Promise.reject({ message: "致命错误", recoverable: false }),
  );
  await render(
    <ProcessDialog
      open
      actions={[{ action: "save", label: "保存", flags: "primary" }]}
      onAction={onAction}
    >
      <p>内容</p>
    </ProcessDialog>,
  );
  await openSettled();
  clickElement(getPrimaryButton());
  await tick();
  await tick();

  const errorActions = getRegion(".oo-ui-processDialog-errors-actions");
  expect(errorActions.textContent).toContain("Back");
  expect(errorActions.textContent).not.toContain("Try again");
  expect(getPrimaryButton()).toHaveAttribute("aria-disabled", "true");
});

it("mode：仅展示声明含当前mode的动作（无modes的动作一并隐藏）", async () => {
  await render(
    <ProcessDialog
      open
      mode="edit"
      actions={[
        { action: "a", label: "甲", modes: ["edit"] },
        { action: "b", label: "乙", modes: ["view"] },
        { action: "c", label: "丙" },
      ]}
    >
      <p>内容</p>
    </ProcessDialog>,
  );
  await openSettled();
  const other = getRegion(".oo-ui-processDialog-actions-other");
  expect(other.textContent).toContain("甲");
  expect(other.textContent).not.toContain("乙");
  expect(other.textContent).not.toContain("丙");
});

it("close/back标志的动作渲染为纯图标按钮（标签视觉隐藏、保留可访问名）", async () => {
  await render(
    <ProcessDialog
      open
      actions={[{ action: "close", label: "关闭", flags: ["safe", "close"] }]}
    >
      <p>内容</p>
    </ProcessDialog>,
  );
  await openSettled();
  const safe = getRegion(".oo-ui-processDialog-actions-safe");
  expect(safe.querySelector(".oo-ui-iconElement-icon")).toHaveClass("oo-ui-icon-close");
  expect(safe.querySelector(".oo-ui-labelElement-label")).toHaveClass(
    "oo-ui-labelElement-invisible",
  );
});
