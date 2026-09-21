import { describe, expect, it } from "vitest";
import { pickValidTags, tagMatchText } from "./tagModel";

/**
 * TagMultiselect的纯函数契约：tagMatchText的纯文本轴（过滤键与回填分离）与
 * pickValidTags的合法子集过滤（对齐原版getValue返回过滤后子集的形态）
 */
describe("tagMatchText（标签纯文本轴）", () => {
  it("labelText优先，字符串label次之", () => {
    expect(tagMatchText({ value: "a", labelText: "甲" })).toBe("甲");
    expect(tagMatchText({ value: "a", label: "乙" })).toBe("乙");
    expect(tagMatchText({ value: "a", label: "乙", labelText: "甲" })).toBe("甲");
  });

  it("富内容label且未给labelText时返回undefined（过滤方排除、回填方以值兜底）", () => {
    expect(tagMatchText({ value: "a", label: 0 })).toBeUndefined();
    expect(tagMatchText({ value: "a" })).toBeUndefined();
    expect(tagMatchText(undefined)).toBeUndefined();
  });
});

describe("pickValidTags（合法子集）", () => {
  it("剔除值域外的值；不允许重复时重复项保留首个", () => {
    expect(pickValidTags(["a", "b", "a"], { allowedValues: ["a"] })).toEqual(["a"]);
    expect(pickValidTags(["a", "x", "a", "b"], { allowedValues: ["a", "x"] })).toEqual([
      "a",
      "x",
    ]);
  });

  it("allowDuplicates重复全保留，allowArbitrary跳过值域判定", () => {
    expect(
      pickValidTags(["a", "a"], { allowedValues: ["a"], allowDuplicates: true }),
    ).toEqual(["a", "a"]);
    expect(pickValidTags(["a", "z"], { allowArbitrary: true })).toEqual(["a", "z"]);
    expect(pickValidTags(["a", "z"], {})).toEqual([]);
  });
});
