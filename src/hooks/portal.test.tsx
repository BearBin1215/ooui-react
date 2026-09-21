import { type MutableRefObject } from "react";
import { expect, it, vi } from "vitest";
import { render } from "vitest-browser-react";
import { OOUIProvider } from "../config";
import { tick } from "../testing";
import { PopupButton } from "../widgets/PopupButton";
import { DIALOG_FLOAT_Z_INDEX, PortalHostProvider, useFloatPortal } from "./portal";

type PortalApi = ReturnType<typeof useFloatPortal>;

/** 直接消费useFloatPortal的宿主：anchorRef即浮层锚点（不传即"锚点尚未挂载"） */
function Harness({
  apiRef,
  anchorRef,
}: {
  apiRef: MutableRefObject<PortalApi | null>;
  anchorRef?: MutableRefObject<HTMLDivElement | null>;
}) {
  apiRef.current = useFloatPortal();
  return <div data-testid="anchor" ref={anchorRef} />;
}

/**
 * portal.ts的useFloatPortal：浮层容器的三级回落与弹窗层值。
 * 宿主配置的`getPortalContainer` → 弹窗子树内的portal宿主（管理器根）→ `document.body`；
 * 层值只在真正落到弹窗宿主时给出（宿主自配容器时层叠安排交回宿主）。
 */
it("缺省回落document.body；锚点未挂载（null）时不调用宿主回调", async () => {
  const apiRef: MutableRefObject<PortalApi | null> = { current: null };
  const getPortalContainer = vi.fn<(trigger: HTMLElement) => HTMLElement>(() =>
    document.createElement("div"),
  );
  await render(
    <OOUIProvider getPortalContainer={getPortalContainer}>
      <Harness apiRef={apiRef} />
    </OOUIProvider>,
  );
  // 锚点未挂载时宿主回调无从解析（恒回落到body）
  expect(apiRef.current!.getContainer(null)).toBe(document.body);
  expect(getPortalContainer).not.toHaveBeenCalled();
});

it("宿主getPortalContainer优先，且此时不给出弹窗层值", async () => {
  const host = document.createElement("div");
  document.body.appendChild(host);
  try {
    const apiRef: MutableRefObject<PortalApi | null> = { current: null };
    const anchorRef: MutableRefObject<HTMLDivElement | null> = { current: null };
    const getPortalContainer = vi.fn<(trigger: HTMLElement) => HTMLElement>(() => host);
    await render(
      <OOUIProvider getPortalContainer={getPortalContainer}>
        <Harness apiRef={apiRef} anchorRef={anchorRef} />
      </OOUIProvider>,
    );
    expect(apiRef.current!.getContainer(anchorRef.current)).toBe(host);
    expect(getPortalContainer).toHaveBeenCalledWith(anchorRef.current);
    // 浮层去向由宿主决定：层值交回宿主容器与主题CSS，本库不猜测宿主的层叠安排
    expect(apiRef.current!.dialogZIndex).toBeUndefined();
  } finally {
    host.remove();
  }
});

it("弹窗子树内的portal宿主次之，并给出与弹窗同层的层值", async () => {
  const managerRoot = document.createElement("div");
  const apiRef: MutableRefObject<PortalApi | null> = { current: null };
  const anchorRef: MutableRefObject<HTMLDivElement | null> = { current: null };
  await render(
    <PortalHostProvider value={managerRoot}>
      <Harness apiRef={apiRef} anchorRef={anchorRef} />
    </PortalHostProvider>,
  );
  expect(apiRef.current!.getContainer(anchorRef.current)).toBe(managerRoot);
  expect(apiRef.current!.dialogZIndex).toBe(DIALOG_FLOAT_Z_INDEX);
});

it("宿主配置优先于弹窗宿主（层值交回宿主）", async () => {
  const host = document.createElement("div");
  const managerRoot = document.createElement("div");
  const apiRef: MutableRefObject<PortalApi | null> = { current: null };
  const anchorRef: MutableRefObject<HTMLDivElement | null> = { current: null };
  await render(
    <OOUIProvider getPortalContainer={() => host}>
      <PortalHostProvider value={managerRoot}>
        <Harness apiRef={apiRef} anchorRef={anchorRef} />
      </PortalHostProvider>
    </OOUIProvider>,
  );
  expect(apiRef.current!.getContainer(anchorRef.current)).toBe(host);
  expect(apiRef.current!.dialogZIndex).toBeUndefined();
});

it("getContainer引用跨渲染稳定（容器身份漂移会让portal重挂载浮层）", async () => {
  const apiRef: MutableRefObject<PortalApi | null> = { current: null };
  const screen = await render(<Harness apiRef={apiRef} />);
  const first = apiRef.current!.getContainer;
  await screen.rerender(<Harness apiRef={apiRef} />);
  expect(apiRef.current!.getContainer).toBe(first);
});

it("组件级：宿主配置容器时浮层portal进该容器且不写层值", async () => {
  const host = document.createElement("div");
  document.body.appendChild(host);
  try {
    await render(
      <OOUIProvider getPortalContainer={() => host}>
        <PopupButton popupContent={<p>面板</p>}>按钮</PopupButton>
      </OOUIProvider>,
    );
    document
      .querySelector<HTMLElement>(".oo-ui-popupButtonWidget .oo-ui-buttonElement-button")!
      .click();
    await tick();
    const popup = document.querySelector<HTMLElement>(".oo-ui-popupButtonWidget-popup")!;
    expect(popup.parentElement).toBe(host);
    expect(popup.style.zIndex).toBe("");
  } finally {
    host.remove();
  }
});
