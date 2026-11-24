import { expect, it } from "vitest";
import {
  normalizePromotableSets,
  promotedSelectionsEqual,
  promotionSignature,
  resolvePromotedTools,
  type PromotableGroupPlan,
} from "./promotion";

/** 便捷构造单个工具组的测量结果（只有宽度相关的字段随用例变化；组宽扣除另设用例） */
const plan = (overrides: Partial<PromotableGroupPlan> = {}): PromotableGroupPlan => ({
  itemNames: ["a", "b", "c"],
  sets: [["a"], ["b"], ["c"]],
  toolWidths: [10, 10, 10],
  toolMargins: [0, 0, 0],
  containerWidth: 0,
  groupWidth: 0,
  ...overrides,
});

/**
 * 工具提升的纯计算层：promoteToBar 归一化与「按可用宽度选提升集」的宽度累计规则
 * （对齐原版 Toolbar.getPromotedToolCount / updatePromotedTools 的判定路径）。
 */
it("normalizePromotableSets：字符串与数组形态归一为按声明顺序的集合", () => {
  expect(normalizePromotableSets("a", ["a", "b"])).toEqual([["a"]]);
  expect(normalizePromotableSets(["a", "b"], ["a", "b"])).toEqual([["a"], ["b"]]);
  // 嵌套数组为一组整体提升
  expect(normalizePromotableSets([["a", "b"], "c"], ["a", "b", "c"])).toEqual([
    ["a", "b"],
    ["c"],
  ]);
});

it("normalizePromotableSets：忽略组内不存在的名字与重复工具，空集合不占位", () => {
  expect(normalizePromotableSets(["x", ["y", "a"], ["b", "x"]], ["a", "b"])).toEqual([
    ["a"],
    ["b"],
  ]);
  // 同一工具只归入首个命中的集合（对齐原版 used 去重）
  expect(normalizePromotableSets([["a", "b"], "b"], ["a", "b"])).toEqual([["a", "b"]]);
  expect(normalizePromotableSets(undefined, ["a"])).toEqual([]);
  expect(normalizePromotableSets([], ["a"])).toEqual([]);
});

it("normalizePromotableSets：同一集合内的重复名只保留首次", () => {
  // 原版 ToolFactory.extract 边遍历边写 used（oojs-ui.js:22465-22522），集合内重复名只留一个
  expect(normalizePromotableSets([["a", "a"]], ["a"])).toEqual([["a"]]);
  expect(normalizePromotableSets([["a", "b", "a"]], ["a", "b"])).toEqual([["a", "b"]]);
});

it("resolvePromotedTools：按累计宽度决定提升数量，只停在集合边界", () => {
  const groups = [plan()];
  // 每个工具 10px、基准 0：可用 25px 只能放下两个
  expect(resolvePromotedTools(groups, 0, 25)).toEqual([
    { groupIndex: 0, names: ["a"] },
    { groupIndex: 0, names: ["b"] },
  ]);
  // 判定为严格小于：恰好等于累计宽不算放下
  expect(resolvePromotedTools(groups, 0, 20)).toEqual([{ groupIndex: 0, names: ["a"] }]);
  expect(resolvePromotedTools(groups, 0, 10)).toEqual([]);
});

it("resolvePromotedTools：嵌套集合整组提升，容不下整组则一个都不提升", () => {
  const groups = [plan({ sets: [["a", "b"], ["c"]] })];
  // 放宽到 21px：整组 [a,b] 放得下、[c] 放不下
  expect(resolvePromotedTools(groups, 0, 21)).toEqual([
    { groupIndex: 0, names: ["a", "b"] },
  ]);
  // 15px：只要 20px 的整组 [a,b] 放不下，即使单个工具放得下也不提升
  expect(resolvePromotedTools(groups, 0, 15)).toEqual([]);
});

it("resolvePromotedTools：扣除第一个提升工具的分隔边距", () => {
  // 两个工具各 12px 外宽、各含 2px 边距：第一个不带分隔边距，实际占宽 10px
  const groups = [
    plan({ sets: [["a"], ["b"]], toolWidths: [12, 12], toolMargins: [2, 2] }),
  ];
  expect(resolvePromotedTools(groups, 0, 11)).toEqual([{ groupIndex: 0, names: ["a"] }]);
  // 若未扣除边距，22px 才会判为放不下一个工具
  expect(resolvePromotedTools(groups, 0, 10)).toEqual([]);
});

