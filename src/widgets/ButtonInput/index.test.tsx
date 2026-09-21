import { expect, it, vi } from "vitest";
import { render } from "vitest-browser-react";
import { getRoot, tick } from "../../testing";
import { ButtonInput } from ".";

const getNative = (screen: { container: Element }) =>
  getRoot(screen).querySelector<HTMLElement>("button, input")!;

/**
 * ButtonInput（对齐原版OO.ui.ButtonInputWidget）的浏览器渲染契约：
 * span根 + 真实button/input的类链与表单属性、useInputTag形态、禁用拦截、
 * 按压态、title（invisibleLabel兜底 + accessKey键位后缀）。
 */
it("结构：span根承载input/buttonInput与按钮类，内层真实button承载输入类与标签槽位", async () => {
  const screen = await render(
    <ButtonInput icon="picture" indicator="down">
      保存
    </ButtonInput>,
  );
  const root = getRoot(screen);
  expect(root.tagName).toBe("SPAN");
  expect(root).toHaveClass("oo-ui-widget");
  expect(root).toHaveClass("oo-ui-widget-enabled");
  expect(root).toHaveClass("oo-ui-inputWidget");
  expect(root).toHaveClass("oo-ui-buttonInputWidget");
  expect(root).toHaveClass("oo-ui-buttonElement");
  expect(root).toHaveClass("oo-ui-buttonElement-framed");
  expect(root).toHaveClass("oo-ui-labelElement");
  expect(root).toHaveClass("oo-ui-iconElement");
  expect(root).not.toHaveAttribute("aria-disabled");

  const button = getNative(screen) as HTMLButtonElement;
  expect(button.tagName).toBe("BUTTON");
  expect(button).toHaveClass("oo-ui-inputWidget-input");
  expect(button).toHaveClass("oo-ui-buttonElement-button");
  expect(button.getAttribute("type")).toBe("button");
  expect(button.getAttribute("tabindex")).toBe("0");
  expect(button.querySelector(".oo-ui-iconElement-icon")).toHaveClass(
    "oo-ui-icon-picture",
  );
  expect(button.querySelector(".oo-ui-labelElement-label")!.textContent).toBe("保存");
  expect(button.querySelector(".oo-ui-indicatorElement-indicator")).toHaveClass(
    "oo-ui-indicator-down",
  );
});

it("表单属性：type/name/value/formNoValidate落到真实button", async () => {
  const screen = await render(
    <ButtonInput type="submit" name="act" value="save" formNoValidate>
      保存
    </ButtonInput>,
  );
  const button = getNative(screen) as HTMLButtonElement;
  expect(button.getAttribute("type")).toBe("submit");
  expect(button.getAttribute("name")).toBe("act");
  expect(button.value).toBe("save");
  expect(button.formNoValidate).toBe(true);
});

it("useInputTag：渲染<input>，value取标签文本且只读，不输出图标槽位", async () => {
  const screen = await render(
    <ButtonInput useInputTag icon="picture">
      提交
    </ButtonInput>,
  );
  const input = getNative(screen) as HTMLInputElement;
  expect(input.tagName).toBe("INPUT");
  expect(input.value).toBe("提交");
  expect(input.readOnly).toBe(true);
  expect(input.querySelector(".oo-ui-iconElement-icon")).toBeNull();
  expect(getRoot(screen)).not.toHaveClass("oo-ui-iconElement");
});

it("禁用：点击被拦截、根与原生控件输出禁用态、图标反色", async () => {
  const onClick = vi.fn<(ev: unknown) => void>();
  const screen = await render(
    <ButtonInput disabled icon="picture" onClick={onClick}>
      保存
    </ButtonInput>,
  );
  const root = getRoot(screen);
  const button = getNative(screen) as HTMLButtonElement;
  expect(root).toHaveClass("oo-ui-widget-disabled");
  expect(root).toHaveAttribute("aria-disabled", "true");
  expect(button.disabled).toBe(true);
  expect(button.getAttribute("tabindex")).toBe("-1");
  expect(button.querySelector(".oo-ui-iconElement-icon")).toHaveClass(
    "oo-ui-image-invert",
  );
  // 直接派发click绕过原生禁用的激活拦截，验证组件侧的回调守卫
  button.dispatchEvent(new MouseEvent("click", { bubbles: true, cancelable: true }));
  expect(onClick).not.toHaveBeenCalled();
});

it("按压态：左键按下输出pressed类，抬起复位", async () => {
  const screen = await render(<ButtonInput>保存</ButtonInput>);
  const root = getRoot(screen);
  const button = getNative(screen);
  button.dispatchEvent(
    new MouseEvent("mousedown", { bubbles: true, cancelable: true, button: 0 }),
  );
  await tick();
  expect(root).toHaveClass("oo-ui-buttonElement-pressed");
  button.dispatchEvent(new MouseEvent("mouseup", { bubbles: true, cancelable: true }));
  await tick();
  expect(root).not.toHaveClass("oo-ui-buttonElement-pressed");
});

it("title：invisibleLabel以标签兜底并附accessKey键位后缀，标签元素带裁剪类", async () => {
  const screen = await render(
    <ButtonInput invisibleLabel accessKey="s">
      保存
    </ButtonInput>,
  );
  const root = getRoot(screen);
  const button = getNative(screen) as HTMLButtonElement;
  expect(button.getAttribute("title")).toBe("保存 [s]");
  expect(button.getAttribute("accesskey")).toBe("s");
  expect(root).not.toHaveClass("oo-ui-labelElement");
  expect(button.querySelector(".oo-ui-labelElement-label")).toHaveClass(
    "oo-ui-labelElement-invisible",
  );
});
