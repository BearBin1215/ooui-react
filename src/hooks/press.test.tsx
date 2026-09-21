import { useEffect, useState } from "react";
import { expect, it, vi } from "vitest";
import { render } from "vitest-browser-react";
import { getTestId, tick } from "../testing";
import { useOptionRegistry, usePressedState } from "./press";

/** 按压目标经`data-v`从事件目标就近解析（对齐Tool组经data-tool-name反查的真实用法） */
function PressHarness({
  disabled,
  canPress,
  onTrigger,
}: {
  disabled?: boolean;
  canPress?: (target: string) => boolean;
  onTrigger?: (target: string) => void;
}) {
  const press = usePressedState<string>({
    disabled,
    resolveTarget: (node) =>
      node instanceof Element
        ? (node.closest<HTMLElement>("[data-v]")?.dataset.v ?? null)
        : null,
    canPress,
    onTrigger,
  });
  return (
    <div
      data-testid="root"
      data-pressed={press.pressed ? "yes" : "no"}
      data-target={press.pressedTarget ?? ""}
      onMouseDown={press.onMouseDown}
      onMouseUp={press.onMouseUp}
      onKeyDown={press.onKeyDown}
      onKeyUp={press.onKeyUp}
    >
      <span data-v="a">A</span>
      <span data-v="b">B</span>
    </div>
  );
}

const getHarnessRoot = (screen: { container: Element }) => getTestId(screen, "root");
const getItem = (screen: { container: Element }, value: string) =>
  getHarnessRoot(screen).querySelector<HTMLElement>(`[data-v="${value}"]`)!;
const mouse = (el: Element, type: "mousedown" | "mouseup", init: MouseEventInit = {}) =>
  el.dispatchEvent(new MouseEvent(type, { bubbles: true, cancelable: true, ...init }));
const key = (
  el: Element,
  type: "keydown" | "keyup",
  keyName: string,
  init: KeyboardEventInit = {},
) =>
  el.dispatchEvent(
    new KeyboardEvent(type, { key: keyName, bubbles: true, cancelable: true, ...init }),
  );

/**
 * press.ts的usePressedState：Button/Tool组共用的按压流。
 * 可观察契约：仅左键与Enter/空格进入按压、长按repeat不重复进入（否则keyup时onTrigger
 * 会N次齐触发）、释放须落在发起目标上才触发onTrigger、准入校验（canPress）与disabled
 * 的提前返回、document级监听使目标外释放也能复位。
 */
it("非左键按下不进入按压态", async () => {
  const screen = await render(<PressHarness />);
  mouse(getItem(screen, "a"), "mousedown", { button: 2 });
  await tick();
  expect(getHarnessRoot(screen).dataset.pressed).toBe("no");
});

it("左键按下进入按压态；在发起目标上释放时复位并触发onTrigger", async () => {
  const onTrigger = vi.fn<(target: string) => void>();
  const screen = await render(<PressHarness onTrigger={onTrigger} />);
  mouse(getItem(screen, "a"), "mousedown");
  await tick();
  expect(getHarnessRoot(screen).dataset.pressed).toBe("yes");
  expect(getHarnessRoot(screen).dataset.target).toBe("a");

  mouse(getItem(screen, "a"), "mouseup");
  await tick();
  expect(onTrigger).toHaveBeenCalledWith("a");
  expect(onTrigger).toHaveBeenCalledOnce();
  expect(getHarnessRoot(screen).dataset.pressed).toBe("no");
});

it("释放落在另一目标上：按压态复位但不触发onTrigger", async () => {
  const onTrigger = vi.fn<(target: string) => void>();
  const screen = await render(<PressHarness onTrigger={onTrigger} />);
  mouse(getItem(screen, "a"), "mousedown");
  mouse(getItem(screen, "b"), "mouseup");
  await tick();
  expect(onTrigger).not.toHaveBeenCalled();
  expect(getHarnessRoot(screen).dataset.pressed).toBe("no");
});

it("键盘Enter：长按repeat不重复进入按压流，keyup只触发一次onTrigger", async () => {
  const onTrigger = vi.fn<(target: string) => void>();
  const screen = await render(<PressHarness onTrigger={onTrigger} />);
  const item = getItem(screen, "a");
  key(item, "keydown", "Enter");
  key(item, "keydown", "Enter", { repeat: true });
  await tick();
  expect(getHarnessRoot(screen).dataset.pressed).toBe("yes");

  key(item, "keyup", "Enter");
  await tick();
  expect(onTrigger).toHaveBeenCalledOnce();
  expect(onTrigger).toHaveBeenCalledWith("a");
});

