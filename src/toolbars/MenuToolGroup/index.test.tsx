import { expect, it } from "vitest";
import { render } from "vitest-browser-react";
import { getRoot, tick } from "../../testing";
import { getPanel, getTool } from "../../testing/toolGroups";
import { MenuToolGroup } from ".";

/**
 * MenuToolGroup（对齐原版OO.ui.MenuToolGroup）的浏览器渲染契约：
 * 菜单组类链与面板、把手标签按激活工具合成（无激活工具回落label）、把手开合。
 */
it("结构：menuToolGroup类链，工具进菜单面板，无激活工具时把手回落label", async () => {
  const screen = await render(
    <MenuToolGroup
      label="格式"
      tools={[
        { name: "bold", label: "粗体" },
        { name: "italic", label: "斜体" },
      ]}
    />,
  );
  const root = getRoot(screen);
  // 根即容器首子（组名类经className注入PopupToolGroupBase的根div）；面板另经portal出容器子树
  expect(root).toBe(document.querySelector(".oo-ui-menuToolGroup"));
  expect(root).toHaveClass("oo-ui-toolGroup");
  expect(root).toHaveClass("oo-ui-popupToolGroup");
  expect(
    root.querySelector(".oo-ui-popupToolGroup-handle .oo-ui-labelElement-label")!
      .textContent,
  ).toBe("格式");
  expect(getPanel()).toHaveClass("oo-ui-menuToolGroup-tools");
  expect(getTool("bold")).toBeTruthy();
  expect(getTool("italic")).toBeTruthy();
});

it("把手标签按激活工具标题合成（多个以逗号连接）", async () => {
  const screen = await render(
    <MenuToolGroup
      label="格式"
      tools={[
        { name: "bold", label: "粗体", active: true },
        { name: "italic", label: "斜体", active: true },
        { name: "under", label: "下划线" },
      ]}
    />,
  );
  expect(getRoot(screen).querySelector(".oo-ui-labelElement-label")!.textContent).toBe(
    "粗体, 斜体",
  );
});

it("把手点击开合面板：aria-expanded与active类随之切换", async () => {
  const screen = await render(
    <MenuToolGroup label="格式" tools={[{ name: "bold", label: "粗体" }]} />,
  );
  const root = getRoot(screen);
  const handle = root.querySelector<HTMLElement>(".oo-ui-popupToolGroup-handle")!;
  expect(handle).toHaveAttribute("aria-expanded", "false");

  await handle.click();
  await tick();
  expect(handle).toHaveAttribute("aria-expanded", "true");
  expect(root).toHaveClass("oo-ui-popupToolGroup-active");
  expect(getPanel()).not.toHaveClass("oo-ui-element-hidden");

  await handle.click();
  await tick();
  expect(handle).toHaveAttribute("aria-expanded", "false");
  expect(root).not.toHaveClass("oo-ui-popupToolGroup-active");
});
