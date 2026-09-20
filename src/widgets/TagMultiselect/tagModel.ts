/**
 * TagMultiselect的域模型（契约类型 + 标签域纯函数，独立成文件：useTagValues/useTagMenu经此
 * 取用而不反向依赖组件本体形成模块环，对齐Popup/popupLayout.ts的按域组织）。
 * 公开类型与pickValidTags经index.tsx转发导出，公共路径不变
 */

import type { ReactNode } from "react";

/**
 * Input placement: `inline` (at the end of the tag area), `outline` (below the
 * tag area), `none` (no input).
 *
 * 输入框位置：`inline`（标签区末尾）、`outline`（标签区下方）、`none`（无输入）。
 */
export type TagInputPosition = "inline" | "outline" | "none";

/**
 * A tag option: value + display content (shared by the tag chip and the menu item).
 *
 * 标签菜单选项：值 + 显示内容（标签本体与菜单项共用同一 `label`）。
 */
export interface TagOptionProps {
  /**
   * Option value — the identity of a tag. Always a scalar so that the controlled
   * array is serializable and diffable (comparison for value / onChange / drag /
   * validity all key off it).
   *
   * 选项值（标签的身份）。恒为标量，以便受控数组可序列化、可 diff（值/onChange/
   * 拖拽/非法值判定都按它比较）。
   */
  value: string | number;

  /**
   * An arbitrary payload attached to the option. Independent of `value` and not
   * part of equality or the controlled value; the component never reads it, and
   * `onChange` still returns the scalar `value` — look the payload up by `value`
   * in your own `options` array when needed.
   *
   * 该标签关联的任意负载。与身份 `value` 相互独立、不参与相等判定与受控值，
   * 本组件不消费它——`onChange` 仍回传标量 `value`，需取回负载时按 `value` 在
   * 自己的 `options` 数组里反查。
   */
  data?: unknown;

  /**
   * Display content (shared by the tag chip and the menu item); falls back to the
   * value's string form. Accepts a `ReactNode` for rich content; when rich, the
   * plain text needed for filtering / backfill comes from `labelText`.
   *
   * 显示内容（标签本体与菜单项共用），缺省显示值的字符串形态。收 `ReactNode`
   * 以承载富内容；富内容下过滤/回填需要的纯文本由 `labelText` 另给。
   */
  label?: ReactNode;

  /**
   * Plain-text form of `label`, used where a string is required: the menu's
   * prefix-filter match key and the input backfill on choose/edit. Defaults to
   * `label` when `label` is a string. With a rich `label` and no `labelText`, the
   * option does not participate in prefix filtering (backfill still falls back to
   * `String(value)`).
   *
   * `label` 的纯文本形态，用于需要字符串的场合：菜单前缀过滤的匹配键与
   * 选中/编辑标签时回填输入框的文本。`label` 为字符串时缺省取 `label`；富内容
   * 且未提供本字段时该选项**不参与前缀过滤**（回填仍以 `String(value)` 兜底）。
   */
  labelText?: string;

  /**
   * Menu item icon.
   *
   * 菜单项图标。
   */
  icon?: string;

  /**
   * Whether the option is disabled (disabled options cannot be added as tags).
   *
   * 选项禁用（禁用项不可添加为标签）。
   */
  disabled?: boolean;

  /**
   * Whether the corresponding tag is fixed (cannot be removed).
   *
   * 该选项对应的标签固定（不可移除）。
   */
  fixed?: boolean;
}

/**
 * 标签本体与菜单项的显示内容：富内容`label`优先，缺省回退值的字符串形态。
 * 承载显示轴（`ReactNode`），与过滤/回填的纯文本轴（{@link tagMatchText}）分离
 */
export function tagDisplayLabel(
  option: TagOptionProps | undefined,
  value: string | number,
): ReactNode {
  return option?.label ?? String(value);
}

/**
 * 标签的纯文本形态（菜单前缀过滤键 + 选中/编辑时回填输入框的文本）。对齐原版
 * `OptionWidget.getMatchText`：显式`labelText`优先，其次字符串`label`；富内容`label`未给
 * `labelText`时返回`undefined`——过滤方应将该选项排除在前缀过滤外（原版此时取渲染文本，
 * 声明式props下不可复现；按`String(value)`过滤会把「苹果」筛成「3」），回填方以
 * `String(value)`兜底
 */