it("resolvePromotedTools：全部工具被提升时扣除组自身宽度", () => {
  const groups = [
    plan({
      itemNames: ["a", "b"],
      sets: [["a", "b"]],
      toolWidths: [10, 10],
      toolMargins: [0, 0],
      groupWidth: 30,
    }),
  ];
  // 提升后宽 20px，但组隐藏让出 30px，实际总宽 -10px
  expect(resolvePromotedTools(groups, 0, 1)).toEqual([
    { groupIndex: 0, names: ["a", "b"] },
  ]);
  // 组内还有未提升的工具（itemNames 比可提升工具多）时不扣组宽
  const partial = [plan({ itemNames: ["a", "b", "x"], sets: [["a", "b"]] })];
  expect(resolvePromotedTools(partial, 0, 1)).toEqual([]);
});

it("resolvePromotedTools：多组按组顺序、共享基准宽与容器附加宽", () => {
  const groups = [
    plan({
      itemNames: ["a"],
      sets: [["a"]],
      toolWidths: [10],
      toolMargins: [0],
      containerWidth: 5,
      groupWidth: 0,
    }),
    plan({
      itemNames: ["b"],
      sets: [["b"]],
      toolWidths: [10],
      toolMargins: [0],
      containerWidth: 5,
      groupWidth: 0,
    }),
  ];
  // 可用 30px：第一组提升后 15px 放得下，第二组累计 30px 不满足严格小于
  expect(resolvePromotedTools(groups, 20, 50)).toEqual([{ groupIndex: 0, names: ["a"] }]);
  // 可用 40px：两组都放得下
  expect(resolvePromotedTools(groups, 20, 60)).toEqual([
    { groupIndex: 0, names: ["a"] },
    { groupIndex: 1, names: ["b"] },
  ]);
});

it("resolvePromotedTools：多组各自扣除本组首个提升工具的边距", () => {
  // 两组各一个 10px 外宽的工具、边距 5 / 7：可提升工具宽按组内下标取，占宽应为
  // (10-5)+(10-7)=8；按全局下标会取不到第二组的边距（按 0 计）而算成 15
  const groups = [
    plan({ itemNames: ["a"], sets: [["a"]], toolWidths: [10], toolMargins: [5] }),
    plan({ itemNames: ["b"], sets: [["b"]], toolWidths: [10], toolMargins: [7] }),
  ];
  expect(resolvePromotedTools(groups, 0, 12)).toEqual([
    { groupIndex: 0, names: ["a"] },
    { groupIndex: 1, names: ["b"] },
  ]);
  // 恰好等于累计宽仍不算放下
  expect(resolvePromotedTools(groups, 0, 8)).toEqual([{ groupIndex: 0, names: ["a"] }]);
});

it("promotionSignature：声明序号、工具顺序与可提升集合任一变化即变", () => {
  const base = { order: 0, itemNames: ["a", "b"], sets: [["a"], ["b"]] };
  expect(promotionSignature(base)).toBe(promotionSignature({ ...base }));
  expect(promotionSignature({ ...base, order: 1 })).not.toBe(promotionSignature(base));
  expect(promotionSignature({ ...base, itemNames: ["b", "a"] })).not.toBe(
    promotionSignature(base),
  );
  expect(promotionSignature({ ...base, sets: [["a", "b"]] })).not.toBe(
    promotionSignature(base),
  );
});

it("promotedSelectionsEqual：按组键与工具名集合逐项比较", () => {
  const key = {};
  expect(promotedSelectionsEqual(new Map(), new Map())).toBe(true);
  expect(
    promotedSelectionsEqual(
      new Map([[key, new Set(["a"])]]),
      new Map([[key, new Set(["a"])]]),
    ),
  ).toBe(true);
  expect(
    promotedSelectionsEqual(
      new Map([[key, new Set(["a"])]]),
      new Map([[key, new Set(["b"])]]),
    ),
  ).toBe(false);
  expect(promotedSelectionsEqual(new Map([[key, new Set(["a"])]]), new Map())).toBe(
    false,
  );
});
