/**
 * 工具栏「工具提升」的纯计算层（对齐原版 OO.ui.PopupToolGroup 的 `promoteToBar` 与
 * OO.ui.Toolbar 的 `updatePromotedTools` / `getPromotedToolCount`，oojs-ui.js:21185-21390、
 * :23219-23320）：工具组声明一批可在宽度充足时平铺到工具栏的工具，Toolbar 测量出剩余
 * 宽度能容纳几个工具，再按声明顺序整组提升。DOM 测量与状态编排由 Toolbar / PopupToolGroup
 * 承担，本模块只做配置归一化与宽度判定，便于独立单测。
 */

/**
 * `promoteToBar` 的配置形态：工具符号名，或「符号名 / 符号名数组」的数组。
 * 数组中的嵌套数组是一个**整组提升**的集合（宽度容得下整组才提升，对齐原版
 * `[['bold', 'italic'], 'underline']` 的语义）；单个字符串按一个工具提升。
 * 原版还支持 `{ name }` / `{ group }` / `'*'` 三种工具工厂选择器，本工程工具不再经
 * ToolFactory 注册（见 dev-docs/DEVIATIONS.md「舍弃」的 dev-tool-factory），只保留符号名。
 */
export type PromoteToBar = string | readonly (string | readonly string[])[];

/**
 * 把 `promoteToBar` 归一化为按声明顺序排列的可提升工具集：过滤组内不存在的名字、
 * 同一工具只归入首个命中的集合（对齐原版 `getPromotableToolSets` 的 `used` 去重），
 * 空集合丢弃。单个名字也包成一个单元素集合，使「整组提升」的执行模型对两种写法一致。
 * @param promoteToBar 提升配置，缺省表示不提升
 * @param itemNames 组内全部工具的符号名（按展示顺序）
 */
export function normalizePromotableSets(
  promoteToBar: PromoteToBar | undefined,
  itemNames: readonly string[],
): string[][] {
  if (promoteToBar === undefined) {
    return [];
  }
  const itemSet = new Set(itemNames);
  const used = new Set<string>();
  const sets: string[][] = [];
  const collection = typeof promoteToBar === "string" ? [promoteToBar] : promoteToBar;
  for (const item of collection) {
    const requested = typeof item === "string" ? [item] : item;
    const names: string[] = [];
    for (const name of requested) {
      // 命中即登记：同一集合内的重复名只保留首次（对齐原版 `ToolFactory.extract` 边遍历边写 used，
      // oojs-ui.js:22465-22522）；先整体 filter 再批量登记会让重复名重复累计宽度
      if (itemSet.has(name) && !used.has(name)) {
        used.add(name);
        names.push(name);
      }
    }
    if (names.length) {
      sets.push(names);
    }
  }
  return sets;
}

/**
 * 可提升工具集的内容签名入参：只取影响提升决策的三项，栏宽、文本与 DOM 变化不入签名
 * （对齐原版`getPromotionMeasurements`只按可提升工具列表缓存的语义）
 */
export interface PromotableSetSignature {
  /** 组在工具栏children中的声明序号（提升优先级依据） */
  order: number;
  /** 组内全部工具名（按展示顺序） */
  itemNames: readonly string[];
  /** 可提升工具集（按优先级排列） */
  sets: readonly (readonly string[])[];
}

/**
 * 计算单个工具组的可提升工具集内容签名：声明序号、组内工具顺序、可提升集合或集合内
 * 顺序变化时变化。经JSON序列化，工具名含分隔符也不会与结构冲突；供工具栏的测量缓存
 * 与工具组「请求重测」判等共用
 * @param input 组的声明序号、工具名顺序与可提升集合
 */
export function promotionSignature(input: PromotableSetSignature): string {
  return JSON.stringify([input.order, input.itemNames, input.sets]);
}

/**
 * 单个可提升工具组的测量结果（`resolvePromotedTools` 的入参，其余入参是工具栏自身的宽度）
 */
export interface PromotableGroupPlan {
  /** 组内全部工具名（按展示顺序；用于判断「全部工具都被提升、组整体隐藏」） */
  itemNames: readonly string[];
  /** 可提升工具集（按优先级排列；组内工具名唯一） */
  sets: readonly (readonly string[])[];
  /** 与 sets 展开顺序对齐的工具外宽（含外边距），即工具在提升容器内平铺时的占宽 */
  toolWidths: readonly number[];
  /** 与 toolWidths 对齐的外边距合计（容器内第一个工具不带分隔边距，计算时需扣除） */
  toolMargins: readonly number[];
  /** 提升容器的附加宽（容器外宽减去其中工具宽之和） */
  containerWidth: number;
  /** 组根元素外宽（全部工具被提升时组整体隐藏，其宽度让给提升容器） */
  groupWidth: number;
}

