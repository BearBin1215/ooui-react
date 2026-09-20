import { useCallback, useEffect, useMemo, useRef } from "react";
import { useControlledValue, useLatestRef } from "../../hooks";
import {
  isTagValueValid,
  mergeTagAllowedValues,
  tagDisplayLabel,
  tagMatchText,
  type TagOptionProps,
  type TagValidityRule,
} from "./tagModel";

/** 值模型入参：合法性规则与数据源（菜单选项仅作标签文本/固定态/合法值域的数据来源） */
export interface UseTagValuesParams {
  /** 标签值集合（受控，传入即受控模式） */
  value?: (string | number)[];

  /** 非受控初始值 */
  defaultValue?: (string | number)[];

  /** 标签增删回调 */
  onChange?: (value: (string | number)[]) => void;

  /** 非法标签集变化回调（只读派生通道） */
  onInvalidTagsChange?: (invalidValues: (string | number)[]) => void;

  /** 菜单选项集（标签文本/固定态/合法值域的数据源，无菜单时不必传） */
  options?: TagOptionProps[];

  /** 合法值白名单，与菜单选项值合并构成合法值域（无菜单时为唯一值域来源） */
  allowedValues?: (string | number)[];

  /** 允许添加任意值 */
  allowArbitrary?: boolean;

  /** 允许重复值 */
  allowDuplicates?: boolean;

  /** 允许展示非法标签 */
  allowDisplayInvalidTags?: boolean;

  /** 标签数量上限 */
  tagLimit?: number;

  /** 为true时关闭拖拽重排，且白名单值的新增按白名单顺序插入而非追加（见buildAdded）；缺省false */
  reorderDisabled?: boolean;
}

/**
 * 标签值模型（TagMultiselect的编辑核心，无菜单/输入框/拖拽感知；对齐原版
 * TagMultiselectWidget的值管线：addTag/removeTagByData/isAllowedData/isValid状态）：
 * 受控/非受控值、由值派生的标签项（文本/固定/合法）、非法集通知与增删操作。
 * 与具体交互解耦——输入框、菜单、拖拽各域经本hook的API读写同一份值
 */
