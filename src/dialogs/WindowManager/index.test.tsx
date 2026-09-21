import { expect, it } from "vitest";
import { render } from "vitest-browser-react";
import { WindowManager } from ".";

/**
 * WindowManager（对齐原版OO.ui.WindowManager的容器职责）的浏览器渲染契约：
 * portal至body（或自定义portal目标）、modal类、size/full档位类与floating/fullscreen类。
 */
it("缺省：portal至body，modal+size-medium+floating类，children在portal内", async () => {
  await render(
    <WindowManager>
      <div>弹窗</div>
    </WindowManager>,
  );
  const manager = document.body.querySelector(":scope > .oo-ui-windowManager")!;
  expect(manager).toHaveClass("oo-ui-windowManager-modal");
  expect(manager).toHaveClass("oo-ui-windowManager-size-medium");
  expect(manager).toHaveClass("oo-ui-windowManager-floating");
  expect(manager.textContent).toContain("弹窗");
});

it("full：size-full与fullscreen类（替代floating）", async () => {
  await render(
    <WindowManager full>
      <div>弹窗</div>
    </WindowManager>,
  );
  const manager = document.body.querySelector(":scope > .oo-ui-windowManager")!;
  expect(manager).toHaveClass("oo-ui-windowManager-size-full");
  expect(manager).toHaveClass("oo-ui-windowManager-fullscreen");
  expect(manager).not.toHaveClass("oo-ui-windowManager-floating");
});

it("modal=false与自定义size档位", async () => {
  await render(
    <WindowManager modal={false} size="large">
      <div>弹窗</div>
    </WindowManager>,
  );
  const manager = document.body.querySelector(":scope > .oo-ui-windowManager")!;
  expect(manager).not.toHaveClass("oo-ui-windowManager-modal");
  expect(manager).toHaveClass("oo-ui-windowManager-size-large");
});

it("portal指定自定义容器", async () => {
  const host = document.createElement("div");
  document.body.appendChild(host);
  await render(
    <WindowManager portal={host}>
      <div>弹窗</div>
    </WindowManager>,
  );
  expect(host.querySelector(".oo-ui-windowManager")).toBeTruthy();
  host.remove();
});
