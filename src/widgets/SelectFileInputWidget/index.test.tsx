import { expect, it, vi } from "vitest";
import { render } from "vitest-browser-react";
import { getRoot, tick } from "../../testing";
import { SelectFileInputWidget } from ".";

const makeFile = (name: string, type = "text/plain") =>
  new File(["content"], name, { type });

const getFileInput = (screen: { container: Element }) =>
  getRoot(screen).querySelector<HTMLInputElement>("input[type=file]")!;
const getInfoInput = (screen: { container: Element }) =>
  getRoot(screen).querySelector<HTMLInputElement>(
    ".oo-ui-selectFileInputWidget-info input",
  )!;
const getClearIndicator = (screen: { container: Element }) =>
  getRoot(screen).querySelector<HTMLElement>(".oo-ui-indicator-clear");

/** 以DataTransfer写入文件集后派发change，模拟用户在系统选择器中选定文件 */
const chooseFiles = (input: HTMLInputElement, files: File[]) => {
  const dataTransfer = new DataTransfer();
  files.forEach((file) => dataTransfer.items.add(file));
  input.files = dataTransfer.files;
  input.dispatchEvent(new Event("change", { bubbles: true }));
};

/** 以DataTransfer构造拖放事件（对齐原版onDragEnterOrOver/onDrop的入参） */
const dragFiles = (target: Element, type: "dragenter" | "drop", files: File[]) => {
  const dataTransfer = new DataTransfer();
  files.forEach((file) => dataTransfer.items.add(file));
  target.dispatchEvent(
    new DragEvent(type, { dataTransfer, bubbles: true, cancelable: true }),
  );
};

/**
 * SelectFileInputWidget（对齐原版OO.ui.SelectFileInputWidget）的浏览器渲染契约：
 * 信息框 + ActionFieldLayout排布的选择按钮（file input覆盖在按钮锚点内）、空态类、
 * 选择/清除/拖放三条入库通道与accept过滤、受控值写回input.files、buttonOnly与拖放区形态。
 */
it("结构：input/selectFileInput类链与空态类，信息框只读展示、file input覆盖在按钮锚点内", async () => {
  const screen = await render(
    <SelectFileInputWidget name="upload" accept={["image/*"]} />,
  );
  const root = getRoot(screen);
  expect(root).toHaveClass("oo-ui-widget");
  expect(root).toHaveClass("oo-ui-inputWidget");
  expect(root).toHaveClass("oo-ui-selectFileInputWidget");
  expect(root).toHaveClass("oo-ui-selectFileWidget");
  expect(root).toHaveClass("oo-ui-selectFileInputWidget-empty");

  const infoInput = getInfoInput(screen);
  expect(infoInput.getAttribute("placeholder")).toBe("No file is selected");
  // 信息框恒disabled且移出Tab序（原版借此让findFocusable取不到它）
  expect(infoInput.disabled).toBe(true);
  expect(infoInput.getAttribute("tabindex")).toBe("-1");
  // 信息框无缺省search图标（对齐原版setIcon(config.icon)，config.icon缺省null）
  expect(
    getRoot(screen).querySelector(".oo-ui-selectFileInputWidget-info .oo-ui-icon-search"),
  ).toBeNull();
  expect(getClearIndicator(screen)).toBeNull();

  const fileInput = getFileInput(screen);
  expect(fileInput.getAttribute("type")).toBe("file");
  expect(fileInput.getAttribute("name")).toBe("upload");
  expect(fileInput.getAttribute("accept")).toBe("image/*");
  expect(fileInput.getAttribute("tabindex")).toBe("-1");
  expect(fileInput.closest(".oo-ui-buttonElement-button")).toBeTruthy();

  expect(
    root.querySelector(".oo-ui-selectFileInputWidget-selectButton")!.textContent,
  ).toContain("Select a file");
  expect(root.querySelector(".oo-ui-actionFieldLayout")).toBeTruthy();
});

it("值非空：信息框显示文件名、清除指示器键盘可达，受控值经DataTransfer写回input.files", async () => {
  const onChange = vi.fn<(files: File[]) => void>();
  const screen = await render(
    <SelectFileInputWidget
      defaultValue={[makeFile("报告.pdf", "application/pdf")]}
      onChange={onChange}
    />,
  );
  const root = getRoot(screen);
  expect(root).not.toHaveClass("oo-ui-selectFileInputWidget-empty");
  expect(getInfoInput(screen).value).toBe("报告.pdf");

  const clear = getClearIndicator(screen)!;
  expect(clear).toHaveAttribute("role", "button");
  expect(clear).toHaveAttribute("tabIndex", "0");
  expect(clear).toHaveAttribute("aria-label", "Remove");

  const files = getFileInput(screen).files!;
  expect(files.length).toBe(1);
  expect(files[0]?.name).toBe("报告.pdf");
  // 初始渲染不派发变更（仅受控值写回DOM）
  expect(onChange).not.toHaveBeenCalled();
});

it("清除指示器：点击清空文件集并恢复空态类", async () => {
  const onChange = vi.fn<(files: File[]) => void>();
  const screen = await render(
    <SelectFileInputWidget defaultValue={[makeFile("报告.pdf")]} onChange={onChange} />,
  );
  await getClearIndicator(screen)!.click();
  await tick();
  expect(onChange).toHaveBeenCalledWith([]);
  expect(getRoot(screen)).toHaveClass("oo-ui-selectFileInputWidget-empty");
  expect(getInfoInput(screen).value).toBe("");
});

