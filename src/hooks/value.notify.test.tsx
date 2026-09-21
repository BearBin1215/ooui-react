import { describe, expect, it, vi } from "vitest";
import { render } from "vitest-browser-react";
import { tick } from "../testing";
import { useControlledValueNotify } from "./value";

/**
 * value.ts的useControlledValueNotify：受控值非法时把生效值回写父级。
 * 该hook含useEffect，经vitest-browser-react真实渲染驱动effect。核心契约：
 * 同一非法值只回写一次（父级未采纳时不因重渲染反复触发），但闩锁在受控值回到合法后
 * 解除——父级改传合法值再改回同一非法值是新的变更，须重新回写，否则父级state与
 * 组件显示值就此漂移。
 */

function Harness({
  controlled,
  effective,
  onNotify,
}: {
  controlled?: string;
  effective?: string;
  onNotify?: (value: string) => void;
}) {
  useControlledValueNotify(controlled, effective, onNotify);
  return null;
}

describe("useControlledValueNotify（非法受控值的回写守卫）", () => {
  it("受控值非法时回写生效值；父级未采纳（同值重渲染）不重复回写", async () => {
    const onNotify = vi.fn<(value: string) => void>();
    const screen = await render(
      <Harness controlled="a" effective="b" onNotify={onNotify} />,
    );
    await expect.poll(() => onNotify.mock.calls.length).toBe(1);
    expect(onNotify).toHaveBeenCalledWith("b");

    // 父级忽略回写、state保持"a"，外部重渲染后不得再次触发
    await screen.rerender(<Harness controlled="a" effective="b" onNotify={onNotify} />);
    await expect.poll(() => onNotify.mock.calls.length).toBe(1);
  });

  it("父级采纳生效值（受控值回到合法）后不再回写", async () => {
    const onNotify = vi.fn<(value: string) => void>();
    const screen = await render(
      <Harness controlled="a" effective="b" onNotify={onNotify} />,
    );
    await expect.poll(() => onNotify.mock.calls.length).toBe(1);

    // 父级采纳："b"合法，受控值与生效值一致
    await screen.rerender(<Harness controlled="b" effective="b" onNotify={onNotify} />);
    await expect.poll(() => onNotify.mock.calls.length).toBe(1);
  });

  it("回写闩锁在受控值回到合法后解除：改传合法值再改回同一非法值时重新回写", async () => {
    const onNotify = vi.fn<(value: string) => void>();
    const screen = await render(
      <Harness controlled="a" effective="b" onNotify={onNotify} />,
    );
    await expect.poll(() => onNotify.mock.calls.length).toBe(1);

    // 父级改传合法值"c"（闩锁解除），再改回同一非法值"a"——新的受控变更须重新回写
    await screen.rerender(<Harness controlled="c" effective="c" onNotify={onNotify} />);
    await expect.poll(() => onNotify.mock.calls.length).toBe(1);
    await screen.rerender(<Harness controlled="a" effective="b" onNotify={onNotify} />);
    await expect.poll(() => onNotify.mock.calls.length).toBe(2);
    expect(onNotify).toHaveBeenLastCalledWith("b");
  });

  it("改传另一非法值时按新值回写（不同非法值互不共用闩锁）", async () => {
    const onNotify = vi.fn<(value: string) => void>();
    const screen = await render(
      <Harness controlled="a" effective="b" onNotify={onNotify} />,
    );
    await expect.poll(() => onNotify.mock.calls.length).toBe(1);
    await screen.rerender(<Harness controlled="x" effective="b" onNotify={onNotify} />);
    await expect.poll(() => onNotify.mock.calls.length).toBe(2);
  });

  it("无生效值（空选项集）时不回写", async () => {
    const onNotify = vi.fn<(value: string) => void>();
    await render(<Harness controlled="a" effective={undefined} onNotify={onNotify} />);
    // 先让effect跑完再断言零调用：poll(0)的首次检查立即成立，等于没等
    await tick();
    expect(onNotify).not.toHaveBeenCalled();
  });

  it("受控值合法时不触发", async () => {
    const onNotify = vi.fn<(value: string) => void>();
    await render(<Harness controlled="a" effective="a" onNotify={onNotify} />);
    await tick();
    expect(onNotify).not.toHaveBeenCalled();
  });
});
