import { expect, it } from "vitest";
import { render } from "vitest-browser-react";
import { getRoot } from "../../testing";
import { MenuLayout } from ".";

/**
 * MenuLayout（对齐原版OO.ui.MenuLayout）的浏览器渲染契约：
 * expanded/showMenu/menuPosition三段修饰类、menu与content的先后顺序、
 * 收起菜单时不挂menu子树（避免隐形焦点陷阱）。
 */
it("缺省：expanded/showMenu/before类齐备，menu容器先于content", async () => {
  const screen = await render(<MenuLayout menu={<span>菜单</span>}>内容</MenuLayout>);
  const root = getRoot(screen);
  expect(root).toHaveClass("oo-ui-layout");
  expect(root).toHaveClass("oo-ui-menuLayout");
  expect(root).toHaveClass("oo-ui-menuLayout-expanded");
  expect(root).toHaveClass("oo-ui-menuLayout-showMenu");
  expect(root).toHaveClass("oo-ui-menuLayout-before");
  expect(root.children[0]).toHaveClass("oo-ui-menuLayout-menu");
  expect(root.children[1]).toHaveClass("oo-ui-menuLayout-content");
  expect(root.children[0]!.textContent).toContain("菜单");
  expect(root.children[1]!.textContent).toContain("内容");
});

it("menuPosition=after：menu容器排在content之后", async () => {
  const screen = await render(
    <MenuLayout menuPosition="after" menu={<span>菜单</span>}>
      内容
    </MenuLayout>,
  );
  const root = getRoot(screen);
  expect(root).toHaveClass("oo-ui-menuLayout-after");
  expect(root.children[0]).toHaveClass("oo-ui-menuLayout-content");
  expect(root.children[1]).toHaveClass("oo-ui-menuLayout-menu");
});

it("非法menuPosition回退before；showMenu=false时不挂menu子树并标记aria-hidden", async () => {
  const screen = await render(
    <MenuLayout
      menuPosition={"left" as never}
      showMenu={false}
      expanded={false}
      menu={<span>菜单</span>}
    >
      内容
    </MenuLayout>,
  );
  const root = getRoot(screen);
  expect(root).toHaveClass("oo-ui-menuLayout-before");
  expect(root).toHaveClass("oo-ui-menuLayout-static");
  expect(root).toHaveClass("oo-ui-menuLayout-hideMenu");
  const menu = root.querySelector(".oo-ui-menuLayout-menu")!;
  expect(menu).toHaveAttribute("aria-hidden", "true");
  expect(menu.textContent).toBe("");
});
