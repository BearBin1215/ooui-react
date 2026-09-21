import { expect, it, vi } from "vitest";
import { useRef } from "react";
import { render } from "vitest-browser-react";
import { clickElement, pressMouse, tick } from "../../testing";
import { OOUIProvider } from "../../config";
import { Popup } from ".";
import { POPUP_ANCHOR_BOX_SIZE } from "./popupLayout";

const getPopupRoot = () => document.querySelector<HTMLDivElement>(".oo-ui-popupWidget")!;

/**
 * 带固定定位锚点容器的宿主：popup经portal渲染至body，锚点仅用于定位与联动
 */
function Anchor(props: Omit<Parameters<typeof Popup>[0], "container">) {
  const ref = useRef<HTMLDivElement>(null);
  return (
    <>
      <div
        data-testid="anchor"
        ref={ref}
        style={{ position: "fixed", top: 0, left: 0, width: 100, height: 20 }}
      />
      <Popup {...props} container={ref} />
    </>
  );
}

/**
 * Popup（对齐原版OO.ui.PopupWidget）的浏览器渲染契约：
 * 关闭态hidden类与屏外定位、打开后的anchored类与实位定位、head关闭按钮、
 * autoClose三通道（外点/Escape/焦点圈闭）与ignore豁免、autoFlip翻转、
 * 滚出视口的表现层隐藏（不改open态）与body裁剪、浮层根输出有效文本方向。
 */
it("关闭态：portal至body、element-hidden类、屏外兜底定位、无anchored类", async () => {
  await render(<Anchor />);
  const root = getPopupRoot();
  expect(root).toHaveClass("oo-ui-widget");
  expect(root).toHaveClass("oo-ui-popupWidget");
  expect(root).toHaveClass("oo-ui-element-hidden");
  expect(root.style.top).toBe("-9999px");
  expect(root).not.toHaveClass("oo-ui-popupWidget-anchored");
  // 箭头元素照常渲染（显隐由anchored类与布局驱动）
  expect(root.querySelector(".oo-ui-popupWidget-anchor")).toBeTruthy();
});

it("打开：移除hidden类、输出anchored-top（默认below，箭头在上边缘）、实位定位与箭头偏移", async () => {
  await render(
    <Anchor defaultOpen>
      <p>内容</p>
    </Anchor>,
  );
  await tick(30);
  const root = getPopupRoot();
  expect(root).not.toHaveClass("oo-ui-element-hidden");
  expect(root).toHaveClass("oo-ui-popupWidget-anchored");
  expect(root).toHaveClass("oo-ui-popupWidget-anchored-top");
  expect(root.style.top).not.toBe("-9999px");
  expect(Number.parseFloat(root.style.top)).toBeGreaterThan(0);
  const anchor = root.querySelector<HTMLElement>(".oo-ui-popupWidget-anchor")!;
  // 箭头指向锚点容器中线（偏移随钳制修正，恒为有限数值）
  expect(Number.isFinite(Number.parseFloat(anchor.style.left ?? "0"))).toBe(true);
  expect(root.querySelector(".oo-ui-popupWidget-body")?.textContent).toContain("内容");
});

it("align=backwards：带箭头时以'before'起手再腾挪，锚点中线距弹层终止端为2×箭头盒", async () => {
  // 靶心：原版hPosMap的 backwards: this.anchored ? 'before' : 'end'（dist/oojs-ui.js:6507）
  // 与 positionAdjustment 的锚点腾挪（:6583-6596）。锚点宽100、弹层宽320（缺省），
  // 故锚点中线距终止端的稳态值只由箭头盒决定，与锚点宽度无关
  function Host() {
    const ref = useRef<HTMLDivElement>(null);
    return (
      <>
        <div
          ref={ref}
          style={{ position: "fixed", top: 0, left: 300, width: 100, height: 20 }}
        />
        <Popup defaultOpen align="backwards" container={ref}>
          <p>内容</p>
        </Popup>
      </>
    );
  }
  await render(<Host />);
  await tick(30);
  const popupRight = getPopupRoot().getBoundingClientRect().right;
  expect(Math.round(popupRight - (300 + 100 / 2))).toBe(2 * POPUP_ANCHOR_BOX_SIZE);
});

it("dir：Provider.dir=rtl时浮层根输出dir=rtl（覆盖锚点继承方向）", async () => {
  await render(
    <OOUIProvider dir="rtl">
      <Anchor defaultOpen>
        <p>内容</p>
      </Anchor>
    </OOUIProvider>,
  );
  await tick(30);
  expect(getPopupRoot()).toHaveAttribute("dir", "rtl");
});

