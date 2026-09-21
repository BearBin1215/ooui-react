import { createRef, useState, type Ref } from "react";
import { expect, it, vi } from "vitest";
import { render } from "vitest-browser-react";
import { getTestId } from "../testing";
import { useCleanId, useLatestRef, useMergedRefs } from "./refs";

/** 把首次渲染时的合并回调身份记入state，渲染出"跨渲染是否仍是同一引用"的判定 */
function MergeHarness({
  objectRef,
  fnRef,
}: {
  objectRef: Ref<HTMLDivElement>;
  fnRef: (node: HTMLDivElement | null) => void;
}) {
  const merged = useMergedRefs(objectRef, fnRef);
  // 惰性初始化：直接传函数会被useState当作initializer调用，故须包一层
  const [firstMerged] = useState(() => merged);
  return (
    <div
      data-testid="node"
      data-same-ref={firstMerged === merged ? "yes" : "no"}
      ref={merged}
    />
  );
}

/** useLatestRef的契约是"渲染期即同步为最新值"，故把读取结果渲染进DOM */
function LatestHarness({ value }: { value: string }) {
  const latest = useLatestRef(value);
  return <span data-testid="latest">{latest.current}</span>;
}

function IdHarness() {
  return <span data-testid="id">{useCleanId()}</span>;
}

const getIds = (screen: { container: Element }) =>
  [...screen.container.querySelectorAll<HTMLElement>('[data-testid="id"]')].map(
    (el) => el.textContent!,
  );

/**
 * refs.ts的三个机制件：useMergedRefs（多ref合并，回调跨渲染稳定）、
 * useLatestRef（渲染期同步最新值）、useCleanId（不含冒号的id片段）。
 */
it("useMergedRefs：对象ref与函数ref同时写入，卸载时以null通知两者", async () => {
  const objectRef = createRef<HTMLDivElement>();
  const fnRef = vi.fn<(node: HTMLDivElement | null) => void>();
  const screen = await render(<MergeHarness objectRef={objectRef} fnRef={fnRef} />);
  const node = getTestId(screen, "node");
  expect(objectRef.current).toBe(node);
  expect(fnRef).toHaveBeenCalledWith(node);

  await screen.unmount();
  expect(objectRef.current).toBeNull();
  expect(fnRef).toHaveBeenLastCalledWith(null);
});

it("useMergedRefs：返回的回调引用跨渲染稳定（避免每渲染detach/attach）", async () => {
  const objectRef = createRef<HTMLDivElement>();
  const fnRef = vi.fn<(node: HTMLDivElement | null) => void>();
  const screen = await render(<MergeHarness objectRef={objectRef} fnRef={fnRef} />);
  await screen.rerender(<MergeHarness objectRef={objectRef} fnRef={fnRef} />);
  // 主断言是下方的"函数ref只被调用一次"（身份不稳会再走一轮null+node），
  // data-same-ref的引用身份比较为辅证
  expect(getTestId(screen, "node")).toHaveAttribute("data-same-ref", "yes");
  // 引用稳定使React不为新的ref回调重挂：函数ref只被调用一次（挂载）
  expect(fnRef).toHaveBeenCalledTimes(1);
});

it("useLatestRef：渲染期即读到最新值", async () => {
  const screen = await render(<LatestHarness value="甲" />);
  expect(getTestId(screen, "latest").textContent).toBe("甲");
  await screen.rerender(<LatestHarness value="乙" />);
  expect(getTestId(screen, "latest").textContent).toBe("乙");
});

it("useCleanId：id片段不含CSS选择器非法的冒号，跨渲染稳定且各实例互不相同", async () => {
  const screen = await render(
    <>
      <IdHarness />
      <IdHarness />
    </>,
  );
  const first = getIds(screen);
  expect(first).toHaveLength(2);
  expect(first[0]).not.toContain(":");
  expect(first[1]).not.toContain(":");
  expect(first[0]).not.toBe(first[1]);

  await screen.rerender(
    <>
      <IdHarness />
      <IdHarness />
    </>,
  );
  expect(getIds(screen)).toEqual(first);
});