it("keyup的键与发起键不一致时不触发onTrigger（并发流按发起键匹配）", async () => {
  const onTrigger = vi.fn<(target: string) => void>();
  const screen = await render(<PressHarness onTrigger={onTrigger} />);
  const item = getItem(screen, "a");
  key(item, "keydown", "Enter");
  key(item, "keyup", " ");
  await tick();
  expect(onTrigger).not.toHaveBeenCalled();
});

it("canPress拒绝与disabled：按下不进入按压态，释放也不触发", async () => {
  const onTrigger = vi.fn<(target: string) => void>();
  const rejected = await render(
    <PressHarness onTrigger={onTrigger} canPress={() => false} />,
  );
  mouse(getItem(rejected, "a"), "mousedown");
  mouse(getItem(rejected, "a"), "mouseup");
  await tick();
  expect(getHarnessRoot(rejected).dataset.pressed).toBe("no");
  expect(onTrigger).not.toHaveBeenCalled();

  const disabled = await render(<PressHarness onTrigger={onTrigger} disabled />);
  mouse(getItem(disabled, "a"), "mousedown");
  await tick();
  expect(getHarnessRoot(disabled).dataset.pressed).toBe("no");
});

/**
 * useOptionRegistry的消费方：条目按values渲染并以ref注册；索引快照与定位结果经
 * DOM与回调对外呈现（避免在渲染期改写传入的容器，故不向外部ref发布内部状态）
 */
function RegistryHarness({
  values,
  onLocate,
}: {
  values: string[];
  onLocate: (value: string | null) => void;
}) {
  const registry = useOptionRegistry(values);
  const callbackB = registry.registerItem("b");
  // 惰性初始化：直接传函数会被useState当作initializer调用，故须包一层
  const [firstCallbackB] = useState(() => callbackB);
  // 登记（挂载期的ref回调）与淘汰（hook内部effect）都在渲染后完成，故索引快照经effect同步；
  // registry每次渲染都是新对象，故本effect每轮渲染都跑——快照同值时setState自动bail out
  const [indexKeys, setIndexKeys] = useState("");
  useEffect(() => {
    setIndexKeys([...registry.itemRefs.current.keys()].join(","));
  }, [values, registry]);
  return (
    <div
      data-testid="outer"
      data-b-stable={firstCallbackB === callbackB ? "yes" : "no"}
      data-index-keys={indexKeys}
      onMouseDown={(event) => onLocate(registry.findItemFromNode(event.target))}
    >
      {values.map((value) => (
        <div key={value} ref={registry.registerItem(value)} data-testid={`item-${value}`}>
          <span data-testid={`child-${value}`}>{value}</span>
        </div>
      ))}
      <span data-testid="outside">链外</span>
    </div>
  );
}

/**
 * press.ts的useOptionRegistry：选项DOM的双向索引。
 * 契约：同值的ref回调跨渲染复用（避免每渲染detach/attach）、值移除后索引随之淘汰、
 * findItemFromNode沿祖先链由子节点反查选项值（链外节点返回null）。
 */
it("registerItem：同值回调跨渲染复用；值移除后索引随之淘汰", async () => {
  const noop = () => {};
  const screen = await render(<RegistryHarness values={["a", "b"]} onLocate={noop} />);
  // 淘汰契约在DOM上无等价可观察物（索引与回调缓存只维护在hook内部的ref里，press.ts
  // 有意不向外部暴露内部状态），故在harness内读快照，勿改为外部可观察断言
  expect(getTestId(screen, "outer")).toHaveAttribute("data-index-keys", "a,b");

  await screen.rerender(<RegistryHarness values={["a", "b"]} onLocate={noop} />);
  expect(getTestId(screen, "outer")).toHaveAttribute("data-b-stable", "yes");
  expect(getTestId(screen, "outer")).toHaveAttribute("data-index-keys", "a,b");

  await screen.rerender(<RegistryHarness values={["b"]} onLocate={noop} />);
  await tick();
  expect(getTestId(screen, "outer")).toHaveAttribute("data-index-keys", "b");
  // 仍在渲染的值其回调继续复用（淘汰只发生在值被移除时）
  expect(getTestId(screen, "outer")).toHaveAttribute("data-b-stable", "yes");
});

it("findItemFromNode：由子孙节点沿祖先链反查选项值，链外节点返回null", async () => {
  const onLocate = vi.fn<(value: string | null) => void>();
  const screen = await render(
    <RegistryHarness values={["a", "b"]} onLocate={onLocate} />,
  );
  mouse(getTestId(screen, "child-b"), "mousedown");
  expect(onLocate).toHaveBeenLastCalledWith("b");

  mouse(getTestId(screen, "outside"), "mousedown");
  expect(onLocate).toHaveBeenLastCalledWith(null);
});
