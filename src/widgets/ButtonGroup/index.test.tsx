import { expect, it, vi } from "vitest";
import { render } from "vitest-browser-react";
import { clickElement, getRoot, tick } from "../../testing";
import { Button } from "../Button";
import { ButtonGroup } from ".";

/**
 * ButtonGroup（对齐原版OO.ui.ButtonGroupWidget）的浏览器渲染契约：
 * 根类链、组级disabled经Context下发到组内按钮（含ToggleButton等组合形态——
 * 这里以自身disabled的按钮验证取或语义）、组禁用时点击不触发onClick。
 */
it("结构：buttonGroupWidget根类，children照常渲染", async () => {
  const screen = await render(
    <ButtonGroup>
      <Button>甲</Button>
      <Button>乙</Button>
    </ButtonGroup>,
  );
  const root = getRoot(screen);
  expect(root).toHaveClass("oo-ui-widget");
  expect(root).toHaveClass("oo-ui-buttonGroupWidget");
  expect(root.querySelectorAll(".oo-ui-buttonElement-button")).toHaveLength(2);
});

it("组禁用下发：组根输出disabled类，组内按钮继承禁用态且点击不触发", async () => {
  const onFirst = vi.fn<() => void>();
  const onSecond = vi.fn<() => void>();
  const screen = await render(
    <ButtonGroup disabled>
      <Button onClick={onFirst}>甲</Button>
      <Button onClick={onSecond}>乙</Button>
    </ButtonGroup>,
  );
  const root = getRoot(screen);
  expect(root).toHaveClass("oo-ui-widget-disabled");
  for (const button of root.querySelectorAll(".oo-ui-buttonElement-button")) {
    expect(button).toHaveAttribute("aria-disabled", "true");
    expect(button).toHaveAttribute("tabIndex", "-1");
  }
  clickElement(root.querySelectorAll(".oo-ui-buttonElement-button")[0]!);
  await tick();
  expect(onFirst).not.toHaveBeenCalled();
});

it("组内按钮自身disabled与组禁用取或：仅禁用自身，未禁用项不受影响", async () => {
  const onSecond = vi.fn<() => void>();
  const screen = await render(
    <ButtonGroup>
      <Button disabled>甲</Button>
      <Button onClick={onSecond}>乙</Button>
    </ButtonGroup>,
  );
  const root = getRoot(screen);
  const [first, second] = root.querySelectorAll(".oo-ui-buttonElement-button");
  expect(first).toHaveAttribute("aria-disabled", "true");
  expect(second).not.toHaveAttribute("aria-disabled");
  clickElement(second!);
  await tick();
  expect(onSecond).toHaveBeenCalledOnce();
});