it("dir：组件自身dir优先于Provider.dir与锚点继承方向（对齐原版Element config.dir）", async () => {
  await render(
    <OOUIProvider dir="rtl">
      <Anchor defaultOpen dir="ltr">
        <p>内容</p>
      </Anchor>
    </OOUIProvider>,
  );
  await tick(30);
  expect(getPopupRoot()).toHaveAttribute("dir", "ltr");
});

it("head：输出头部与关闭按钮，点击关闭回调onOpenChange(false)并隐藏", async () => {
  const onOpenChange = vi.fn<(open: boolean) => void>();
  await render(
    <Anchor defaultOpen head label="标题" onOpenChange={onOpenChange}>
      <p>内容</p>
    </Anchor>,
  );
  await tick(30);
  const root = getPopupRoot();
  expect(root.querySelector(".oo-ui-popupWidget-head")?.textContent).toContain("标题");
  const close = root.querySelector(
    ".oo-ui-popupWidget-closeButton .oo-ui-buttonElement-button",
  )!;
  expect(close).toBeTruthy();
  close.dispatchEvent(new MouseEvent("click", { bubbles: true }));
  await tick(30);
  expect(onOpenChange).toHaveBeenCalledWith(false);
  expect(root).toHaveClass("oo-ui-element-hidden");
});

it("autoClose：点击popup内部不关闭；点击外部关闭；Escape捕获阶段关闭", async () => {
  const onOpenChange = vi.fn<(open: boolean) => void>();
  await render(
    <Anchor defaultOpen autoClose onOpenChange={onOpenChange}>
      <p data-testid="inner">内容</p>
    </Anchor>,
  );
  await tick(30);
  const root = getPopupRoot();
  const inner = root.querySelector("[data-testid=inner]")!;
  pressMouse(inner);
  clickElement(inner);
  await tick(30);
  expect(onOpenChange).not.toHaveBeenCalled();
  expect(root).not.toHaveClass("oo-ui-element-hidden");

  document.body.dispatchEvent(new MouseEvent("mousedown", { bubbles: true }));
  await tick(30);
  expect(onOpenChange).toHaveBeenCalledWith(false);
  expect(root).toHaveClass("oo-ui-element-hidden");
});

it("autoClose：Escape捕获阶段关闭（嵌套冒泡处理器不误关外层）", async () => {
  const onOpenChange = vi.fn<(open: boolean) => void>();
  await render(
    <Anchor defaultOpen autoClose onOpenChange={onOpenChange}>
      <p>内容</p>
    </Anchor>,
  );
  await tick(30);
  document.body.dispatchEvent(
    new KeyboardEvent("keydown", { key: "Escape", bubbles: true, cancelable: true }),
  );
  await tick(30);
  expect(onOpenChange).toHaveBeenCalledWith(false);
  expect(getPopupRoot()).toHaveClass("oo-ui-element-hidden");
});

it("autoCloseIgnore：忽略元素内部的点击不触发关闭", async () => {
  const onOpenChange = vi.fn<(open: boolean) => void>();
  function Host() {
    const ref = useRef<HTMLDivElement>(null);
    return (
      <>
        <div
          data-testid="anchor"
          ref={ref}
          style={{ position: "fixed", top: 0, left: 0, width: 100, height: 20 }}
        />
        <Popup
          defaultOpen
          autoClose
          autoCloseIgnore={ref}
          container={ref}
          onOpenChange={onOpenChange}
        >
          <p>内容</p>
        </Popup>
      </>
    );
  }
  await render(<Host />);
  await tick(30);
  const anchor = document.querySelector("[data-testid=anchor]")!;
  pressMouse(anchor);
  clickElement(anchor);
  await tick(30);
  expect(onOpenChange).not.toHaveBeenCalled();
  expect(getPopupRoot()).not.toHaveClass("oo-ui-element-hidden");
});

it("焦点圈闭：末元素Tab请求关闭并阻止默认移焦；非末元素的Tab不接管", async () => {
  const onOpenChange = vi.fn<(open: boolean) => void>();
  await render(
    <Anchor defaultOpen autoClose onOpenChange={onOpenChange}>
      <button type="button">一</button>
      <button type="button">二</button>
    </Anchor>,
  );
  await tick(30);
  const root = getPopupRoot();
  const [first, last] = root.querySelectorAll("button");
  // 只在首尾各挂一个监听：首元素上的正向Tab属正常移出，不接管（对齐原版只在边界关闭）
  const innerTab = new KeyboardEvent("keydown", {
    key: "Tab",
    bubbles: true,
    cancelable: true,
  });
  first.dispatchEvent(innerTab);
  await tick(30);
  expect(innerTab.defaultPrevented).toBe(false);
  expect(onOpenChange).not.toHaveBeenCalled();

  const outTab = new KeyboardEvent("keydown", {
    key: "Tab",
    bubbles: true,
    cancelable: true,
  });
  last.dispatchEvent(outTab);
  await tick(30);
  expect(outTab.defaultPrevented).toBe(true);
  expect(onOpenChange).toHaveBeenCalledWith(false);
  expect(root).toHaveClass("oo-ui-element-hidden");
});