/** 一个工具组的提升选择（`resolvePromotedTools` 的返回值） */
export interface PromotedToolSelection {
  /** 组在入参数组中的下标 */
  groupIndex: number;
  /** 本次提升的工具名 */
  names: string[];
}

/**
 * 按工具栏剩余宽度选出要提升的工具集，对齐原版 `Toolbar.getPromotedToolCount` +
 * `updatePromotedTools`（oojs-ui.js:21185-21390）：逐个累计「把该工具加进提升容器后
 * 该组占宽」的增量，判定点只落在完整集合的末项；返回值再按集合顺序整组选取，
 * 容不下的集合及其后所有集合都不提升。
 * @param groups 各组测量结果，顺序即提升优先级（原版按工具栏内工具组顺序）
 * @param baseWidth 无提升时的工具栏内容基准宽（工具区 + 右侧工具区 + actions）
 * @param availableWidth 工具栏栏宽（原版 `$bar[0].clientWidth`）
 */
export function resolvePromotedTools(
  groups: readonly PromotableGroupPlan[],
  baseWidth: number,
  availableWidth: number,
): PromotedToolSelection[] {
  // 展开为全局工具序列：组内展平下标用于取该组的测量值，lastOfSet 标记集合边界
  const flat: {
    groupIndex: number;
    name: string;
    localIndex: number;
    lastOfSet: boolean;
  }[] = [];
  groups.forEach((group, groupIndex) => {
    let localIndex = 0;
    group.sets.forEach((set) => {
      set.forEach((name, indexInSet) => {
        flat.push({
          groupIndex,
          name,
          localIndex: localIndex++,
          lastOfSet: indexInSet === set.length - 1,
        });
      });
    });
  });
  if (!flat.length) {
    return [];
  }

  const available = availableWidth - baseWidth;
  // 每组已提升部分的累计状态（对齐原版 groupStates）。各测量数组都是组内局部数组，
  // 故首个提升工具记录组内下标而非 flat 的全局下标
  const states = groups.map(() => ({
    count: 0,
    toolsWidth: 0,
    /** 已提升工具中展示序最靠前者（提升容器内第一个工具不带分隔边距） */
    firstLocalIndex: -1,
    /** 首个已提升工具在 itemNames 中的位置，仅用于比较展示顺序 */
    firstItemOrder: Number.POSITIVE_INFINITY,
    width: 0,
  }));
  let width = 0;
  let count = 0;
  flat.forEach((tool, index) => {
    const group = groups[tool.groupIndex];
    const state = states[tool.groupIndex];
    state.count += 1;
    state.toolsWidth += group.toolWidths[tool.localIndex] ?? 0;
    // 「第一个」按组内展示顺序而非提升声明顺序
    const itemOrder = group.itemNames.indexOf(tool.name);
    if (itemOrder < state.firstItemOrder) {
      state.firstItemOrder = itemOrder;
      state.firstLocalIndex = tool.localIndex;
    }
    let groupWidth =
      state.toolsWidth -
      (group.toolMargins[state.firstLocalIndex] ?? 0) +
      group.containerWidth;
    if (state.count === group.itemNames.length) {
      // 该组的全部工具都被提升：组本身（handle）隐藏，宽度从总宽中扣除
      groupWidth -= group.groupWidth;
    }
    width += groupWidth - state.width;
    state.width = groupWidth;
    if (width < available && tool.lastOfSet) {
      count = index + 1;
    }
  });

  // 按集合顺序整组提升；容不下的集合（含其后所有集合）不提升（对齐原版 sets.every）
  const selections: PromotedToolSelection[] = [];
  let promotedCount = 0;
  let overflowed = false;
  for (let groupIndex = 0; groupIndex < groups.length && !overflowed; groupIndex++) {
    for (const set of groups[groupIndex].sets) {
      if (promotedCount + set.length > count) {
        overflowed = true;
        break;
      }
      selections.push({ groupIndex, names: [...set] });
      promotedCount += set.length;
    }
  }
  return selections;
}

/**
 * 两组提升态是否等值（按「组键 → 工具名集合」逐项比较）：
 * 测量后与现有状态等值时不再提交，避免同值重渲染
 */
export function promotedSelectionsEqual(
  a: ReadonlyMap<object, ReadonlySet<string>>,
  b: ReadonlyMap<object, ReadonlySet<string>>,
): boolean {
  if (a === b) {
    return true;
  }
  if (a.size !== b.size) {
    return false;
  }
  for (const [key, names] of a) {
    const other = b.get(key);
    if (!other || other.size !== names.size) {
      return false;
    }
    for (const name of names) {
      if (!other.has(name)) {
        return false;
      }
    }
  }
  return true;
}
