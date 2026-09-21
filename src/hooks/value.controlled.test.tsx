import { expect, it, vi } from "vitest";
import { render } from "vitest-browser-react";
import { clickElement, getTestId } from "../testing";
import { useControlledValue, useLayoutSelection } from "./value";

/** useControlledValue的宿主：显示当前值，四个按钮分别触发四种提交形态 */
function ValueHarness({
  value,
  defaultValue,
  onChange,
}: {
  value?: string;
  defaultValue?: string;
  onChange?: (value: string, event?: unknown) => void;
}) {
  const {
    value: current,
    commit,
    commitIfChanged,
  } = useControlledValue<string>({ value, defaultValue }, onChange);
  return (
    <div data-testid="root">
      <span data-testid="value">{current ?? ""}</span>
      <button type="button" data-testid="set-b" onClick={() => commit("b")}>
        设为b
      </button>
      {/* 函数式更新：入参取已提交的最新值（经ref读取，非渲染闭包） */}
      <button
        type="button"
        data-testid="append"
        onClick={() => commit((prev) => `${prev}!`)}
      >
        追加
      </button>
      <button
        type="button"
        data-testid="set-same"
        onClick={() => commitIfChanged(current)}
      >
        提交同值
      </button>
      <button type="button" data-testid="set-c" onClick={() => commitIfChanged("c")}>
        提交c
      </button>
    </div>
  );
}

/** useLayoutSelection的宿主：显示生效值，两个按钮走select/selectIfChanged */
function LayoutHarness({
  value,
  defaultValue,
  onChange,
  options,
}: {
  value?: string;
  defaultValue?: string;
  onChange?: (value: string) => void;
  options: { value: string; disabled?: boolean }[];
}) {
  const { effectiveValue, select, selectIfChanged } = useLayoutSelection<string>({
    value,
    defaultValue,
    onChange,
    options,
    fallback: "firstSelectable",
  });
  return (
    <div data-testid="root">
      <span data-testid="effective">{effectiveValue ?? ""}</span>
      <button
        type="button"
        data-testid="select-second"
        onClick={() => select(options[1].value)}
      >
        选第二项
      </button>
      <button
        type="button"
        data-testid="select-same"
        onClick={() => selectIfChanged(effectiveValue as string)}
      >
        选当前项
      </button>
    </div>
  );
}

/**
 * value.ts的useControlledValue：受控/非受控值态与"内部state + 回写通知"管线
 * （十余个组件的value通道共用，故在此以hook级用例锁定，不依赖任一宿主组件）。
 * 刻意约定：**事件缺省时以单参调用onChange**，不向只声明value参的回调附加undefined尾参。
 */
it("受控：commit不改写显示值，仅以新值回调（显示值随value prop）", async () => {
  const onChange = vi.fn<(value: string, event?: unknown) => void>();
  const screen = await render(<ValueHarness value="a" onChange={onChange} />);
  clickElement(getTestId(screen, "set-b"));
  await Promise.resolve();
  expect(getTestId(screen, "value").textContent).toBe("a");
  expect(onChange).toHaveBeenCalledWith("b");
  // 单参调用：第二参缺失时不追加undefined尾参（断言实参个数而非形参）
  expect(onChange.mock.calls[0]).toHaveLength(1);
});

it("非受控：commit同步内部state并回调，函数式更新取最新已提交值", async () => {
  const onChange = vi.fn<(value: string, event?: unknown) => void>();
  const screen = await render(<ValueHarness defaultValue="a" onChange={onChange} />);
  clickElement(getTestId(screen, "set-b"));
  await Promise.resolve();
  expect(getTestId(screen, "value").textContent).toBe("b");

  // 连续两次函数式更新：第二次的prev须是第一次提交后的值（否则两次都基于初始闭包值）
  clickElement(getTestId(screen, "append"));
  await Promise.resolve();
  clickElement(getTestId(screen, "append"));
  await Promise.resolve();
  expect(getTestId(screen, "value").textContent).toBe("b!!");
});

it("commitIfChanged：同值不提交（对齐原版selectItem提前返回），异值照常提交", async () => {
  const onChange = vi.fn<(value: string, event?: unknown) => void>();
  const screen = await render(<ValueHarness defaultValue="a" onChange={onChange} />);
  clickElement(getTestId(screen, "set-same"));
  await Promise.resolve();
  expect(onChange).not.toHaveBeenCalled();

  clickElement(getTestId(screen, "set-c"));
  await Promise.resolve();
  expect(onChange).toHaveBeenCalledOnce();
  expect(onChange).toHaveBeenCalledWith("c");
});

/**
 * value.ts的useLayoutSelection：布局类组件（IndexLayout/BookletLayout）的
 * 生效激活值派生与失效补选，受控时把回退后的生效值经onChange回写父级。
 */
it("受控值失效（不在options内）：生效值回退首个可选，并回写父级一次", async () => {
  const onChange = vi.fn<(value: string) => void>();
  const screen = await render(
    <LayoutHarness
      value="z"
      onChange={onChange}
      options={[{ value: "a" }, { value: "b" }]}
    />,
  );
  expect(getTestId(screen, "effective").textContent).toBe("a");
  // 同一非法值只回写一次（闩锁语义见useControlledValueNotify）
  await vi.waitFor(() => expect(onChange).toHaveBeenCalledTimes(1));
  expect(onChange).toHaveBeenLastCalledWith("a");
});

it("首个可选跳过禁用项；全禁用（无可选项）时生效值为空", async () => {
  // 无value/defaultValue：按「首个非禁用项」派生（对齐原版findFirstSelectableItem）
  const screen = await render(
    <LayoutHarness options={[{ value: "a", disabled: true }, { value: "b" }]} />,
  );
  expect(getTestId(screen, "effective").textContent).toBe("b");

  // 全禁用即「无可选项」：原版选中项为空，故生效值为空（已提交值仍保留，不回退）
  const allDisabled = await render(
    <LayoutHarness
      options={[
        { value: "a", disabled: true },
        { value: "b", disabled: true },
      ]}
    />,
  );
  expect(getTestId(allDisabled, "effective").textContent).toBe("");
});

it("selectIfChanged：同值不回调（对齐原版setPage提前返回），异值回调", async () => {
  const onChange = vi.fn<(value: string) => void>();
  const screen = await render(
    <LayoutHarness
      defaultValue="a"
      onChange={onChange}
      options={[{ value: "a" }, { value: "b" }]}
    />,
  );
  clickElement(getTestId(screen, "select-same"));
  await Promise.resolve();
  expect(onChange).not.toHaveBeenCalled();

  clickElement(getTestId(screen, "select-second"));
  await Promise.resolve();
  expect(onChange).toHaveBeenCalledWith("b");
  expect(getTestId(screen, "effective").textContent).toBe("b");
});
