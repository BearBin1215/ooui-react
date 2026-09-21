import { expect, it, vi } from "vitest";
import { render } from "vitest-browser-react";
import { clickElement, getRoot, pressKey, tick } from "../../testing";
import { MenuTagMultiselect } from "../MenuTagMultiselect";
import { TagMultiselect } from ".";

const OPTIONS = [
  { value: "apple", label: "苹果" },
  { value: "banana", label: "香蕉" },
  { value: "cherry", label: "樱桃" },
] as const;

/**
 * TagMultiselect（对齐原版OO.ui.TagMultiselectWidget）的浏览器渲染契约：
 * Enter提交输入文本为标签、Backspace移除末尾标签并回填、受控值渲染、
 * 白名单外的invalid标志、onChange派发、输入文本端点按←→转向标签导航（方向按元素有效
 * 方向翻转）、disabled下发（根/输入框/标签项）与禁用下的按键与移除守卫。
 */
it("Enter把输入文本提交为标签并清空输入框", async () => {
  const onChange = vi.fn<(value: (string | number)[]) => void>();
  const screen = await render(<TagMultiselect onChange={onChange} allowArbitrary />);
  const input = screen.getByRole("textbox");
  await input.fill("甲");
  const inputEl = screen.container.querySelector<HTMLInputElement>("input")!;
  inputEl.dispatchEvent(
    new KeyboardEvent("keydown", { key: "Enter", bubbles: true, cancelable: true }),
  );
  await tick();
  const tags = screen.container.querySelectorAll(".oo-ui-tagItemWidget");
  expect(tags).toHaveLength(1);
  expect(tags[0].textContent).toContain("甲");
  expect(inputEl.value).toBe("");
  expect(onChange.mock.calls[0]?.[0]).toEqual(["甲"]);
});

it("空输入按Backspace移除末尾标签并回填其文本（对齐原版doInputBackspace）", async () => {
  const screen = await render(
    <TagMultiselect defaultValue={["x", "y"]} allowArbitrary />,
  );
  const inputEl = screen.container.querySelector<HTMLInputElement>("input")!;
  expect(screen.container.querySelectorAll(".oo-ui-tagItemWidget")).toHaveLength(2);
  inputEl.dispatchEvent(
    new KeyboardEvent("keydown", { key: "Backspace", bubbles: true, cancelable: true }),
  );
  await tick();
  expect(screen.container.querySelectorAll(".oo-ui-tagItemWidget")).toHaveLength(1);
  expect(inputEl.value).toBe("y");
});

it("allowReordering=false：白名单序插入后点击删除按值定位（下标漂移回归）", async () => {
  const onChange = vi.fn<(value: (string | number)[]) => void>();
  const screen = await render(
    <TagMultiselect
      defaultValue={["a", "c"]}
      allowedValues={["a", "b", "c"]}
      allowReordering={false}
      onChange={onChange}
    />,
  );
  const input = screen.getByRole("textbox");
  await input.fill("b");
  // 点击标签c回填编辑：输入文本b先按白名单序插入到a与c之间，删除按值+序数定位c
  const tags = screen.container.querySelectorAll(".oo-ui-tagItemWidget");
  clickElement(tags[1]);
  await tick();
  // 按点击时下标删除会误删插入的b；正确结果为被点项c被移除、b保留
  expect(onChange.mock.calls[0]?.[0]).toEqual(["a", "b"]);
  const remain = screen.container.querySelectorAll(".oo-ui-tagItemWidget");
  expect(remain).toHaveLength(2);
  expect(remain[0].textContent).toContain("a");
  expect(remain[1].textContent).toContain("b");
  // 被点标签的文本回填输入框
  expect(screen.container.querySelector<HTMLInputElement>("input")!.value).toBe("c");
});

it("受控value渲染标签；白名单外的值以invalid标志呈现", async () => {
  const screen = await render(
    <TagMultiselect value={["out"]} allowedValues={["in"]} allowDisplayInvalidTags />,
  );
  const tag = screen.container.querySelector(".oo-ui-tagItemWidget")!;
  expect(tag.textContent).toContain("out");
  expect(tag).toHaveClass("oo-ui-flaggedElement-invalid");
  // 整体随之标记非法：根元素输出invalid标志类
  expect(getRoot(screen)).toHaveClass("oo-ui-flaggedElement-invalid");
});

