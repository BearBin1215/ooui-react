import { expect, it, vi } from "vitest";
import { render } from "vitest-browser-react";
import { openSettled } from "../../testing";
import { MessageDialog } from ".";

const getWin = () => document.querySelector<HTMLElement>(".oo-ui-messageDialog")!;
const getActions = () =>
  document.querySelector<HTMLElement>(".oo-ui-messageDialog-actions")!;
const getOkButton = () =>
  getActions().querySelector<HTMLElement>(".oo-ui-flaggedElement-primary")!;
const getCancelButton = () =>
  getActions().querySelector<HTMLElement>(".oo-ui-flaggedElement-safe")!;

/**
 * MessageDialog（对齐原版OO.ui.MessageDialog）的浏览器渲染契约：
 * 结构（title/message文本区+actions动作区）、ok/cancel按钮的flag变体与回调、
 * Ctrl/Cmd+Enter触发primary、cancelLabel=null隐藏取消按钮（alert形态）、
 * ready后焦点落在primary按钮、缺省按钮文案与size档位。
 */
it("结构：messageDialog类链，title/message文本区与actions动作区（horizontal布局）", async () => {
  await render(
    <MessageDialog open title="确认标题">
      确认内容
    </MessageDialog>,
  );
  await openSettled();
  expect(getWin()).toHaveClass("oo-ui-window");
  expect(getWin().querySelector(".oo-ui-messageDialog-title")?.textContent).toBe(
    "确认标题",
  );
  expect(getWin().querySelector(".oo-ui-messageDialog-message")?.textContent).toContain(
    "确认内容",
  );
  expect(getActions()).toHaveClass("oo-ui-messageDialog-actions-horizontal");
});

it("动作区：缺省文案的cancel（safe）与ok（primary）按钮，点击触发onCancel/onOk", async () => {
  const onOk = vi.fn<() => void>();
  const onCancel = vi.fn<() => void>();
  await render(
    <MessageDialog open onOk={onOk} onCancel={onCancel}>
      确认内容
    </MessageDialog>,
  );
  await openSettled();
  expect(getCancelButton().textContent).toContain("Cancel");
  expect(getOkButton().textContent).toContain("OK");

  getOkButton().dispatchEvent(new MouseEvent("click", { bubbles: true }));
  expect(onOk).toHaveBeenCalledOnce();
  expect(onCancel).not.toHaveBeenCalled();

  getCancelButton().dispatchEvent(new MouseEvent("click", { bubbles: true }));
  expect(onCancel).toHaveBeenCalledOnce();
});

it("Ctrl/Cmd+Enter触发primary action（对齐原版onDialogKeyDown）", async () => {
  const onOk = vi.fn<() => void>();
  await render(
    <MessageDialog open onOk={onOk}>
      确认内容
    </MessageDialog>,
  );
  await openSettled();
  getOkButton().dispatchEvent(
    new KeyboardEvent("keydown", {
      key: "Enter",
      ctrlKey: true,
      bubbles: true,
      cancelable: true,
    }),
  );
  expect(onOk).toHaveBeenCalledOnce();
  // 无Ctrl修饰的Enter不触发
  getOkButton().dispatchEvent(
    new KeyboardEvent("keydown", { key: "Enter", bubbles: true, cancelable: true }),
  );
  expect(onOk).toHaveBeenCalledOnce();
});

it("cancelLabel=null隐藏取消按钮（alert形态）；自定义okLabel生效", async () => {
  await render(
    <MessageDialog open okLabel="知道了" cancelLabel={null}>
      提示内容
    </MessageDialog>,
  );
  await openSettled();
  expect(getActions().querySelectorAll(".oo-ui-buttonElement-button")).toHaveLength(1);
  expect(getOkButton().textContent).toContain("知道了");
});

it("ready后焦点落在primary按钮（对齐原版getReadyProcess的聚焦）", async () => {
  await render(<MessageDialog open>确认内容</MessageDialog>);
  await openSettled();
  expect(document.activeElement).toBe(
    getOkButton().querySelector(".oo-ui-buttonElement-button"),
  );
});

it("size缺省small：manager输出size-small（浏览器默认视口414px下不触发窄屏满屏）", async () => {
  await render(<MessageDialog open>确认内容</MessageDialog>);
  await openSettled();
  const manager = getWin().parentElement!;
  expect(manager).toHaveClass("oo-ui-windowManager");
  expect(manager).toHaveClass("oo-ui-windowManager-size-small");
  expect(manager).not.toHaveClass("oo-ui-windowManager-size-full");
});
