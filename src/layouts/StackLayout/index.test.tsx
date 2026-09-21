import { expect, it, vi } from "vitest";
import { render } from "vitest-browser-react";
import { getRoot, tick } from "../../testing";
import { StackLayout } from ".";

const OPTIONS = [
  { children: <button type="button">页面甲按钮</button>, value: "a" },
  { children: <button type="button">页面乙按钮</button>, value: "b" },
] as const;

const getPages = (screen: { container: Element }) => [
  ...getRoot(screen).querySelectorAll(".oo-ui-pageLayout"),
];

/**
 * StackLayout（对齐原版OO.ui.StackLayout）的浏览器渲染契约：
 * 页面按options渲染、激活页active类/其余隐藏、continuous全显+整体滚动、
 * onPageFocus随页内焦点通知。
 */
it("结构：stackLayout根，页面按options渲染为pageLayout", async () => {
  const screen = await render(<StackLayout options={[...OPTIONS]} defaultValue="a" />);
  const root = getRoot(screen);
  expect(root).toHaveClass("oo-ui-panelLayout");
  expect(root).toHaveClass("oo-ui-stackLayout");
  expect(getPages(screen)).toHaveLength(2);
});

it("激活页输出active类，其余页隐藏（hidden属性+element-hidden类）", async () => {
  const screen = await render(<StackLayout options={[...OPTIONS]} defaultValue="a" />);
  const [first, second] = getPages(screen);
  expect(first).toHaveClass("oo-ui-pageLayout-active");
  expect(first).not.toHaveAttribute("hidden");
  expect(second).toHaveAttribute("hidden");
  expect(second).toHaveClass("oo-ui-element-hidden");
  expect(second).not.toHaveClass("oo-ui-pageLayout-active");
});

it("受控：value切换激活页", async () => {
  const screen = await render(<StackLayout options={[...OPTIONS]} value="a" />);
  expect(getPages(screen)[0]).toHaveClass("oo-ui-pageLayout-active");
  await screen.rerender(<StackLayout options={[...OPTIONS]} value="b" />);
  expect(getPages(screen)[1]).toHaveClass("oo-ui-pageLayout-active");
  expect(getPages(screen)[0]).toHaveAttribute("hidden");
});

it("continuous：全部页面可见，根输出continuous类且默认整体滚动", async () => {
  const screen = await render(
    <StackLayout options={[...OPTIONS]} defaultValue="a" continuous />,
  );
  const root = getRoot(screen);
  expect(root).toHaveClass("oo-ui-stackLayout-continuous");
  expect(root).toHaveClass("oo-ui-panelLayout-scrollable");
  for (const page of getPages(screen)) {
    expect(page).not.toHaveAttribute("hidden");
  }
  // continuous模式下激活类仍标注当前页
  expect(getPages(screen)[0]).toHaveClass("oo-ui-pageLayout-active");
  expect(getPages(screen)[1]).not.toHaveClass("oo-ui-pageLayout-active");
});

it("onPageFocus：页内获得焦点时携带页面value通知（与onChange分离）", async () => {
  const onPageFocus = vi.fn<(value: string | number) => void>();
  const onChange = vi.fn<(value: string | number) => void>();
  const screen = await render(
    <StackLayout
      options={[...OPTIONS]}
      defaultValue="a"
      onPageFocus={onPageFocus}
      onChange={onChange}
    />,
  );
  // 非激活页hidden不可聚焦，以激活页（甲）内的按钮触发
  getPages(screen)[0].querySelector("button")!.focus();
  await tick();
  expect(onPageFocus).toHaveBeenCalledOnce();
  expect(onPageFocus.mock.calls[0]?.[0]).toBe("a");
  expect(onChange).not.toHaveBeenCalled();
});

it("未给出激活值时缺省选中首个页（对齐原版addItems的缺省选中）", async () => {
  const screen = await render(<StackLayout options={[...OPTIONS]} />);
  expect(getPages(screen)[0]).toHaveClass("oo-ui-pageLayout-active");
});

it("受控value失效（激活页被移除）时补选下一个未被移除项并回写父级", async () => {
  const onChange = vi.fn<(value: string | number) => void>();
  const screen = await render(
    <StackLayout options={[...OPTIONS]} value="a" onChange={onChange} />,
  );
  // 移除当前激活页a → 补选其后的b（下一个未被移除项）
  await screen.rerender(
    <StackLayout options={[OPTIONS[1]]} value="a" onChange={onChange} />,
  );
  expect(getPages(screen)[0]).toHaveClass("oo-ui-pageLayout-active");
  expect(onChange).toHaveBeenCalledWith("b");
});

it("失效值为末项时补选新末项（对齐原版removeItems的末项分支）", async () => {
  const screen = await render(<StackLayout options={[...OPTIONS]} value="b" />);
  await screen.rerender(<StackLayout options={[OPTIONS[0]]} value="b" />);
  expect(getPages(screen)[0]).toHaveClass("oo-ui-pageLayout-active");
});
