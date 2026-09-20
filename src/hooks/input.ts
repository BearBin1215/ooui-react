import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type ReactNode,
  type RefObject,
} from "react";
import { debounce } from "es-toolkit";
import { hasLabel } from "../mixins";
import { useLatestRef } from "./refs";

/** 输入类组件的度量与软校验（label让位内边距、invalid标记） */

/**
 * TextInput系组件：label渲染在input旁，input需按label宽度预留内边距。
 * 内边距落侧对齐原版`positionLabel`（`after === rtl ? padding-left : padding-right`）：
 * before落行首、after落行尾，故RTL下与LTR相反；方向由调用方按**根元素**（样式表）方向
 * 传入（见useInputProps的useRootDirection），不是输入元素自身的`dir`（后者只影响文本方向）。
 * useLayoutEffect在paint前完成测量（无首帧闪烁）；尺寸变化（内容/字体加载等）
 * 经ResizeObserver跟踪，不依赖label引用稳定性（label为节点时每渲染新引用）
 */
export function useLabelPadding(
  labelRef: RefObject<HTMLElement | null>,
  label: ReactNode,
  labelPosition: "before" | "after",
  rtl: boolean,
): CSSProperties {
  const [paddingWidth, setPaddingWidth] = useState(0);
  // label是否实际渲染内容：与labelElementClasses的hasLabel同口径（0等有效节点也计量，
  // 避免类名输出与内边距预留分叉）；取布尔量入依赖——依赖数组写表达式无法通过静态检查
  const hasLabelContent = hasLabel(label);

  useLayoutEffect(() => {
    const el = labelRef.current;
    if (!el) {
      return;
    }
    const update = () => setPaddingWidth(el.offsetWidth);
    // RO注册后会对初始尺寸异步回调一次，这里同步测量保证本帧paint前生效
    update();
    const observer = new ResizeObserver(update);
    observer.observe(el);
    return () => observer.disconnect();
    // 仅在label挂载状态变化时重挂观察；labelRef稳定，label内容变化由RO捕获
  }, [labelRef, hasLabelContent]);

  // 返回值与下游Input/props.ts的mergedStyle构成memo依赖链：本对象引用变化即令那份memo失效
  return useMemo<CSSProperties>(() => {
    if (paddingWidth <= 0) {
      return {};
    }
    // +2px为label与输入内容之间的间距余量
    const padding = `${paddingWidth + 2}px`;
    return (labelPosition === "before") !== rtl
      ? { paddingLeft: padding }
      : { paddingRight: padding };
  }, [paddingWidth, labelPosition, rtl]);
}

/**
 * 输入类组件的软校验反馈（对齐原版TextInputWidget.setValidityFlag的标记输出）：
 * 值不满足约束时在输入元素输出`aria-invalid`（根元素的invalid标志类由调用方按返回的
 * `invalid`输出），不改写值。触发时机对齐原版：值变更防抖250ms后校验（原版change事件
 * 的OO.ui.debounce）、失焦立即校验、聚焦视为有效（原版onFocus的setValidityFlag(true)）；
 * 初始值不主动校验（原版构造期无change事件），需要构造期标记的形态（NumberInput）经
 * validateOnMount开启挂载期即时校验
 */
export function useValidityFlag<
  T extends HTMLInputElement | HTMLTextAreaElement,
  V extends string | number,
>({
  inputRef,
  value,
  validate,
  validateOnMount = false,
}: {
  /** 内部输入元素引用（checkValidity浏览器约束检查的载体） */
  inputRef: RefObject<T | null>;
  /** 当前输入值，作为自定义校验函数的入参 */
  value: V;
  /** 自定义合法性判定（缺省仅浏览器checkValidity）；返回Promise时按其决议结果标记，拒绝视为非法 */
  validate?: (value: V) => boolean | Promise<boolean>;
  /**
   * 挂载期即校验一次（跳过"首值不校验"）：对齐原版构造期即输出的非法标记
   * （如空值 + required 在加载时即标记）。缺省 false——其余输入形态不在构造期标记
   */
  validateOnMount?: boolean;
}): {
  /** 当前是否标记为非法 */
  invalid: boolean;
  /** 输入元素失焦回调：立即重新校验 */
  handleBlur: () => void;
  /** 输入元素聚焦回调：清除非法标记 */
  handleFocus: () => void;
  /** 立即重新校验（约束配置变化时由调用方触发，对齐原版setRange/setStep的setValidityFlag） */
  revalidate: () => void;
} {
  const [invalid, setInvalid] = useState(false);
  const validateRef = useLatestRef(validate);
  const valueRef = useLatestRef(value);
  // 首个生效值不校验（对齐原版构造期不触发标记）；发生过变化后即使回到初始值也照常校验
  // （如表单重置回初始值需清除既有标记），保证状态不滞留
  const initialValueRef = useRef(value);
  const interactedRef = useRef(false);

  const check = useCallback(() => {
    const input = inputRef.current;
    if (!input) {
      return;
    }
    // 先浏览器约束（required/min/max等），通过后再自定义校验，对齐原版getValidity的次序
    let result: boolean | Promise<boolean> = input.checkValidity();
    if (result && validateRef.current) {
      result = validateRef.current(valueRef.current);
    }
    Promise.resolve(result).then(
      (valid) => setInvalid(!valid),
      () => setInvalid(true),
    );
  }, [inputRef, validateRef, valueRef]);

  // 防抖句柄跨渲染复用：值快速连续变更时只保留最后一次校验
  const debouncedCheck = useMemo(() => debounce(check, 250), [check]);
  useEffect(() => () => debouncedCheck.cancel(), [debouncedCheck]);

  useEffect(() => {
    if (!interactedRef.current && value === initialValueRef.current) {
      return;
    }
    interactedRef.current = true;
    debouncedCheck();
  }, [value, debouncedCheck]);

  // 挂载期即校验：以即时的 check 复现原版构造期的标记（不走防抖，挂载后立即标记）。
  // 排在上述值变更effect之后：挂载时该effect已被首值守卫跳过，本effect再置interacted并
  // 即时校验，不会额外多排一次防抖检查
  useEffect(() => {
    if (!validateOnMount) {
      return;
    }
    interactedRef.current = true;
    check();
  }, [validateOnMount, check]);

  return {
    invalid,
    handleBlur: check,
    handleFocus: () => setInvalid(false),
    revalidate: check,
  };
}
