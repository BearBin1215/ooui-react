import { useCallback, useEffect, useRef, useState } from "react";
import { useLatestRef } from "./refs";

/** 受控/非受控值态与布局激活选择（统一"内部state + 回写通知"管线） */

/**
 * 受控/非受控通用值状态（对齐React受控组件惯例，原版通过setters维护无对应物）：
 * 传入`value`即受控模式（内部state不生效）；否则维护内部state并以`defaultValue`初始化。
 * `commit`供事件回调使用：非受控时同步内部state，并始终转发给`onChange`；
 * 入参支持函数式更新（对齐setState惯例，经ref取最新已提交值）。
 * 另返回`commitIfChanged`（仅值变化时提交），供选择集类组件使用。
 * `commit`经useCallback稳定（内部经ref读最新值与回调），依赖它的effect不会因回调
 * 身份每渲染变化而重跑
 */
export function useControlledValue<T, E = never>(
  { value, defaultValue }: { value?: T; defaultValue?: T },
  onChange?: (value: T, event?: E) => void,
) {
  const isControlled = value !== undefined;
  const [innerValue, setInnerValue] = useState<T | undefined>(defaultValue);
  // 非受控时innerValue以defaultValue初始化，语义上始终有值；断言为T以保持调用侧类型简洁
  const currentValue = (isControlled ? value : innerValue) as T;
  const currentValueRef = useLatestRef(currentValue);
  const onChangeRef = useLatestRef(onChange);
  // 仅isControlled参与依赖：受控/非受控切换属模式变更（React不推荐），此时允许commit更新
  const commit = useCallback(
    (nextValue: T | ((prev: T) => T), event?: E) => {
      const resolved =
        typeof nextValue === "function"
          ? (nextValue as (prev: T) => T)(currentValueRef.current)
          : nextValue;
      if (!isControlled) {
        setInnerValue(resolved);
      }
      // 事件缺省时以单参调用：ChangeHandler约定第二参数仅在输入类组件提供，
      // 不向仅声明value参的回调（如ToggleSwitch的onChange）附加undefined尾参
      if (event === undefined) {
        onChangeRef.current?.(resolved);
      } else {
        onChangeRef.current?.(resolved, event);
      }
    },
    [isControlled, currentValueRef, onChangeRef],
  );
  /**
   * 仅当值变化时提交。选择集类组件（Select/TabSelect/ButtonSelect/Dropdown/ComboBoxInput）的
   * 选中语义用它——对齐原版`SelectWidget.selectItem`对已选中项的提前返回（重复选中同一项不
   * 派发事件）。输入类组件**不要**用它：其`commit`的"始终转发"语义是刻意的（见上）
   */
  const commitIfChanged = useCallback(
    (nextValue: T, event?: E) => {
      if (nextValue !== currentValueRef.current) {
        commit(nextValue, event);
      }
    },
    [commit, currentValueRef],
  );
  return { value: currentValue, isControlled, commit, commitIfChanged } as const;
}

/**
 * 受控值非法时的回写：受控值不在可用值集合内（组件实际显示的是生效值）时，
 * 经`onNotify`把生效值交还父级，使父级state与显示值收敛，避免两者漂移。
 * 对齐原版受控语义：`DropdownInput`/`RadioSelectInput`的`setValue`会对非法值回退到
 * 首个可选值并写回组件值，React受控模式下该写回只能经回调交还父级。
 * 同一非法值只回写一次：父级未采纳时不会因外部重渲染反复触发；闩锁在受控值回到合法
 * （父级采纳生效值或改传其他合法值）时解除——此后再传该非法值是父级的一次新变更，
 * 须重新回写，否则父级state与显示值就此漂移。无生效值可写时不动。
 * `useLayoutSelection`的受控回写共用同一守卫
 */
export function useControlledValueNotify<T>(
  controlledValue: T | undefined,
  effectiveValue: T | undefined,
  onNotify?: (value: T) => void,
): void {
  // 已回写过的非法受控值：父级若忽略回调则state不变，据此防止反复触发；
  // 受控值回到合法时清除（闩锁解除语义见顶部jsdoc）
  const notifiedRef = useRef<T | undefined>(undefined);
  const onNotifyRef = useLatestRef(onNotify);
  useEffect(() => {
    if (controlledValue === undefined || effectiveValue === undefined) {
      return;
    }
    if (controlledValue === effectiveValue) {
      notifiedRef.current = undefined;
      return;
    }
    if (notifiedRef.current === controlledValue) {
      return;
    }
    notifiedRef.current = controlledValue;
    onNotifyRef.current?.(effectiveValue);
  }, [controlledValue, effectiveValue, onNotifyRef]);
}

/**
 * 失效（激活值不在options内）时的回退策略，按原版各自的实现分两种：
 * - `firstSelectable`：首个非禁用项（对齐原版`IndexLayout.removeTabPanels`的
 *   `selectFirstSelectableTabPanel()`，构造期首次选页同此口径）
 * - `nextThenLast`：旧列表原位置向后的首个幸存项（= 原版「下一个未被移除项」，批量移除
 *   时按旧列表而非新列表定位）→ 新末项（对齐原版基类`StackLayout.removeItems`）；
 *   BookletLayout的显示由stack驱动，故随它
 * 各条对应的原版出处与差异见dev-docs/DEVIATIONS.md「增强」的布局补选条
 */
