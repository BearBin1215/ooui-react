import { expect, it, vi } from "vitest";
import { render } from "vitest-browser-react";
import { tick } from "../../testing";
import { PopupButton } from ".";

const getButton = (screen: { container: Element }) =>
  screen.container.querySelector<HTMLSpanElement>(".oo-ui-popupButtonWidget")!;
const getAnchor = (screen: { container: Element }) =>
  getButton(screen).querySelector<HTMLAnchorElement>(".oo-ui-buttonElement-button")!;
const getPopupRoot = () =>
  document.querySelector<HTMLElement>(".oo-ui-popupButtonWidget-popup")!;

/**
 * PopupButton（对齐原版OO.ui.PopupButtonWidget）的浏览器渲染契约：
 * 按钮与弹层的双向aria关联（haspopup/owns、describedby）、点击切换与onOpenChange、
 * autoClose忽略按钮自身（按下按钮不触发外点关闭，只走开合逻辑）、
 * popupContent与children的分置、framed变体类。
 */
it("结构：按钮输出popupButtonWidget类，anchor声明haspopup/owns，弹层以dialog语义反向关联", async () => {
  const screen = await render(
    <PopupButton popupContent={<p>面板内容</p>}>按钮</PopupButton>,
  );
  const button = getButton(screen);
  expect(button).toHaveClass("oo-ui-buttonElement-framed");
  const anchor = getAnchor(screen);
  expect(anchor).toHaveAttribute("aria-haspopup", "dialog");
  const popupId = anchor.getAttribute("aria-owns")!;
  const root = getPopupRoot();
  expect(root.id).toBe(popupId);
  expect(root).toHaveAttribute("role", "dialog");
  expect(root.getAttribute("aria-describedby")).toBe(button.id);
  expect(root).toHaveClass("oo-ui-popupButtonWidget-framed-popup");
  expect(root).toHaveClass("oo-ui-element-hidden");
  // 不在弹窗内：portal回落到document.body，且不写弹窗同层的层值（层级交回主题CSS）
  expect(root.parentElement).toBe(document.body);
  expect(root.style.zIndex).toBe("");
});

it("children渲染为按钮标签，popupContent渲染进弹层body", async () => {
  await render(<PopupButton popupContent={<p>面板内容</p>}>按钮</PopupButton>);
  expect(getButton({ container: document.body }).textContent).toContain("按钮");
  expect(getPopupRoot().querySelector(".oo-ui-popupWidget-body")?.textContent).toContain(
    "面板内容",
  );
});

it("点击切换：开→onOpenChange(true)与anchored类；再点→收起", async () => {
  const onOpenChange = vi.fn<(open: boolean) => void>();
  const screen = await render(
    <PopupButton popupContent={<p>面板内容</p>} onOpenChange={onOpenChange}>
      按钮
    </PopupButton>,
  );
  getAnchor(screen).click();
  await tick(30);
  expect(onOpenChange).toHaveBeenCalledWith(true);
  const root = getPopupRoot();
  expect(root).not.toHaveClass("oo-ui-element-hidden");
  // 弹层默认在按钮下方，箭头在弹层上边缘
  expect(root).toHaveClass("oo-ui-popupWidget-anchored-top");

  getAnchor(screen).click();
  await tick(30);
  expect(onOpenChange).toHaveBeenCalledWith(false);
  expect(root).toHaveClass("oo-ui-element-hidden");
});

it("autoClose：按下按钮不触发外点关闭（忽略豁免），点击外部关闭", async () => {
  const onOpenChange = vi.fn<(open: boolean) => void>();
  const screen = await render(
    <PopupButton popupContent={<p>面板内容</p>} onOpenChange={onOpenChange}>
      按钮
    </PopupButton>,
  );
  getAnchor(screen).click();
  await tick(30);
  onOpenChange.mockClear();

  // 仅按下按钮（无click）：autoClose的外点监听忽略按钮自身，弹层保持
  getAnchor(screen).dispatchEvent(
    new MouseEvent("mousedown", { bubbles: true, cancelable: true }),
  );
  await tick(30);
  expect(onOpenChange).not.toHaveBeenCalled();
  expect(getPopupRoot()).not.toHaveClass("oo-ui-element-hidden");

  document.body.dispatchEvent(new MouseEvent("mousedown", { bubbles: true }));
  await tick(30);
  expect(onOpenChange).toHaveBeenCalledWith(false);
  expect(getPopupRoot()).toHaveClass("oo-ui-element-hidden");
});

it("framed=false：弹层输出frameless-popup变体类", async () => {
  await render(
    <PopupButton framed={false} popupContent={<p>面板内容</p>}>
      按钮
    </PopupButton>,
  );
  expect(getPopupRoot()).toHaveClass("oo-ui-popupButtonWidget-frameless-popup");
});
