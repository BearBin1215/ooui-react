import { expect, it } from "vitest";
import { render } from "vitest-browser-react";
import { getRoot } from "../../testing";
import { CheckboxInput } from "../../widgets/CheckboxInput";
import { Button } from "../../widgets/Button";
import { ButtonInput } from "../../widgets/ButtonInput";
import { TextInput } from "../../widgets/TextInput";
import { ActionFieldLayout } from ".";

/**
 * ActionFieldLayout（对齐原版OO.ui.ActionFieldLayout）的浏览器渲染契约：
 * 组合FieldLayout的类链与标签联动，输入区/按钮区两槽位、fieldInline决定输入区包装元素。
 */
it("结构：fieldLayout类链 + actionFieldLayout类，输入区为div、按钮区为span", async () => {
  const screen = await render(
    <ActionFieldLayout label="字段名" button={<Button>执行</Button>}>
      <TextInput />
    </ActionFieldLayout>,
  );
  const root = getRoot(screen);
  expect(root).toHaveClass("oo-ui-layout");
  expect(root).toHaveClass("oo-ui-fieldLayout");
  expect(root).toHaveClass("oo-ui-actionFieldLayout");
  // align缺省left
  expect(root).toHaveClass("oo-ui-fieldLayout-align-left");

  const inputWrapper = root.querySelector(".oo-ui-actionFieldLayout-input")!;
  expect(inputWrapper.tagName).toBe("DIV");
  expect(inputWrapper.querySelector("input")).toBeTruthy();
  const buttonSlot = root.querySelector(".oo-ui-actionFieldLayout-button")!;
  expect(buttonSlot.tagName).toBe("SPAN");
  expect(buttonSlot.textContent).toContain("执行");
});

it("fieldInline：输入区包装元素改为span（对齐原版按字段控件根元素tagName的自动判定）", async () => {
  const screen = await render(
    <ActionFieldLayout fieldInline button={<ButtonInput>提交</ButtonInput>}>
      <CheckboxInput />
    </ActionFieldLayout>,
  );
  const wrapper = getRoot(screen).querySelector(".oo-ui-actionFieldLayout-input")!;
  expect(wrapper.tagName).toBe("SPAN");
  expect(wrapper.querySelector("input[type=checkbox]")).toBeTruthy();
});

it("align透传与标签联动：align=top输出对应类，label经htmlFor关联字段input", async () => {
  const screen = await render(
    <ActionFieldLayout align="top" label="字段名" button={<Button>执行</Button>}>
      <TextInput />
    </ActionFieldLayout>,
  );
  const root = getRoot(screen);
  expect(root).toHaveClass("oo-ui-fieldLayout-align-top");
  const input = root.querySelector("input")!;
  expect(input.id).toBeTruthy();
  expect(root.querySelector("label")!.getAttribute("for")).toBe(input.id);
});