it("选定文件：change事件提交文件集，信息框随之更新", async () => {
  const onChange = vi.fn<(files: File[]) => void>();
  const screen = await render(<SelectFileInputWidget onChange={onChange} />);
  chooseFiles(getFileInput(screen), [makeFile("照片.png", "image/png")]);
  await tick();
  expect(onChange).toHaveBeenCalledOnce();
  expect(onChange.mock.calls[0]?.[0]?.map((file) => file.name)).toEqual(["照片.png"]);
  expect(getRoot(screen)).not.toHaveClass("oo-ui-selectFileInputWidget-empty");
  expect(getInfoInput(screen).value).toBe("照片.png");
});

it("accept过滤：类型不匹配的文件被丢弃；非多选形态只保留首个文件", async () => {
  const onChange = vi.fn<(files: File[]) => void>();
  const rejected = await render(
    <SelectFileInputWidget accept={["image/*"]} onChange={onChange} />,
  );
  chooseFiles(getFileInput(rejected), [makeFile("文档.txt", "text/plain")]);
  await tick();
  expect(onChange).not.toHaveBeenCalled();

  const screen = await render(
    <SelectFileInputWidget accept={["image/*"]} onChange={onChange} />,
  );
  chooseFiles(getFileInput(screen), [
    makeFile("a.png", "image/png"),
    makeFile("b.png", "image/png"),
  ]);
  await tick();
  expect(onChange.mock.calls[0]?.[0]?.map((file) => file.name)).toEqual(["a.png"]);
});

it("multiple：input多选、按钮文案切换，文件集保留多个", async () => {
  const onChange = vi.fn<(files: File[]) => void>();
  const screen = await render(<SelectFileInputWidget multiple onChange={onChange} />);
  const fileInput = getFileInput(screen);
  expect(fileInput.hasAttribute("multiple")).toBe(true);
  expect(
    getRoot(screen).querySelector(".oo-ui-selectFileInputWidget-selectButton")!
      .textContent,
  ).toContain("Select files");

  chooseFiles(fileInput, [
    makeFile("a.png", "image/png"),
    makeFile("b.png", "image/png"),
  ]);
  await tick();
  expect(onChange.mock.calls[0]?.[0]?.map((file) => file.name)).toEqual([
    "a.png",
    "b.png",
  ]);
});

it("禁用：根/file input/选择按钮输出禁用态，有值时也不显示清除指示器", async () => {
  const onChange = vi.fn<(files: File[]) => void>();
  const screen = await render(
    <SelectFileInputWidget
      defaultValue={[makeFile("报告.pdf")]}
      disabled
      onChange={onChange}
    />,
  );
  const root = getRoot(screen);
  expect(root).toHaveClass("oo-ui-widget-disabled");
  expect(root).toHaveAttribute("aria-disabled", "true");
  expect(getFileInput(screen).disabled).toBe(true);
  expect(getClearIndicator(screen)).toBeNull();
  expect(root.querySelector(".oo-ui-selectFileInputWidget-selectButton")).toHaveClass(
    "oo-ui-widget-disabled",
  );
});

it("buttonOnly：根元素即选择按钮，无信息框与ActionFieldLayout", async () => {
  const screen = await render(<SelectFileInputWidget buttonOnly />);
  const root = getRoot(screen);
  expect(root.tagName).toBe("SPAN");
  expect(root).toHaveClass("oo-ui-selectFileInputWidget");
  expect(root).toHaveClass("oo-ui-selectFileInputWidget-buttonOnly");
  expect(root).toHaveClass("oo-ui-selectFileInputWidget-selectButton");
  expect(root.querySelector(".oo-ui-selectFileInputWidget-info")).toBeNull();
  expect(root.querySelector(".oo-ui-actionFieldLayout")).toBeNull();
  expect(getFileInput(screen).closest(".oo-ui-buttonElement-button")).toBeTruthy();
});

it("拖放区：形态类与dropLabel文案，拖入置canDrop、落放提交文件", async () => {
  const onChange = vi.fn<(files: File[]) => void>();
  const screen = await render(
    <SelectFileInputWidget showDropTarget onChange={onChange} />,
  );
  const root = getRoot(screen);
  expect(root).toHaveClass("oo-ui-selectFileInputWidget-dropTarget");
  expect(root).toHaveClass("oo-ui-selectFileInputWidget-withThumbnail");
  expect(root.querySelector(".oo-ui-selectFileInputWidget-dropLabel")!.textContent).toBe(
    "Drop file here",
  );
  expect(root.querySelector(".oo-ui-selectFileInputWidget-info")).toBeTruthy();

  dragFiles(root, "dragenter", [makeFile("照片.png", "image/png")]);
  await tick();
  expect(root).toHaveClass("oo-ui-selectFileInputWidget-canDrop");

  dragFiles(root, "drop", [makeFile("照片.png", "image/png")]);
  await tick();
  expect(onChange.mock.calls[0]?.[0]?.map((file) => file.name)).toEqual(["照片.png"]);
  expect(root).not.toHaveClass("oo-ui-selectFileInputWidget-canDrop");
  expect(root).not.toHaveClass("oo-ui-selectFileInputWidget-empty");
});
