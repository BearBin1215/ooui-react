import type { KeyboardEvent } from "react";
import { describe, expect, it, vi } from "vitest";
import { useGroupKeyboardSelection } from "./menu";

/**
 * menu.ts的useGroupKeyboardSelection（契约与原版锚点见该hook的jsdoc）：本hook不调用
 * React Hook、返回读取入参的纯闭包，故可在node环境直接构造伪事件调用
 */
describe("useGroupKeyboardSelection（直选型选项组的方向键改选）", () => {
  /** 构造一个可断言preventDefault/stopPropagation调用情况的伪键盘事件 */
  function keyEvent(key: string) {
    return {
      key,
      preventDefault: vi.fn<() => void>(),
      stopPropagation: vi.fn<() => void>(),
    } as unknown as KeyboardEvent<HTMLElement> & {
      preventDefault: ReturnType<typeof vi.fn>;
      stopPropagation: ReturnType<typeof vi.fn>;
    };
  }

  /**
   * 建处理器、派发一个按键，返回onCommit与事件对象供断言。
   * 命名带use前缀只为通过rules-of-hooks的调用位置校验。
   */
  function useGroupKeys(
    key: string,
    config: {
      disabled?: boolean;
      selectableValues: (string | number)[];
      value?: string | number;
    },
  ) {
    const onCommit = vi.fn<(value: string | number) => void>();
    const { disabled, selectableValues, value } = config;
    const event = keyEvent(key);
    useGroupKeyboardSelection({ disabled, selectableValues, value, onCommit })(event);
    return { onCommit, event };
  }

  const letters = ["a", "b", "c"];

  it("↓/→改选后一项，↑/←改选前一项（四键同义，仅方向不同）", () => {
    expect(
      useGroupKeys("ArrowDown", { selectableValues: letters, value: "a" }).onCommit,
    ).toHaveBeenCalledWith("b");
    expect(
      useGroupKeys("ArrowRight", { selectableValues: letters, value: "a" }).onCommit,
    ).toHaveBeenCalledWith("b");
    expect(
      useGroupKeys("ArrowUp", { selectableValues: letters, value: "b" }).onCommit,
    ).toHaveBeenCalledWith("a");
    expect(
      useGroupKeys("ArrowLeft", { selectableValues: letters, value: "b" }).onCommit,
    ).toHaveBeenCalledWith("a");
  });

  it("方向键在首末项环绕（原版SelectWidget的环绕语义，非钳制）", () => {
    expect(
      useGroupKeys("ArrowDown", { selectableValues: letters, value: "c" }).onCommit,
    ).toHaveBeenCalledWith("a");
    expect(
      useGroupKeys("ArrowUp", { selectableValues: letters, value: "a" }).onCommit,
    ).toHaveBeenCalledWith("c");
  });

  it("无选中项时↓自首项、↑自末项起步", () => {
    expect(
      useGroupKeys("ArrowDown", { selectableValues: letters }).onCommit,
    ).toHaveBeenCalledWith("a");
    expect(
      useGroupKeys("ArrowUp", { selectableValues: letters }).onCommit,
    ).toHaveBeenCalledWith("c");
  });

  it("Enter重申当前选中项：消费按键但不提交（值未变化）", () => {
    const { onCommit, event } = useGroupKeys("Enter", {
      selectableValues: letters,
      value: "b",
    });
    expect(onCommit).not.toHaveBeenCalled();
    expect(event.preventDefault).toHaveBeenCalledTimes(1);
  });

  it("Enter在无选中项时不响应（既不提交也不消费）", () => {
    const { onCommit, event } = useGroupKeys("Enter", { selectableValues: letters });
    expect(onCommit).not.toHaveBeenCalled();
    expect(event.preventDefault).not.toHaveBeenCalled();
  });

  it("方向键改选时消费按键（preventDefault + stopPropagation）", () => {
    const { event } = useGroupKeys("ArrowDown", {
      selectableValues: letters,
      value: "a",
    });
    expect(event.preventDefault).toHaveBeenCalledTimes(1);
    expect(event.stopPropagation).toHaveBeenCalledTimes(1);
  });

  it("组内仅一个可选值时方向键环绕回自身：消费但不提交", () => {
    const { onCommit, event } = useGroupKeys("ArrowDown", {
      selectableValues: ["only"],
      value: "only",
    });
    expect(onCommit).not.toHaveBeenCalled();
    expect(event.preventDefault).toHaveBeenCalledTimes(1);
  });

  it("组禁用时任何按键都不响应", () => {
    const { onCommit, event } = useGroupKeys("ArrowDown", {
      disabled: true,
      selectableValues: letters,
      value: "a",
    });
    expect(onCommit).not.toHaveBeenCalled();
    expect(event.preventDefault).not.toHaveBeenCalled();
  });

  it("可选值为空序列时任何按键都不响应", () => {
    const { onCommit, event } = useGroupKeys("Enter", { selectableValues: [] });
    expect(onCommit).not.toHaveBeenCalled();
    expect(event.preventDefault).not.toHaveBeenCalled();
  });

  it.each(["Home", "End", "PageUp", "PageDown", "a", "Escape", "Tab"])(
    "不消费%s（对齐static.handleNavigationKeys=false）",
    (key) => {
      const { onCommit, event } = useGroupKeys(key, {
        selectableValues: letters,
        value: "a",
      });
      expect(onCommit).not.toHaveBeenCalled();
      expect(event.preventDefault).not.toHaveBeenCalled();
      expect(event.stopPropagation).not.toHaveBeenCalled();
    },
  );

  it("数值型值同样按同一规则改选", () => {
    const numbers = [1, 2, 3];
    expect(
      useGroupKeys("ArrowDown", { selectableValues: numbers, value: 2 }).onCommit,
    ).toHaveBeenCalledWith(3);
    expect(
      useGroupKeys("ArrowUp", { selectableValues: numbers, value: 1 }).onCommit,
    ).toHaveBeenCalledWith(3);
  });
});
