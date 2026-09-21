import { expect, it, vi } from "vitest";
import { render } from "vitest-browser-react";
import { ButtonMenuSelectWidget } from ".";
import { getRoot, pressMouse, pressKey, tick } from "../../testing";

const OPTIONS = [
  { children: "甲", value: "a" },
  { children: "乙", value: "b" },
] as const;

const getAnchor = (screen: { container: Element }) =>
  getRoot(screen).querySelector<HTMLElement>(".oo-ui-buttonElement-button")!;
/** 经锚点的aria-owns取porta至body的菜单元素（同时锁定关联关系） */
const getMenu = (screen: { container: Element }) =>
  document.getElementById(getAnchor(screen).getAttribute("aria-owns")!)!;

/**
 * ButtonMenuSelectWidget（对齐原版OO.ui.ButtonMenuSelectWidget）的浏览器渲染契约：
 * 按钮锚点的菜单aria关联与按压态、portal菜单的开合、选定回调与收起、
 * clearOnSelect的粘性选中态、键盘展开与选定。
 */
it("点击按钮开合菜单：aria-expanded/aria-owns与按压类随之切换，菜单portal渲染在body", async () => {
  const screen = await render(
    <ButtonMenuSelectWidget options={[...OPTIONS]}>菜单</ButtonMenuSelectWidget>,
  );
  const root = getRoot(screen);
  const anchor = getAnchor(screen);
  expect(root).toHaveClass("oo-ui-buttonMenuSelectWidget");
  expect(root).toHaveClass("oo-ui-buttonElement-framed");
  expect(anchor).toHaveAttribute("aria-haspopup", "true");
  expect(anchor).toHaveAttribute("aria-expanded", "false");
  expect(anchor).not.toHaveAttribute("aria-owns");
  expect(root).not.toHaveClass("oo-ui-buttonElement-pressed");

  await anchor.click();
  await tick();
  expect(anchor).toHaveAttribute("aria-expanded", "true");
  // 菜单打开期间按钮呈按压态（对齐原版onMenuToggle）
  expect(root).toHaveClass("oo-ui-buttonElement-pressed");
  const menu = getMenu(screen);
  expect(menu).toHaveClass("oo-ui-menuSelectWidget");
  expect(menu).not.toHaveClass("oo-ui-element-hidden");
  expect(menu.querySelectorAll("[role=option]")).toHaveLength(2);

  await anchor.click();
  await tick();
  expect(anchor).toHaveAttribute("aria-expanded", "false");
  expect(anchor).not.toHaveAttribute("aria-owns");
  expect(root).not.toHaveClass("oo-ui-buttonElement-pressed");
});

it("选定选项：回调onChoose并收起菜单，缺省命令菜单不留选中态", async () => {
  const onChoose = vi.fn<(value: string | number) => void>();
  const screen = await render(
    <ButtonMenuSelectWidget options={[...OPTIONS]} onChoose={onChoose}>
      菜单
    </ButtonMenuSelectWidget>,
  );
  await getAnchor(screen).click();
  await tick();
  const menu = getMenu(screen);
  pressMouse(menu.querySelectorAll("[role=option]")[0]!);
  await tick();
  expect(onChoose).toHaveBeenCalledWith("a");
  expect(getAnchor(screen)).toHaveAttribute("aria-expanded", "false");
  expect(menu.querySelector(".oo-ui-optionWidget-selected")).toBeNull();
});

it("clearOnSelect=false：选定后保留粘性选中态（下次展开仍见选中项）", async () => {
  const screen = await render(
    <ButtonMenuSelectWidget options={[...OPTIONS]} clearOnSelect={false}>
      菜单
    </ButtonMenuSelectWidget>,
  );
  await getAnchor(screen).click();
  await tick();
  const menu = getMenu(screen);
  pressMouse(menu.querySelectorAll("[role=option]")[1]!);
  await tick();
  const selected = menu.querySelector(".oo-ui-optionWidget-selected")!;
  expect(selected.textContent).toContain("乙");
});