export function tagMatchText(option: TagOptionProps | undefined): string | undefined {
  if (option?.labelText !== undefined) {
    return option.labelText;
  }
  if (typeof option?.label === "string") {
    return option.label;
  }
  return undefined;
}

/**
 * 合法值域的合并（对齐原版`MenuTagMultiselectWidget.getAllowedValues`的
 * `whitelist.concat(options.map(o => o.data))`）：白名单在前、菜单选项值在后，重复值由消费方的
 * Set去重。组件（useTagValues）与公开的{@link pickValidTags}共用，避免调用方按错口径自行拼装
 */
export function mergeTagAllowedValues(
  allowedValues: (string | number)[] | undefined,
  options: TagOptionProps[] | undefined,
): (string | number)[] {
  return [...(allowedValues ?? []), ...(options ?? []).map((option) => option.value)];
}

/** 标签值的合法性规则：值域与「重复/任意值」两个口径，items判定、添加准入与pickValidTags共用 */
export interface TagValidityRule {
  /** 合法值域（白名单与菜单选项值经{@link mergeTagAllowedValues}合并） */
  allowedValueSet: ReadonlySet<string | number>;
  /** 允许任意值（对齐`allowArbitrary`，置真时值域判定跳过） */
  allowArbitrary: boolean;
  /** 允许重复值（对齐`allowDuplicates`，置假时同值的二次出现判为非法） */
  allowDuplicates: boolean;
}

/**
 * 单值合法性（对齐原版`isAllowedData`的判定）：值域内，或`allowArbitrary`；不允许重复时，
 * 同值的再次出现（`seenBefore`）一律非法。标签项判定、添加准入与{@link pickValidTags}共用
 * 此一套规则，勿各写一份
 */
export function isTagValueValid(
  value: string | number,
  seenBefore: boolean,
  rule: TagValidityRule,
): boolean {
  if (!rule.allowDuplicates && seenBefore) {
    return false;
  }
  return rule.allowArbitrary || rule.allowedValueSet.has(value);
}

/**
 * Returns the valid subset of the given values: duplicates beyond the first
 * occurrence (when `allowDuplicates` is off) and values outside the legal range
 * are excluded. The range is the union of `allowedValues` and `options[].value`,
 * the same rule the component uses — pass its props to get a set complementary
 * to `onInvalidTagsChange`.
 *
 * 取值集合中的合法子集：剔除重复项（`allowDuplicates` 为假时仅保留首个）与
 * 不在合法值域内的值。值域为 `allowedValues` 与 `options` 各 `value` 的并集，
 * 与组件同一套规则——传组件同款 props 即得与 `onInvalidTagsChange` 互补的集合。
 */
export function pickValidTags(
  values: (string | number)[],
  config: {
    /**
     * Menu options (part of the legal range; same shape as the component prop).
     *
     * 菜单选项集（值域的一部分，与组件同款 props）。
     */
    options?: TagOptionProps[];
    /**
     * Value whitelist (merged with option values to form the legal range).
     *
     * 白名单（与选项值合并后构成值域）。
     */
    allowedValues?: (string | number)[];
    /**
     * Allow arbitrary values (skips the range test when true).
     *
     * 允许任意值（置真时值域判定跳过）。
     */
    allowArbitrary?: boolean;
    /**
     * Allow duplicate values (default false: only the first occurrence is kept).
     *
     * 允许重复值（缺省 false：重复项只保留首个）。
     */
    allowDuplicates?: boolean;
  } = {},
): (string | number)[] {
  const {
    options,
    allowedValues,
    allowArbitrary = false,
    allowDuplicates = false,
  } = config;
  const rule: TagValidityRule = {
    allowedValueSet: new Set<string | number>(
      mergeTagAllowedValues(allowedValues, options),
    ),
    allowArbitrary,
    allowDuplicates,
  };
  const seen = new Set<string | number>();
  return values.filter((tagValue) => {
    const seenBefore = seen.has(tagValue);
    seen.add(tagValue);
    return isTagValueValid(tagValue, seenBefore, rule);
  });
}
