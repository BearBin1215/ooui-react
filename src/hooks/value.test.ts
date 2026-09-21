import { describe, expect, it } from "vitest";
import { resolveLayoutSelection } from "./value";

/**
 * value.ts纯函数的契约测试。resolveLayoutSelection是IndexLayout/BookletLayout共用的
 * 激活值派生：有效值原样、缺失（首次无值）或失效（不在新options内，如页被移除）时按
 * `fallback`给定的**原版**语义回退（IndexLayout首个可选 / BookletLayout随stack的
 * 后一项→末项），且失效回退须以**上一轮**的options为定位依据（失效值可能已不在新列表中）。
 */
describe("resolveLayoutSelection（布局激活值的缺失/失效回退）", () => {
  const pages = (...values: string[]) => values.map((value) => ({ value }));

  it("options为空时返回undefined（无可用激活项，即使原值非空）", () => {
    expect(
      resolveLayoutSelection("b", [], pages("a", "b"), "firstSelectable"),
    ).toBeUndefined();
    expect(resolveLayoutSelection(undefined, [], [], "nextThenLast")).toBeUndefined();
  });

  it("值缺失（首次无值）时取首个非禁用项（对齐原版findFirstSelectableItem）", () => {
    expect(
      resolveLayoutSelection(undefined, pages("a", "b"), [], "firstSelectable"),
    ).toBe("a");
    expect(
      resolveLayoutSelection(
        undefined,
        [{ value: "a", disabled: true }, { value: "b" }],
        [],
        "nextThenLast",
      ),
    ).toBe("b");
  });

  it("值有效（在新options内）时原样返回，不做回退", () => {
    expect(
      resolveLayoutSelection("c", pages("a", "b", "c"), pages("a"), "firstSelectable"),
    ).toBe("c");
    expect(
      resolveLayoutSelection("c", pages("a", "b", "c"), pages("a"), "nextThenLast"),
    ).toBe("c");
  });

  describe("fallback=firstSelectable（IndexLayout：对齐selectFirstSelectableTabPanel）", () => {
    it("失效时取首个非禁用项，而非邻近项", () => {
      // 移除乙后剩甲/丙：首个可选是甲（原「原位置」口径也会取丙，已按原版改为甲）
      expect(
        resolveLayoutSelection(
          "b",
          pages("a", "c"),
          pages("a", "b", "c"),
          "firstSelectable",
        ),
      ).toBe("a");
    });

    it("首项被禁用时跳到下一个可选页签；全禁用时不选中（undefined）", () => {
      expect(
        resolveLayoutSelection(
          "c",
          [{ value: "a", disabled: true }, { value: "b" }],
          pages("a", "b", "c"),
          "firstSelectable",
        ),
      ).toBe("b");
      expect(
        resolveLayoutSelection(
          "c",
          [
            { value: "a", disabled: true },
            { value: "b", disabled: true },
          ],
          pages("a", "b", "c"),
          "firstSelectable",
        ),
      ).toBeUndefined();
    });
  });

  describe("fallback=nextThenLast（BookletLayout：对齐StackLayout.removeItems）", () => {
    it("失效时取旧列表原位置向后的首个幸存项（=原版「下一个未被移除项」）", () => {
      // 移除甲后按旧列表向后取乙（新列表同下标处是替换项x，非原版语义）
      expect(
        resolveLayoutSelection(
          "a",
          pages("x", "b", "c"),
          pages("a", "b", "c"),
          "nextThenLast",
        ),
      ).toBe("b");
      // 连续移除时跳过被移除项：移除乙丙后，激活乙→取丁
      expect(
        resolveLayoutSelection(
          "b",
          pages("a", "d"),
          pages("a", "b", "c", "d"),
          "nextThenLast",
        ),
      ).toBe("d");
      // 批量移除（当前项之前也有项被移除）：新列表同下标是丁，原版按旧列表向后取丙
      expect(
        resolveLayoutSelection(
          "b",
          pages("c", "d"),
          pages("a", "b", "c", "d"),
          "nextThenLast",
        ),
      ).toBe("c");
    });

    it("被移除的是末项时取新末项（原版nextItem为空→items[length-1]）", () => {
      expect(
        resolveLayoutSelection(
          "c",
          pages("a", "b"),
          pages("a", "b", "c"),
          "nextThenLast",
        ),
      ).toBe("b");
    });

    it("无历史位置可依（值从未在列表中）时按首个可选处理", () => {
      expect(
        resolveLayoutSelection("z", pages("a", "b"), pages("a", "b"), "nextThenLast"),
      ).toBe("a");
    });
  });

  it("数值型值同样按同一回退规则处理", () => {
    const options = [{ value: 1 }, { value: 2 }];
    expect(
      resolveLayoutSelection(
        2,
        options,
        [{ value: 1 }, { value: 2 }, { value: 3 }],
        "nextThenLast",
      ),
    ).toBe(2);
    expect(
      resolveLayoutSelection(
        3,
        options,
        [{ value: 1 }, { value: 2 }, { value: 3 }],
        "nextThenLast",
      ),
    ).toBe(2);
    expect(resolveLayoutSelection(undefined, options, [], "firstSelectable")).toBe(1);
  });
});
