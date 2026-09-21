import { expect, it, vi } from "vitest";
import { render } from "vitest-browser-react";
import { getRoot, pressMouse, tick } from "../../testing";
import { OutlineSelect } from ".";

const OPTIONS = [
  { children: "一级", value: "a" },
  { children: "二级", value: "b", level: 1 },
  { children: "越界层级", value: "c", level: 9 },
];

const getOutlineOptions = (screen: { container: Element }) => [
  ...getRoot(screen).querySelectorAll<HTMLElement>(".oo-ui-outlineOptionWidget"),
];

/**
 * OutlineSelect（对齐原版OO.ui.OutlineSelectWidget）的浏览器渲染契约：
 * 在Select基础上锁定大纲形态——outline恒开（选项渲染为OutlineOption）、
 * level缩进类（超出钳制到主题定义的三级）、选择交互照常。
 */
it("结构：outlineSelect类 + Select的listbox，选项渲染为OutlineOption", async () => {
  const screen = await render(<OutlineSelect options={OPTIONS} />);
  const root = getRoot(screen);
  expect(root).toHaveClass("oo-ui-outlineSelectWidget");
  expect(root).toHaveClass("oo-ui-selectWidget");
  expect(root).toHaveAttribute("role", "listbox");
  // 原版OutlineSelectWidget混入TabIndexedElement，根可聚焦（tabindex=0），与不混入的SelectWidget相反
  expect(root).toHaveAttribute("tabindex", "0");
  expect(getOutlineOptions(screen)).toHaveLength(3);
});

it("level缩进：输出level-N类，超出主题定义的三级被钳制", async () => {
  const screen = await render(<OutlineSelect options={OPTIONS} />);
  const options = getOutlineOptions(screen);
  expect(options[0]).toHaveClass("oo-ui-outlineOptionWidget-level-0");
  expect(options[1]).toHaveClass("oo-ui-outlineOptionWidget-level-1");
  expect(options[2]).toHaveClass("oo-ui-outlineOptionWidget-level-2");
});

it("选择交互照常：点击选定并回调onChange，className透传", async () => {
  const onChange = vi.fn<(value: string | number) => void>();
  const screen = await render(
    <OutlineSelect options={OPTIONS} className="custom" onChange={onChange} />,
  );
  const root = getRoot(screen);
  expect(root).toHaveClass("custom");

  pressMouse(getOutlineOptions(screen)[1]!);
  await tick();
  expect(onChange).toHaveBeenCalledWith("b");
  expect(getOutlineOptions(screen)[1]).toHaveClass("oo-ui-optionWidget-selected");
});
