import { expect, it, vi } from "vitest";
import { render } from "vitest-browser-react";
import { getRoot, tick } from "../../testing";
import { CopyTextLayout } from ".";

const getInput = (screen: { container: Element }) =>
  getRoot(screen).querySelector<HTMLInputElement>("input")!;
const getCopyButton = (screen: { container: Element }) =>
  getRoot(screen).querySelector<HTMLElement>(".oo-ui-buttonElement-button")!;

/**
 * 替换navigator.clipboard以固定复制通道的成败（真实剪贴板结果取决于浏览器权限，
 * 不可作为断言依据）；恢复即删除自有属性，落回Navigator原型上的getter
 */
const stubClipboard = (writeText: (text: string) => Promise<void>) => {
  Object.defineProperty(navigator, "clipboard", {
    value: { writeText },
    configurable: true,
  });
};
const restoreClipboard = () => {
  delete (navigator as unknown as { clipboard?: unknown }).clipboard;
};

/**
 * CopyTextLayout（对齐原版OO.ui.CopyTextLayout）的浏览器渲染契约：
 * FieldLayout上的输入区+按钮结构、只读文本与copyText初值、聚焦全选、
 * 复制通道（navigator.clipboard→execCommand回落）与结果上报、多行形态的包装类改写。
 */
it("结构：fieldLayout/actionFieldLayout/copyTextLayout类链，只读文本框 + 复制按钮", async () => {
  const screen = await render(<CopyTextLayout label="链接" copyText="待复制文本" />);
  const root = getRoot(screen);
  expect(root).toHaveClass("oo-ui-fieldLayout");
  expect(root).toHaveClass("oo-ui-actionFieldLayout");
  expect(root).toHaveClass("oo-ui-copyTextLayout");
  expect(root.querySelector(".oo-ui-actionFieldLayout-input")).toBeTruthy();
  expect(root.querySelector("label")!.textContent).toBe("链接");

  const input = getInput(screen);
  expect(input.value).toBe("待复制文本");
  expect(input.readOnly).toBe(true);

  const button = root.querySelector(".oo-ui-actionFieldLayout-button")!;
  expect(button.querySelector(".oo-ui-buttonElement-button")!.textContent).toContain(
    "Copy",
  );
  expect(button.querySelector(".oo-ui-iconElement-icon")).toHaveClass("oo-ui-icon-copy");
});

it("聚焦文本框即全选文本（对齐原版onInputFocus），便于直接Ctrl+C", async () => {
  const screen = await render(<CopyTextLayout copyText="待复制文本" />);
  const input = getInput(screen);
  input.focus();
  await tick();
  expect(input.selectionStart).toBe(0);
  expect(input.selectionEnd).toBe("待复制文本".length);
});

it("点击复制按钮：全选后写入剪贴板并上报onCopyResult(true)", async () => {
  const writeText = vi.fn<(text: string) => Promise<void>>(() => Promise.resolve());
  stubClipboard(writeText);
  try {
    const onCopyResult = vi.fn<(copied: boolean) => void>();
    const screen = await render(
      <CopyTextLayout copyText="待复制文本" onCopyResult={onCopyResult} />,
    );
    await getCopyButton(screen).click();
    await tick();
    expect(writeText).toHaveBeenCalledWith("待复制文本");
    expect(onCopyResult).toHaveBeenCalledWith(true);
  } finally {
    restoreClipboard();
  }
});

it("剪贴板被拒时回落到execCommand；两者皆失败则上报onCopyResult(false)", async () => {
  stubClipboard(() => Promise.reject(new Error("denied")));
  const execCommand = vi.spyOn(document, "execCommand").mockReturnValue(false);
  try {
    const onCopyResult = vi.fn<(copied: boolean) => void>();
    const screen = await render(
      <CopyTextLayout copyText="待复制文本" onCopyResult={onCopyResult} />,
    );
    await getCopyButton(screen).click();
    await tick();
    expect(execCommand).toHaveBeenCalledWith("copy");
    expect(onCopyResult).toHaveBeenCalledWith(false);
  } finally {
    execCommand.mockRestore();
    restoreClipboard();
  }
});

it("multiline：换用textarea并改写包装类（剥去输入区连接类、按钮区改multiline-button）", async () => {
  const screen = await render(<CopyTextLayout copyText="多行文本" multiline />);
  const root = getRoot(screen);
  const textarea = root.querySelector<HTMLTextAreaElement>("textarea")!;
  expect(textarea.value).toBe("多行文本");
  expect(textarea.readOnly).toBe(true);
  expect(root.querySelector(".oo-ui-actionFieldLayout-input")).toBeNull();
  expect(root.querySelector(".oo-ui-copyTextLayout-multiline-button")).toBeTruthy();
});

it("textInputProps：readOnly=false可编辑、value受控优先于copyText", async () => {
  const screen = await render(
    <CopyTextLayout
      copyText="初始"
      textInputProps={{ readOnly: false, value: "受控值" }}
    />,
  );
  const input = getInput(screen);
  expect(input.readOnly).toBe(false);
  expect(input.value).toBe("受控值");
});