/**
 * MenuTagMultiselect（对齐原版OO.ui.MenuTagMultiselectWidget）的菜单交互契约：
 * 输入过滤、Enter对高亮项按已选与否切换移除或提交新增、失焦提交输入文本（忽略高亮项）。
 */
it("菜单模式：输入即过滤候选菜单，Enter提交非标签的高亮项", async () => {
  const onChange = vi.fn<(value: (string | number)[]) => void>();
  const screen = await render(
    <MenuTagMultiselect options={[...OPTIONS]} onChange={onChange} />,
  );
  const input = screen.getByRole("textbox");
  await input.fill("香");
  // 菜单portal至body：过滤后仅剩香蕉，且过滤时自动高亮首个匹配项（highlightOnFilter）
  const menu = document.querySelector(
    ".oo-ui-menuSelectWidget:not(.oo-ui-element-hidden)",
  )!;
  const options = menu.querySelectorAll(
    ".oo-ui-optionWidget:not(.oo-ui-menuSectionOptionWidget)",
  );
  expect(options).toHaveLength(1);
  expect(options[0].textContent).toContain("香蕉");
  expect(options[0]).toHaveClass("oo-ui-optionWidget-highlighted");
  const inputEl = screen.container.querySelector<HTMLInputElement>("input")!;
  inputEl.dispatchEvent(
    new KeyboardEvent("keydown", { key: "Enter", bubbles: true, cancelable: true }),
  );
  await tick();
  const tag = screen.container.querySelector(".oo-ui-tagItemWidget")!;
  expect(tag.textContent).toContain("香蕉");
  expect(onChange.mock.calls[0]?.[0]).toEqual(["banana"]);
});

it("菜单模式：高亮项已是标签时Enter移除该标签（点击标签高亮后的切换语义）", async () => {
  const onChange = vi.fn<(value: (string | number)[]) => void>();
  const screen = await render(
    <MenuTagMultiselect
      options={[...OPTIONS]}
      defaultValue={["banana"]}
      onChange={onChange}
    />,
  );
  // 点击标签：菜单模式在菜单中高亮对应项（onTagSelect），该项呈选中态
  const tag = screen.container.querySelector(".oo-ui-tagItemWidget")!;
  clickElement(tag);
  await tick();
  const menu = document.querySelector(
    ".oo-ui-menuSelectWidget:not(.oo-ui-element-hidden)",
  )!;
  const highlighted = menu.querySelector(".oo-ui-optionWidget-highlighted")!;
  expect(highlighted.textContent).toContain("香蕉");
  // Enter作用于已选定的导航起点：走切换移除而非新增（对齐原版chooseItem的多选切换）
  const inputEl = screen.container.querySelector<HTMLInputElement>("input")!;
  pressKey(inputEl, "Enter");
  await tick();
  expect(screen.container.querySelectorAll(".oo-ui-tagItemWidget")).toHaveLength(0);
  expect(onChange.mock.calls[0]?.[0]).toEqual([]);
  expect(inputEl.value).toBe("");
});

it("菜单模式：键入已有标签的值后Enter移除该标签（过滤高亮落在已选标签项）", async () => {
  const onChange = vi.fn<(value: (string | number)[]) => void>();
  const screen = await render(
    <MenuTagMultiselect
      options={[...OPTIONS]}
      defaultValue={["banana"]}
      onChange={onChange}
    />,
  );
  const input = screen.getByRole("textbox");
  await input.fill("香");
  // 过滤后高亮香蕉且该项呈选中态（已是标签）
  const inputEl = screen.container.querySelector<HTMLInputElement>("input")!;
  pressKey(inputEl, "Enter");
  await tick();
  expect(screen.container.querySelectorAll(".oo-ui-tagItemWidget")).toHaveLength(0);
  expect(onChange.mock.calls[0]?.[0]).toEqual([]);
});

it("菜单模式：聚焦自动高亮的首个可选项不是标签时Enter仍新增", async () => {
  const onChange = vi.fn<(value: (string | number)[]) => void>();
  const screen = await render(
    <MenuTagMultiselect
      options={[...OPTIONS]}
      defaultValue={["banana"]}
      onChange={onChange}
    />,
  );
  const inputEl = screen.container.querySelector<HTMLInputElement>("input")!;
  inputEl.focus();
  await tick();
  // 聚焦开启菜单自动高亮首个可选项（apple，非标签）：Enter走提交新增路径
  pressKey(inputEl, "Enter");
  await tick();
  expect(onChange.mock.calls[0]?.[0]).toEqual(["banana", "apple"]);
});