it("键盘：Enter展开、↑↓移动高亮、Enter选定（收起态方向键不展开）", async () => {
  const onChoose = vi.fn<(value: string | number) => void>();
  const screen = await render(
    <ButtonMenuSelectWidget options={[...OPTIONS]} onChoose={onChoose}>
      菜单
    </ButtonMenuSelectWidget>,
  );
  const root = getRoot(screen);
  // 收起态方向键不展开、不拦截（对齐原版：菜单收起时不绑定键盘、ButtonWidget无方向键处理）
  pressKey(root, "ArrowDown");
  await tick();
  expect(getAnchor(screen)).toHaveAttribute("aria-expanded", "false");

  // Enter展开菜单
  pressKey(root, "Enter");
  await tick();
  expect(getAnchor(screen)).toHaveAttribute("aria-expanded", "true");

  // 展开后方向键移动高亮
  pressKey(root, "ArrowDown");
  await tick();
  const menu = getMenu(screen);
  const highlighted = menu.querySelector(".oo-ui-optionWidget-highlighted")!;
  expect(highlighted.textContent).toContain("甲");
  // 高亮项的activedescendant落在按钮锚点上（对齐原版setFocusOwner(widget.$tabIndexed)）
  expect(getAnchor(screen).getAttribute("aria-activedescendant")).toBe(
    highlighted.getAttribute("id"),
  );

  // Enter选定高亮项并收起
  pressKey(root, "Enter");
  await tick();
  expect(onChoose).toHaveBeenCalledWith("a");
  expect(getAnchor(screen)).toHaveAttribute("aria-expanded", "false");
});

it("键盘：空格选定高亮项；前缀缓冲活跃时空格属type-to-search，不开合不选定", async () => {
  const onChoose = vi.fn<(value: string | number) => void>();
  const screen = await render(
    <ButtonMenuSelectWidget options={[...OPTIONS]} onChoose={onChoose}>
      菜单
    </ButtonMenuSelectWidget>,
  );
  const root = getRoot(screen);
  pressKey(root, "Enter");
  await tick();
  pressKey(root, "ArrowDown");
  await tick();

  // 空格与Enter同分支：选定高亮项（该分支keydown已preventDefault，keypress不派发）
  pressKey(root, " ");
  await tick();
  expect(onChoose).toHaveBeenCalledWith("a");
  expect(getAnchor(screen)).toHaveAttribute("aria-expanded", "false");

  // 前缀缓冲活跃时（前缀跳转经document keypress填充：合成keydown不派生keypress，故显式派发；
  // charCode是该通道的判定入口，只给key进不了缓冲）
  pressKey(root, "Enter");
  await tick();
  document.dispatchEvent(
    new KeyboardEvent("keypress", {
      key: "a",
      charCode: 97,
      bubbles: true,
      cancelable: true,
    } as KeyboardEventInit & { charCode?: number }),
  );
  pressKey(root, " ");
  await tick();
  // 空格被前缀搜索消费：菜单保持展开、不选定（同时不会因Button的keypress模拟click而收起）
  expect(getAnchor(screen)).toHaveAttribute("aria-expanded", "true");
  expect(onChoose).toHaveBeenCalledTimes(1);
});

it("展开期可打印keypress补默认抑制（对齐原版onDocumentKeyPress末尾preventDefault），IME合成期按键不驱动", async () => {
  const onChoose = vi.fn<(value: string | number) => void>();
  const screen = await render(
    <ButtonMenuSelectWidget options={[...OPTIONS]} onChoose={onChoose}>
      菜单
    </ButtonMenuSelectWidget>,
  );
  const root = getRoot(screen);
  pressKey(root, "Enter");
  await tick();

  // 展开期可打印字符：原版onDocumentKeyPress对命中字符无条件preventDefault+stopPropagation
  // （oojs-ui.js:7717-7718），本工程对齐preventDefault（document冒泡相位无需stopPropagation）
  const keypress = new KeyboardEvent("keypress", {
    key: "a",
    charCode: 97,
    bubbles: true,
    cancelable: true,
  } as KeyboardEventInit & { charCode?: number });
  document.dispatchEvent(keypress);
  expect(keypress.defaultPrevented).toBe(true);

  // IME合成期按键不驱动开合与选定（Enter为确认候选的常见键位）
  const composingEnter = new KeyboardEvent("keydown", {
    key: "Enter",
    isComposing: true,
    bubbles: true,
    cancelable: true,
  });
  root.dispatchEvent(composingEnter);
  await tick();
  expect(getAnchor(screen)).toHaveAttribute("aria-expanded", "true");
  expect(composingEnter.defaultPrevented).toBe(false);

  // 非合成方向键照常移动高亮（并清空合成键盘前缀测试可能留下的缓冲），Enter选定并收起
  pressKey(root, "ArrowDown");
  await tick();
  expect(
    getMenu(screen).querySelector(".oo-ui-optionWidget-highlighted")!.textContent,
  ).toContain("甲");
  pressKey(root, "Enter");
  await tick();
  expect(onChoose).toHaveBeenCalledWith("a");
  expect(getAnchor(screen)).toHaveAttribute("aria-expanded", "false");
});