it("焦点圈闭：首元素Shift+Tab反向走出时同样请求关闭", async () => {
  const onOpenChange = vi.fn<(open: boolean) => void>();
  await render(
    <Anchor defaultOpen autoClose onOpenChange={onOpenChange}>
      <button type="button">一</button>
      <button type="button">二</button>
    </Anchor>,
  );
  await tick(30);
  const root = getPopupRoot();
  const backTab = new KeyboardEvent("keydown", {
    key: "Tab",
    shiftKey: true,
    bubbles: true,
    cancelable: true,
  });
  root.querySelectorAll("button")[0]!.dispatchEvent(backTab);
  await tick(30);
  expect(backTab.defaultPrevented).toBe(true);
  expect(onOpenChange).toHaveBeenCalledWith(false);
  expect(root).toHaveClass("oo-ui-element-hidden");
});

it("autoFlip：下方放不下翻转到上方（箭头在下边缘anchored-bottom），autoFlip=false保持below", async () => {
  function BottomAnchor(props: Omit<Parameters<typeof Popup>[0], "container">) {
    const ref = useRef<HTMLDivElement>(null);
    return (
      <>
        <div
          ref={ref}
          style={{ position: "fixed", bottom: 0, left: 0, width: 100, height: 20 }}
        />
        <Popup {...props} container={ref} />
      </>
    );
  }
  const screen = await render(
    <BottomAnchor defaultOpen height={400}>
      <p>内容</p>
    </BottomAnchor>,
  );
  await tick(30);
  // 翻转到上方后箭头在弹层下边缘
  expect(getPopupRoot()).toHaveClass("oo-ui-popupWidget-anchored-bottom");

  await screen.rerender(
    <BottomAnchor defaultOpen height={400} autoFlip={false}>
      <p>内容</p>
    </BottomAnchor>,
  );
  await tick(30);
  expect(getPopupRoot()).toHaveClass("oo-ui-popupWidget-anchored-top");
});

it("hideWhenOutOfView：锚定容器滚出视口后表现层隐藏（open态不变），滚回后恢复", async () => {
  const onOpenChange = vi.fn<(open: boolean) => void>();
  await render(
    <Anchor defaultOpen onOpenChange={onOpenChange}>
      <p>内容</p>
    </Anchor>,
  );
  await tick(30);
  const root = getPopupRoot();
  expect(root).not.toHaveClass("oo-ui-element-hidden");

  const anchor = document.querySelector<HTMLElement>("[data-testid=anchor]")!;
  anchor.style.top = "3000px";
  window.dispatchEvent(new Event("resize"));
  await tick(30);
  expect(root).toHaveClass("oo-ui-element-hidden");
  // open态未被改变：隐藏是表现层的
  expect(onOpenChange).not.toHaveBeenCalled();

  anchor.style.top = "0px";
  window.dispatchEvent(new Event("resize"));
  await tick(30);
  expect(root).not.toHaveClass("oo-ui-element-hidden");
});

it("body裁剪：弹层超出视口时body压至可用尺寸并开启滚动（ClippableElement对齐）", async () => {
  await render(
    <Anchor defaultOpen autoFlip={false}>
      <div style={{ height: 1500 }}>长内容</div>
    </Anchor>,
  );
  await tick(30);
  const body = getPopupRoot().querySelector<HTMLElement>(".oo-ui-popupWidget-body")!;
  expect(body.style.overflow).toBe("auto");
  const clipped = Number.parseFloat(body.style.height);
  expect(clipped).toBeGreaterThan(0);
  expect(clipped).toBeLessThan(1500);
});

it("调用方style透传：非定位键生效，定位键仍为组件每轮重算的值", async () => {
  await render(
    <Anchor defaultOpen style={{ maxWidth: 123, top: 7 }}>
      <p>内容</p>
    </Anchor>,
  );
  await tick(30);
  const root = getPopupRoot();
  expect(root.style.maxWidth).toBe("123px");
  // top为组件的定位结果（锚点下缘+占位），不是调用方给的7px
  expect(Number.parseFloat(root.style.top)).toBeGreaterThan(0);
  expect(Number.parseFloat(root.style.top)).not.toBe(7);
});