it("菜单模式：菜单关闭时Enter只走输入文本提交路径（不触发切换移除）", async () => {
  const onChange = vi.fn<(value: (string | number)[]) => void>();
  const screen = await render(
    <MenuTagMultiselect
      options={[...OPTIONS]}
      defaultValue={["banana"]}
      onChange={onChange}
    />,
  );
  const input = screen.getByRole("textbox");
  // 键入已有标签的值后失焦：提交被判重拒绝、输入文本残留、菜单收起
  await input.fill("香蕉");
  const inputEl = screen.container.querySelector<HTMLInputElement>("input")!;
  inputEl.blur();
  await tick();
  expect(inputEl.value).toBe("香蕉");
  // 菜单已关闭：Enter不经切换分支，仅提交输入文本（判重拒绝，标签不变）
  pressKey(inputEl, "Enter");
  await tick();
  expect(screen.container.querySelectorAll(".oo-ui-tagItemWidget")).toHaveLength(1);
  expect(onChange).not.toHaveBeenCalled();
});

it("菜单模式：富内容label显示，labelText承载过滤键与选中回填", async () => {
  const onChange = vi.fn<(value: (string | number)[]) => void>();
  const screen = await render(
    <MenuTagMultiselect
      options={[
        { value: "apple", label: <b>苹果</b>, labelText: "apple" },
        { value: "banana", label: <b>香蕉</b>, labelText: "banana" },
      ]}
      onChange={onChange}
    />,
  );
  const input = screen.getByRole("textbox");
  // 过滤按labelText（纯文本前缀），非渲染文本；富内容label经<b>渲染
  await input.fill("ban");
  const menu = document.querySelector(
    ".oo-ui-menuSelectWidget:not(.oo-ui-element-hidden)",
  )!;
  const options = menu.querySelectorAll(
    ".oo-ui-optionWidget:not(.oo-ui-menuSectionOptionWidget)",
  );
  expect(options).toHaveLength(1);
  expect(options[0].querySelector("b")?.textContent).toBe("香蕉");
  const inputEl = screen.container.querySelector<HTMLInputElement>("input")!;
  inputEl.dispatchEvent(
    new KeyboardEvent("keydown", { key: "Enter", bubbles: true, cancelable: true }),
  );
  await tick();
  // 标签本体渲染富内容
  const tag = screen.container.querySelector(".oo-ui-tagItemWidget")!;
  expect(tag.querySelector("b")?.textContent).toBe("香蕉");
  expect(onChange.mock.calls[0]?.[0]).toEqual(["banana"]);
});

it("输入文本首端按←：焦点转向末尾标签（对齐原版doInputArrow）", async () => {
  const screen = await render(
    <TagMultiselect defaultValue={["甲", "乙"]} allowArbitrary />,
  );
  const input = screen.container.querySelector<HTMLInputElement>("input")!;
  input.focus();
  // 光标已在文本首端：←无处可移，按原版语义转向标签导航
  input.setSelectionRange(0, 0);
  pressKey(input, "ArrowLeft");
  await tick();
  const tags = screen.container.querySelectorAll<HTMLElement>(".oo-ui-tagItemWidget");
  expect(document.activeElement).toBe(tags[tags.length - 1]);
});

it("RTL：方向翻转后←不转向标签导航，→才转向", async () => {
  const screen = await render(
    // 方向经输入框的computed direction解析（direction为继承属性，宿主根inline style即生效）
    <div style={{ direction: "rtl" }}>
      <TagMultiselect defaultValue={["甲", "乙"]} allowArbitrary />
    </div>,
  );
  const input = screen.container.querySelector<HTMLInputElement>("input")!;
  input.focus();
  input.setSelectionRange(0, 0);
  pressKey(input, "ArrowLeft");
  await tick();
  // RTL下←是前进方向，不满足转向标签的backwards条件
  expect(document.activeElement).toBe(input);

  pressKey(input, "ArrowRight");
  await tick();
  const tags = screen.container.querySelectorAll<HTMLElement>(".oo-ui-tagItemWidget");
  expect(document.activeElement).toBe(tags[tags.length - 1]);
});

