import { expect, it, vi } from "vitest";
import { render } from "vitest-browser-react";
import { OOUIProvider } from "../config";
import { alert, confirm, prompt } from "./statics";
import { enqueueDialog } from "./imperative";
import { clickElement, openSettled, typeValue } from "../testing";

const getDialog = () => document.querySelector<HTMLElement>(".oo-ui-messageDialog")!;
const getActions = () =>
  document.querySelector<HTMLElement>(".oo-ui-messageDialog-actions")!;
const getPrimaryButton = () =>
  getActions().querySelector<HTMLElement>(".oo-ui-flaggedElement-primary")!;
const getSafeButton = () =>
  getActions().querySelector<HTMLElement>(".oo-ui-flaggedElement-safe")!;

/**
 * 命令式弹窗API（对齐原版OO.ui.confirm/alert/prompt）的浏览器契约：
 * 确定/取消/ESC的兑现值、prompt的输入框初值与回车提交。关闭动画结束（closeDuration+裕量）后
 * 卸载并兑现，故断言直接await返回的Promise。
 * 另锁in-tree宿主：弹窗经`OOUIProvider`渲染的宿主挂在其配置子树内，故自动继承该子树的
 * 配置与context（文案等）；未包`OOUIProvider`时懒挂body、按缺省值渲染；Provider卸载后
 * 未结弹窗由body兜底host接管（开合态与兑现守卫随队列条目走，接管后照常交互与兑现）。
 */
it("confirm：确定兑现true、取消兑现false（含关闭后卸载）", async () => {
  const okPromise = confirm("确定要删除吗？", { title: "删除" });
  await openSettled();
  expect(getDialog().querySelector(".oo-ui-messageDialog-title")!.textContent).toBe(
    "删除",
  );
  expect(
    getDialog().querySelector(".oo-ui-messageDialog-message")!.textContent,
  ).toContain("确定要删除吗？");
  clickElement(getPrimaryButton());
  await expect(okPromise).resolves.toBe(true);
  expect(document.querySelector(".oo-ui-messageDialog")).toBeNull();

  const cancelPromise = confirm("再来一次");
  await openSettled();
  clickElement(getSafeButton());
  await expect(cancelPromise).resolves.toBe(false);
});

it("confirm：ESC兑现false（escapable）", async () => {
  const promise = confirm("内容");
  await openSettled();
  getDialog().dispatchEvent(
    new KeyboardEvent("keydown", { key: "Escape", bubbles: true, cancelable: true }),
  );
  await expect(promise).resolves.toBe(false);
});

it("alert：cancelLabel=null故仅一个动作按钮，关闭兑现", async () => {
  const promise = alert("提示内容", { okLabel: "知道了" });
  await openSettled();
  expect(getActions().querySelectorAll(".oo-ui-buttonElement-button")).toHaveLength(1);
  expect(getPrimaryButton().textContent).toContain("知道了");
  clickElement(getPrimaryButton());
  await expect(promise).resolves.toBeUndefined();
});

it("prompt：输入框ready后自动聚焦、value仅作初始值，回车兑现当前输入", async () => {
  const promise = prompt("名称", { textInput: { value: "旧名称" } });
  await openSettled();
  const input = document.querySelector<HTMLInputElement>(".oo-ui-fieldLayout input")!;
  expect(document.activeElement).toBe(input);
  expect(input.value).toBe("旧名称");

  await typeValue(input, "新名称");
  input.dispatchEvent(
    new KeyboardEvent("keydown", { key: "Enter", bubbles: true, cancelable: true }),
  );
  await expect(promise).resolves.toBe("新名称");
});

it("prompt：取消兑现null；调用方onKeyDown可preventDefault否决回车提交", async () => {
  const cancelPromise = prompt("名称");
  await openSettled();
  clickElement(getSafeButton());
  await expect(cancelPromise).resolves.toBeNull();

  const onKeyDown = vi.fn<(event: { preventDefault: () => void }) => void>((event) =>
    event.preventDefault(),
  );
  const vetoPromise = prompt("名称", { textInput: { onKeyDown } });
  await openSettled();
  const input = document.querySelector<HTMLInputElement>(".oo-ui-fieldLayout input")!;
  await typeValue(input, "不会提交");
  input.dispatchEvent(
    new KeyboardEvent("keydown", { key: "Enter", bubbles: true, cancelable: true }),
  );
  expect(onKeyDown).toHaveBeenCalledOnce();
  // 未关闭：确定后兑现的是被否决那次的输入值
  clickElement(getPrimaryButton());
  await expect(vetoPromise).resolves.toBe("不会提交");
});