export type LayoutSelectionFallback = "firstSelectable" | "nextThenLast";

/**
 * 计算布局类组件的生效激活值：值在options内则原样返回；值缺失（首次无值）或失效
 * （不在options内，如页被移除）时按`fallback`给定的原版语义回退（见该类型注释）。
 * `prevOptions`须为上一轮的options（失效值可能已不在新列表中）；
 * 全禁用（无可选项）时回退结果即undefined，对应原版「选中项为空」
 */
export function resolveLayoutSelection<T extends string | number>(
  value: T | undefined,
  options: { value: T; disabled?: boolean }[],
  prevOptions: { value: T }[],
  fallback: LayoutSelectionFallback,
): T | undefined {
  if (options.length === 0) {
    return undefined;
  }
  // 首个可选（原版findFirstSelectableItem：跳过禁用项；全禁用时原版即不选中）
  const firstSelectable = options.find((option) => !option.disabled);
  if (value === undefined) {
    return firstSelectable?.value;
  }
  if (options.some((option) => option.value === value)) {
    return value;
  }
  if (fallback === "firstSelectable") {
    return firstSelectable?.value;
  }
  const oldIndex = prevOptions.findIndex((option) => option.value === value);
  // 无历史位置可依（值从未出现在列表中，如初始即非法）与「未给出值」同处理
  if (oldIndex < 0) {
    return firstSelectable?.value;
  }
  // 原版从旧列表的原位置向后走、跳过被移除项（removeItems的do-while），批量移除时
  // 「新列表同下标」会取到更靠后的项，故须回旧列表找首个幸存项；其后无幸存项
  // （被移除的是末段）取新末项
  const surviving = new Set(options.map((option) => option.value));
  for (let i = oldIndex + 1; i < prevOptions.length; i++) {
    if (surviving.has(prevOptions[i].value)) {
      return prevOptions[i].value;
    }
  }
  return options[options.length - 1].value;
}

/**
 * 布局类组件的激活项选择（IndexLayout/BookletLayout共用），统一"派生 + 失效补选"策略：
 * 激活值缺失（首次无值）或失效（不在options内，如页被移除）时按`fallback`回退，
 * 有效值原样返回。
 * 非受控模式提交回退值使内部state收敛；受控模式经onChange把生效的回退值回写父级，
 * 同一非法值只回写一次，由父级决定是否采纳
 */
export function useLayoutSelection<T extends string | number>({
  value,
  defaultValue,
  onChange,
  options,
  fallback,
}: {
  /** 当前激活值（受控，传入即受控模式） */
  value?: T;
  /** 非受控初始激活值 */
  defaultValue?: T;
  /** 激活值变更回调 */
  onChange?: (value: T) => void;
  /** 备选项；仅`value`参与匹配、`disabled`参与「首个可选」的筛选 */
  options: { value: T; disabled?: boolean }[];
  /** 失效回退策略：按所属布局对应的原版实现传入，见{@link LayoutSelectionFallback} */
  fallback: LayoutSelectionFallback;
}): {
  /** 生效的激活值（缺失/失效时已回退） */
  effectiveValue: T | undefined;
  /** 选择激活项：非受控同步内部state，并始终转发onChange */
  select: (value: T) => void;
  /**
   * 仅值变化时选择激活项（对齐原版`StackLayout.setItem`/`BookletLayout.setPage`
   * 对同值的提前返回），供用户主动切换页签的场景使用
   */
  selectIfChanged: (value: T) => void;
} {
  const {
    value: innerValue,
    isControlled,
    commit,
  } = useControlledValue<T>({ value, defaultValue }, onChange);
  // 上一轮options：失效值需据其在旧列表中的位置定位相邻项。显式依赖options，
  // 使"上一轮"语义在批处理下确定（值失效与列表变化同批发生时，本渲染仍读旧列表）
  const prevOptionsRef = useRef(options);
  const effectiveValue = resolveLayoutSelection(
    innerValue,
    options,
    prevOptionsRef.current,
    fallback,
  );

  useEffect(() => {
    prevOptionsRef.current = options;
  }, [options]);

  useControlledValueNotify(
    isControlled ? innerValue : undefined,
    effectiveValue,
    onChange,
  );
  useEffect(() => {
    if (!isControlled && effectiveValue !== undefined && effectiveValue !== innerValue) {
      commit(effectiveValue);
    }
  }, [isControlled, effectiveValue, innerValue, commit]);

  // 布局侧的选择入口统一为一元签名：调用方可能附带事件（如StackLayout的onPageFocus携带
  // FocusEvent），而ChangeHandler约定第二参数为change事件，故在此从运行时剥掉多余入参
  const select = useCallback((next: T) => commit(next), [commit]);
  const selectIfChanged = useCallback(
    (next: T) => {
      if (next !== effectiveValue) {
        commit(next);
      }
    },
    [effectiveValue, commit],
  );

  return { effectiveValue, select, selectIfChanged };
}