it("disabled：根/输入框/标签项同步禁用，移除按钮点击不移除标签", async () => {
  const screen = await render(
    <TagMultiselect defaultValue={["x", "y"]} allowArbitrary disabled />,
  );
  const root = getRoot(screen);
  expect(root).toHaveClass("oo-ui-widget-disabled");
  expect(root).toHaveAttribute("aria-disabled", "true");
  expect(root.querySelector("input")).toHaveAttribute("disabled");

  const tag = root.querySelector(".oo-ui-tagItemWidget")!;
  expect(tag).toHaveClass("oo-ui-widget-disabled");
  const removeButton = tag.querySelector<HTMLElement>(".oo-ui-buttonElement-button")!;
  expect(removeButton).toHaveAttribute("aria-disabled", "true");

  clickElement(removeButton);
  await tick();
  expect(root.querySelectorAll(".oo-ui-tagItemWidget")).toHaveLength(2);
});

it("disabled：Backspace不移除末尾标签（输入框按键整体早退）", async () => {
  const screen = await render(
    <TagMultiselect defaultValue={["x", "y"]} allowArbitrary disabled />,
  );
  const input = getRoot(screen).querySelector<HTMLInputElement>("input")!;
  pressKey(input, "Backspace");
  await tick();
  expect(getRoot(screen).querySelectorAll(".oo-ui-tagItemWidget")).toHaveLength(2);
});

it("菜单模式：失焦时提交输入文本而非高亮项（先收菜单清高亮再提交）", async () => {
  const onChange = vi.fn<(value: (string | number)[]) => void>();
  const screen = await render(
    <MenuTagMultiselect options={[...OPTIONS]} onChange={onChange} allowArbitrary />,
  );
  const input = screen.getByRole("textbox");
  await input.fill("b");
  const inputEl = screen.container.querySelector<HTMLInputElement>("input")!;
  inputEl.blur();
  await tick();
  // 失焦提交忽略高亮：提交的是输入文本"b"而非菜单高亮项
  const tag = screen.container.querySelector(".oo-ui-tagItemWidget")!;
  expect(tag.textContent).toContain("b");
  expect(onChange.mock.calls[0]?.[0]).toEqual(["b"]);
});

it("菜单模式：带残留文本重开菜单时打开帧显示全量（原版previouslySelectedValue机制）", async () => {
  const screen = await render(
    <MenuTagMultiselect
      options={[...OPTIONS]}
      allowArbitrary
      defaultValue={["banana"]}
    />,
  );
  const inputEl = screen.container.querySelector<HTMLInputElement>("input")!;
  // Backspace移除末尾标签并把其文本回填输入框（菜单未开，输入框带残留文本）
  inputEl.dispatchEvent(
    new KeyboardEvent("keydown", { key: "Backspace", bubbles: true, cancelable: true }),
  );
  await tick();
  expect(inputEl.value).toBe("香蕉");
  // 聚焦重开菜单：打开帧恒显示全量，不按残留文本筛空候选（对齐原版toggle(true)先取
  // previouslySelectedValue再showAll）
  inputEl.focus();
  await tick();
  const visibleOptions = () =>
    document
      .querySelector(".oo-ui-menuSelectWidget:not(.oo-ui-element-hidden)")!
      .querySelectorAll(".oo-ui-optionWidget:not(.oo-ui-menuSectionOptionWidget)");
  expect(visibleOptions()).toHaveLength(3);
  // 自打开后的首次编辑起照常过滤
  await screen.getByRole("textbox").fill("樱桃");
  expect(visibleOptions()).toHaveLength(1);
});

it("菜单模式：展开期输入框输出aria-owns指向菜单，收起移除（对齐原版onToggle稳态）", async () => {
  const screen = await render(<MenuTagMultiselect options={[...OPTIONS]} />);
  const inputEl = screen.container.querySelector<HTMLInputElement>("input")!;
  expect(inputEl).not.toHaveAttribute("aria-owns");
  inputEl.focus();
  await tick();
  // 菜单portal至body、非输入框的DOM后代，须经aria-owns显式关联
  const menu = document.querySelector(
    ".oo-ui-menuSelectWidget:not(.oo-ui-element-hidden)",
  )!;
  expect(menu.id).not.toBe("");
  expect(inputEl).toHaveAttribute("aria-owns", menu.id);
  inputEl.blur();
  await tick();
  expect(inputEl).not.toHaveAttribute("aria-owns");
});
