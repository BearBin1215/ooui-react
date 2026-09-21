import { expect, it } from "vitest";
import { render } from "vitest-browser-react";
import { getRoot } from "../../testing";
import { FieldsetLayout } from ".";

/**
 * FieldsetLayout（对齐原版OO.ui.FieldsetLayout）的浏览器渲染契约：
 * fieldset根 + legend头部 + group分组的三段结构、label/icon类、帮助文本的
 * inline标签与非inline帮助按钮两形态。
 */
it("结构：fieldset根 + legend头部 + group分组，label/icon类按需输出", async () => {
  const screen = await render(
    <FieldsetLayout label="设置" icon="settings">
      <span>字段</span>
    </FieldsetLayout>,
  );
  const root = getRoot(screen);
  expect(root.tagName).toBe("FIELDSET");
  expect(root).toHaveClass("oo-ui-layout");
  expect(root).toHaveClass("oo-ui-fieldsetLayout");
  expect(root).toHaveClass("oo-ui-labelElement");
  expect(root).toHaveClass("oo-ui-iconElement");

  const legend = root.querySelector("legend.oo-ui-fieldsetLayout-header")!;
  expect(legend.querySelector(".oo-ui-labelElement-label")!.textContent).toBe("设置");
  expect(legend.querySelector(".oo-ui-iconElement-icon")).toHaveClass(
    "oo-ui-icon-settings",
  );
  expect(root.querySelector(".oo-ui-fieldsetLayout-group")!.textContent).toContain(
    "字段",
  );
});

it("invisibleLabel：根不输出labelElement，标签元素带裁剪类", async () => {
  const screen = await render(
    <FieldsetLayout label="设置" invisibleLabel>
      <span>字段</span>
    </FieldsetLayout>,
  );
  const root = getRoot(screen);
  expect(root).not.toHaveClass("oo-ui-labelElement");
  expect(root.querySelector(".oo-ui-labelElement-label")).toHaveClass(
    "oo-ui-labelElement-invisible",
  );
});

it("helpInline：帮助文本以inline-help标签显示、不渲染帮助按钮", async () => {
  const screen = await render(
    <FieldsetLayout label="设置" help="帮助说明" helpInline>
      <span>字段</span>
    </FieldsetLayout>,
  );
  const root = getRoot(screen);
  expect(root.querySelector(".oo-ui-inline-help")!.textContent).toBe("帮助说明");
  expect(root.querySelector(".oo-ui-fieldsetLayout-help")).toBeNull();
});

it("help（非inline）：渲染帮助按钮，aria-label取ooui-field-help消息", async () => {
  const screen = await render(
    <FieldsetLayout label="设置" help="帮助说明">
      <span>字段</span>
    </FieldsetLayout>,
  );
  const root = getRoot(screen);
  expect(root.querySelector(".oo-ui-inline-help")).toBeNull();
  const helpButton = root.querySelector(".oo-ui-fieldsetLayout-help")!;
  expect(helpButton.querySelector("[aria-label]")).toHaveAttribute("aria-label", "Help");
});