export function useTagValues({
  value,
  defaultValue,
  onChange,
  onInvalidTagsChange,
  options,
  allowedValues,
  allowArbitrary = false,
  allowDuplicates = false,
  allowDisplayInvalidTags = false,
  tagLimit,
  reorderDisabled = false,
}: UseTagValuesParams) {
  const { value: currentValue, commit } = useControlledValue<(string | number)[]>(
    { value, defaultValue: defaultValue ?? [] },
    onChange,
  );

  /** 合法值序列：白名单与菜单选项值合并并保持给定顺序（对齐原版MenuTagMultiselect的
   * getAllowedValues，口径见mergeTagAllowedValues，与公开的pickValidTags共用） */
  const allowedValueList = useMemo(
    () => mergeTagAllowedValues(allowedValues, options),
    [allowedValues, options],
  );

  /** 合法值集合（供O(1)命中） */
  const allowedValueSet = useMemo(
    () => new Set<string | number>(allowedValueList),
    [allowedValueList],
  );

  /** 合法性规则（items与添加准入共用；判定见isTagValueValid，与公开的pickValidTags同源） */
  const validityRule = useMemo<TagValidityRule>(
    () => ({ allowedValueSet, allowArbitrary, allowDuplicates }),
    [allowedValueSet, allowArbitrary, allowDuplicates],
  );

  /** 值→菜单选项（同值取首个），用于标签文本与固定态 */
  const optionByValue = useMemo(() => {
    const map = new Map<string | number, TagOptionProps>();
    for (const option of options ?? []) {
      if (!map.has(option.value)) {
        map.set(option.value, option);
      }
    }
    return map;
  }, [options]);

  /** 标签纯文本（选中/编辑时回填输入框）：富标签未给labelText时以值兜底（见tagMatchText） */
  const labelTextOf = useCallback(
    (tagValue: string | number): string =>
      tagMatchText(optionByValue.get(tagValue)) ?? String(tagValue),
    [optionByValue],
  );

  /** 标签项（由值集合派生）：合法性经isTagValueValid判定（重复项与值域外值） */
  const items = useMemo(() => {
    const counter = new Map<string | number, number>();
    return currentValue.map((itemValue) => {
      const occurrence = counter.get(itemValue) ?? 0;
      counter.set(itemValue, occurrence + 1);
      const option = optionByValue.get(itemValue);
      const valid = isTagValueValid(itemValue, occurrence > 0, validityRule);
      return {
        value: itemValue,
        occurrence,
        // 显示富内容（TagItem.label为ReactNode）；回填输入框的纯文本另经labelTextOf
        label: tagDisplayLabel(option, itemValue),
        fixed: !!option?.fixed,
        valid,
      };
    });
  }, [currentValue, validityRule, optionByValue]);

  /** 非法标签值（按标签顺序，`items[].valid`的派生结果）；`onInvalidTagsChange`的载荷 */
  const invalidTagValues = useMemo(
    () => items.filter((item) => !item.valid).map((item) => item.value),
    [items],
  );

  /** 是否未达标签数量上限 */
  const underLimit = !tagLimit || items.length < tagLimit;

  /** 值是否允许添加（对齐原版isAllowedData，基于给定列表避免批处理中的中间态提交） */
  const isAllowedIn = useCallback(
    (list: (string | number)[], data: string | number): boolean =>
      isTagValueValid(data, list.includes(data), validityRule),
    [validityRule],
  );

  /** 构造插入后的值数组：超限、或非法且不展示非法标签时返回null（对齐原版addTag准入） */
  const buildAdded = useCallback(
    (list: (string | number)[], data: string | number): (string | number)[] | null => {
      if (tagLimit && list.length >= tagLimit) {
        return null;
      }
      if (!isAllowedIn(list, data) && !allowDisplayInvalidTags) {
        return null;
      }
      // 关闭拖拽重排时，白名单内的值按白名单给定顺序插入而非追加（对齐原版addTag的insertIndex计算）
      let insertIndex = list.length;
      if (reorderDisabled) {
        const allowedIndex = allowedValueList.indexOf(data);
        if (allowedIndex !== -1) {
          insertIndex = 0;
          for (let i = 0; i < list.length; i++) {
            const itemAllowedIndex = allowedValueList.indexOf(list[i]);
            if (itemAllowedIndex !== -1 && itemAllowedIndex <= allowedIndex) {
              insertIndex = i + 1;
            } else {
              break;
            }
          }
        }
      }
      const next = list.slice();
      next.splice(insertIndex, 0, data);
      return next;
    },
    [tagLimit, isAllowedIn, allowDisplayInvalidTags, reorderDisabled, allowedValueList],
  );

  /** 追加标签并提交，返回是否添加成功 */
  const addTag = useCallback(
    (data: string | number): boolean => {
      const next = buildAdded(currentValue, data);
      if (!next) {
        return false;
      }
      commit(next);
      return true;
    },
    [buildAdded, currentValue, commit],
  );

  /** 移除指定下标的标签 */
  const removeTagAt = useCallback(
    (index: number) => {
      commit(currentValue.filter((_, i) => i !== index));
    },
    [currentValue, commit],
  );

  /** 移除首个匹配值的标签（对齐原版removeTagByData经findItemFromData取首项） */
  const removeTagByValue = useCallback(
    (data: string | number) => {
      const index = currentValue.indexOf(data);
      if (index !== -1) {
        removeTagAt(index);
      }
    },
    [currentValue, removeTagAt],
  );

  // 非法标签集变化时通知调用方（只读派生，不提交值）。上一次结果以ref承载：
  // 首个渲染不派发，内容不变（含父级未采纳回调）时也不重复派发，
  // 对齐原版toggleValid的`if (this.valid !== valid)`守卫
  const onInvalidTagsChangeRef = useLatestRef(onInvalidTagsChange);
  const prevInvalidTagsRef = useRef(invalidTagValues);
  useEffect(() => {
    const prev = prevInvalidTagsRef.current;
    const changed =
      prev.length !== invalidTagValues.length ||
      prev.some((invalidValue, index) => invalidValue !== invalidTagValues[index]);
    if (changed) {
      prevInvalidTagsRef.current = invalidTagValues;
      onInvalidTagsChangeRef.current?.(invalidTagValues);
    }
  }, [invalidTagValues, onInvalidTagsChangeRef]);

  return {
    currentValue,
    commit,
    items,
    underLimit,
    labelTextOf,
    buildAdded,
    addTag,
    removeTagAt,
    removeTagByValue,
  } as const;
}