it("展开后Home/End取首末项，PageUp/PageDown按10跨度移动且端点钳制不环绕", async () => {
  const screen = await render(
    <ButtonMenuSelectWidget options={[...OPTIONS]}>菜单</ButtonMenuSelectWidget>,
  );
  const root = getRoot(screen);
  pressKey(root, "Enter");
  await tick();
  const menu = getMenu(screen);
  const highlighted = () =>
    menu.querySelector(".oo-ui-optionWidget-highlighted")!.textContent;

  pressKey(root, "Home");
  await tick();
  expect(highlighted()).toContain("甲");
  // 起点在首项：PageDown按10跨度翻页，落点只能是末项（若该键未被处理会仍停在甲）
  pressKey(root, "PageDown");
  await tick();
  expect(highlighted()).toContain("乙");
  // 已在末项：再PageDown钳制不环绕
  pressKey(root, "PageDown");
  await tick();
  expect(highlighted()).toContain("乙");

  pressKey(root, "PageUp");
  await tick();
  expect(highlighted()).toContain("甲");
  // 已在首项：PageUp同样钳制
  pressKey(root, "PageUp");
  await tick();
  expect(highlighted()).toContain("甲");
  pressKey(root, "End");
  await tick();
  expect(highlighted()).toContain("乙");
});

it("Tab提交未选中的高亮项并阻止移出焦点（对齐原版MenuSelectWidget的TAB分支）", async () => {
  const onChoose = vi.fn<(value: string | number) => void>();
  const screen = await render(
    <ButtonMenuSelectWidget options={[...OPTIONS]} onChoose={onChoose}>
      菜单
    </ButtonMenuSelectWidget>,
  );
  const root = getRoot(screen);
  pressKey(root, "Enter");
  await tick();
  pressKey(root, "ArrowDown");
  await tick();

  const tab = new KeyboardEvent("keydown", {
    key: "Tab",
    bubbles: true,
    cancelable: true,
  });
  root.dispatchEvent(tab);
  await tick();
  expect(tab.defaultPrevented).toBe(true);
  expect(onChoose).toHaveBeenCalledWith("a");
  expect(getAnchor(screen)).toHaveAttribute("aria-expanded", "false");
});

it("Escape收起菜单并清除高亮（下次展开无高亮项）", async () => {
  const screen = await render(
    <ButtonMenuSelectWidget options={[...OPTIONS]}>菜单</ButtonMenuSelectWidget>,
  );
  const root = getRoot(screen);
  pressKey(root, "Enter");
  await tick();
  pressKey(root, "ArrowDown");
  await tick();
  expect(getMenu(screen).querySelector(".oo-ui-optionWidget-highlighted")).toBeTruthy();

  document.body.dispatchEvent(
    new KeyboardEvent("keydown", { key: "Escape", bubbles: true, cancelable: true }),
  );
  await tick();
  expect(getAnchor(screen)).toHaveAttribute("aria-expanded", "false");

  // 重新展开：高亮已随收起复位（导航起点回到选中项），不再残留上次的高亮
  pressKey(root, "Enter");
  await tick();
  expect(getAnchor(screen)).toHaveAttribute("aria-expanded", "true");
  expect(getMenu(screen).querySelector(".oo-ui-optionWidget-highlighted")).toBeNull();
});

it("disabled：按钮输出禁用态，Enter/方向键均不展开", async () => {
  const screen = await render(
    <ButtonMenuSelectWidget options={[...OPTIONS]} disabled>
      菜单
    </ButtonMenuSelectWidget>,
  );
  const root = getRoot(screen);
  const anchor = getAnchor(screen);
  expect(root).toHaveClass("oo-ui-widget-disabled");
  expect(anchor).toHaveAttribute("aria-disabled", "true");

  pressKey(root, "Enter");
  await tick();
  expect(anchor).toHaveAttribute("aria-expanded", "false");
  pressKey(root, "ArrowDown");
  await tick();
  expect(anchor).not.toHaveAttribute("aria-owns");
});