it("未包Provider：弹窗按缺省值渲染（英文文案）", async () => {
  const promise = confirm("内容");
  await openSettled();
  expect(getPrimaryButton().textContent).toContain("OK");
  clickElement(getPrimaryButton());
  await expect(promise).resolves.toBe(true);
});

it("包了Provider：弹窗自动继承所在子树的配置（如文案）", async () => {
  await render(
    <OOUIProvider messages={{ "ooui-dialog-message-accept": "知道了" }}>
      宿主
    </OOUIProvider>,
  );

  const promise = confirm("内容");
  await openSettled();
  // 弹窗DOM虽portal至body，其React树挂在宿主host（本Provider子树内），故取到该子树的文案
  expect(getPrimaryButton().textContent).toContain("知道了");
  clickElement(getPrimaryButton());
  await expect(promise).resolves.toBe(true);
});

it("嵌套Provider：命令式弹窗恒由最外层宿主渲染（用最外层配置）", async () => {
  await render(
    <OOUIProvider messages={{ "ooui-dialog-message-accept": "外层" }}>
      <OOUIProvider messages={{ "ooui-dialog-message-accept": "内层" }}>
        宿主
      </OOUIProvider>
    </OOUIProvider>,
  );

  const promise = confirm("内容");
  await openSettled();
  // 命令式调用无位置信息，恒映射到最外层Provider的配置（见dialogs/imperative.tsx primaryToken）
  expect(getPrimaryButton().textContent).toContain("外层");
  clickElement(getPrimaryButton());
  await expect(promise).resolves.toBe(true);
});

it("Provider卸载时弹窗未结：body兜底host接管，弹窗仍可交互并兑现", async () => {
  const screen = await render(<OOUIProvider>宿主</OOUIProvider>);
  const promise = confirm("内容");
  await openSettled();
  await screen.unmount();
  // 弹窗转由兜底host重挂载（入场时序重走），照常可交互
  await openSettled();
  expect(getDialog()).not.toBeNull();
  clickElement(getPrimaryButton());
  await expect(promise).resolves.toBe(true);
  expect(document.querySelector(".oo-ui-messageDialog")).toBeNull();
});

it("Provider卸载时弹窗关闭中：接管重挂载不回弹、承诺照常兑现", async () => {
  const screen = await render(<OOUIProvider>宿主</OOUIProvider>);
  const promise = confirm("内容");
  await openSettled();
  clickElement(getPrimaryButton());
  // 关闭动画期间卸载Provider：重挂载维持关闭态、不回弹
  await screen.unmount();
  await expect(promise).resolves.toBe(true);
});

it("同级并存同深度Provider：先登记者胜出（无嵌套关系可依据）", async () => {
  await render(
    <>
      <OOUIProvider messages={{ "ooui-dialog-message-accept": "甲" }}>甲</OOUIProvider>
      <OOUIProvider messages={{ "ooui-dialog-message-accept": "乙" }}>乙</OOUIProvider>
    </>,
  );

  const promise = confirm("内容");
  await openSettled();
  // 同深度取先登记者（见dialogs/imperative.tsx primaryToken）
  expect(getPrimaryButton().textContent).toContain("甲");
  clickElement(getPrimaryButton());
  await expect(promise).resolves.toBe(true);
});

it("渲染期崩溃：经错误边界落入crashEntry，reject而非永久挂起", async () => {
  const Boom = () => {
    throw new Error("渲染崩溃");
  };
  // 直经enqueueDialog入队一个渲染即抛错的弹窗（confirm/alert/prompt本身不抛错）
  const promise = enqueueDialog(() => <Boom />);
  await expect(promise).rejects.toThrow("渲染崩溃");
});

it("重复调用层叠显示：两个弹窗各自独立挂载并分别兑现（原版单窗口队列会静默失效）", async () => {
  const first = confirm("第一层");
  await openSettled();
  const second = confirm("第二层");
  await openSettled();
  const dialogs = [...document.querySelectorAll<HTMLElement>(".oo-ui-messageDialog")];
  expect(dialogs).toHaveLength(2);
  const clickPrimary = (dialog: HTMLElement) =>
    clickElement(dialog.querySelector<HTMLElement>(".oo-ui-flaggedElement-primary")!);

  // 后挂载者在后：先兑现第二层，第一层不受影响
  clickPrimary(dialogs[1]!);
  await expect(second).resolves.toBe(true);
  expect(document.querySelectorAll(".oo-ui-messageDialog")).toHaveLength(1);

  clickPrimary(dialogs[0]!);
  await expect(first).resolves.toBe(true);
  expect(document.querySelector(".oo-ui-messageDialog")).toBeNull();
});
