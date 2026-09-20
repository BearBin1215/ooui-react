import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useState,
  type CSSProperties,
  type RefObject,
} from "react";
import type { LabelPosition } from "../Label";
import { getElementDir } from "../../utils";

/**
 * 以下是测量前须从真实输入框同步到克隆节点的样式属性。
 * 克隆是独立渲染的兄弟节点，不继承真实输入框的运行时样式；而标签让位的内边距、
 * 字体与边框都会改变内容区宽度，未同步会让测得的滚动高度偏离实际值
 */
const CLONE_SYNC_PROPERTIES = [
  "padding-top",
  "padding-right",
  "padding-bottom",
  "padding-left",
  "font-family",
  "font-size",
  "font-style",
  "font-weight",
  "font-variant",
  "font-stretch",
  "line-height",
  "letter-spacing",
  "word-spacing",
  "text-indent",
  "text-transform",
  "border-top-width",
  "border-bottom-width",
  "border-left-width",
  "border-right-width",
  "box-sizing",
  "direction",
  "unicode-bidi",
  "white-space",
  "word-break",
  "overflow-wrap",
  "tab-size",
  "min-width",
  "max-width",
] as const;

/**
 * 多行输入框 autosize 的测量配置（对齐原版 MultilineTextInputWidget.adjustSize 的高度部分）。
 * 测量经一份不可见的同源克隆 textarea 完成：输入框最终高度无法直接由内容推出，
 * 须取"内容高度"与"maxRows 对应高度"两者中的较小者
 */
interface AutosizeConfig {
  /** 是否开启自动高度（对应原版 config.autosize） */
  enabled: boolean;

  /** 真实输入框引用（测量对象与高度的最终落点） */
  textareaRef: RefObject<HTMLTextAreaElement | null>;

  /** 测量用克隆元素引用（由调用方渲染，与真实输入框同类名同源样式） */
  cloneRef: RefObject<HTMLTextAreaElement | null>;

  /** 最小行数；未指定时以空串取浏览器的缺省行数（对齐原版 minRows） */
  rows?: number;

  /** 最大行数（已含原版缺省规则：max(2×rows, 10)） */
  maxRows: number;

  /** 当前值；值变化（含非受控键入）即触发重算，对应原版 change→adjustSize */
  value: string;
}

/**
 * 多行输入框的自动高度：返回应写入输入框的内联高度样式。
 * 高度经 state 回到渲染流程（而非命令式写 DOM），使 autosize 与标签让位的内边距
 * 共用一个 style 来源，避免两处分别写 style 互相覆盖。
 * 触发时机两类：值或行数配置变化后同步重测（对应原版 change→adjustSize，paint 前完成
 * 无闪烁）；盒模型或宽度变化经 ResizeObserver 兜底重测——首帧测量早于标签让位内边距
 * 生效，字体加载与窗口缩放也不走值变更，仅靠前一路径会滞留过期高度。
 * 测量过程逐步对齐原版（各步的理由见measure内联注释与其中的T133347/T1799404锚点）；
 * 内容未超出自然高度时清空内联高度，回落到rows的原生布局
 */
export function useAutosize({
  enabled,
  textareaRef,
  cloneRef,
  rows,
  maxRows,
  value,
}: AutosizeConfig): CSSProperties {
  const [height, setHeight] = useState("");

  const measure = useCallback(() => {
    const input = textareaRef.current;
    const clone = cloneRef.current;
    if (!input || !clone) {
      return;
    }
    const minRows = rows === undefined ? "" : String(rows);
    // 先同步盒模型与字体：两者决定内容区宽度，宽度不同则滚动高度不可比
    const computed = getComputedStyle(input);
    for (const property of CLONE_SYNC_PROPERTIES) {
      clone.style.setProperty(property, computed.getPropertyValue(property));
    }
    // 排除滚动条对测量的干扰（原版 T297963：克隆设 overflow hidden）
    clone.style.overflow = "hidden";
    clone.classList.remove("oo-ui-element-hidden");

    // 高度归零以读取内容的 scrollHeight
    clone.style.height = "0";
    clone.setAttribute("rows", minRows);
    clone.value = input.value;
    // Firefox缩放/字体边缘下首次读取scrollHeight可能返回陈旧值（原版T1799404的显式双读），
    // 先读一次丢弃，令再次读取拿到该配置下的准确值
    void clone.scrollHeight;
    const { scrollHeight } = clone;

    // 恢复高度读取自然尺寸：inner 含 padding、outer 含 border，两者之差作为追加到内联高度的边框补偿
    clone.style.height = "auto";
    const innerHeight = clone.clientHeight;
    const outerHeight = clone.offsetHeight;

    // 行数设为 maxRows 且清空内容，读取高度上限
    clone.setAttribute("rows", String(maxRows));
    clone.value = "";
    const maxInnerHeight = clone.clientHeight;

    // 无滚动条时 innerHeight 与 scrollHeight 的差值即测量误差（Blink 缩放相关，原版 T133347）
    const measurementError = maxInnerHeight - clone.scrollHeight;
    const idealHeight = Math.min(maxInnerHeight, scrollHeight + measurementError);

    clone.classList.add("oo-ui-element-hidden");
    clone.style.overflow = "";

    // 内容未超出自然高度时不写内联高度（回落到 rows 布局），超出时锁定高度
    setHeight(
      idealHeight > innerHeight ? `${idealHeight + (outerHeight - innerHeight)}px` : "",
    );
  }, [textareaRef, cloneRef, rows, maxRows]);

  // 值变化（含程序化赋值与非受控键入回流）与行数配置变化后同步重测
  useLayoutEffect(() => {
    if (!enabled) {
      setHeight("");
      return;
    }
    measure();
  }, [enabled, measure, value]);

  // 盒模型/宽度变化的兜底重测：自身高度回写触发的观察回调重测结果不变（React对同值state
  // bail out），故不形成"观察→重测→回写→再观察"的循环
  useEffect(() => {
    if (!enabled) {
      return;
    }
    const input = textareaRef.current;
    if (!input) {
      return;
    }
    const observer = new ResizeObserver(measure);
    observer.observe(input);
    return () => observer.disconnect();
  }, [enabled, measure, textareaRef]);

  return useMemo(() => (height ? { height } : {}), [height]);
}

/** 滚动条让位的测量结果 */
interface ScrollbarOffset {
  /** 垂直滚动条宽度（px）；无滚动条时为0。供输入框同侧内边距的让位计算（positionLabel对齐） */
  scrollbarWidth: number;
  /** 指示器应让位的样式；无滚动条时为undefined（清除偏移） */
  indicatorStyle?: CSSProperties;
  /** 标签应让位的样式（仅 labelPosition 为 after 时给出），无滚动条时为undefined */
  labelStyle?: CSSProperties;
  /**
   * 测量所得的根元素（样式表）方向。与滚动条宽度同批测量、随测量周期更新，是本组件方向
   * 判定的唯一来源——消费方（useInputProps的标签让位取侧）直接取用它，勿另行重读根方向。
   * 原版每次调`positionLabel`都重读方向，本工程以测量周期近似其求值时机（见DEVIATIONS
   * 「标签让位的内边距落侧」条）
   */
  rootRtl: boolean;
}

/**
 * 输入元素出现垂直滚动条时给浮动元素（指示器与后置标签）让位，对齐原版
 * `MultilineTextInputWidget.adjustSize` 的 scrollWidth 分支：以滚动条宽度写
 * right（RTL 下为 left）。滚动条的出现/消失经 ResizeObserver 跟踪
 * （滚动条会改变 content-box 宽度，故尺寸变化即可捕获）。
 * 让位偏移仅在其落侧与主题 CSS 锚定侧（根/样式表方向）一致时生效——指示器/标签由主题
 * CSS 按根方向锚定在某一物理侧，输入元素自身方向（`dir` 按原版只落 input）使滚动条落到
 * 对侧时，内联偏移会把绝对定位元素两端钉住而拉伸变形，此时放弃让位（见 DEVIATIONS 增强节）
 */
export function useScrollbarOffset({
  inputRef,
  rootRef,
  labelPosition = "after",
}: {
  /** 被测量的输入元素（多行 textarea） */
  inputRef: RefObject<HTMLElement | null>;
  /** 组件根元素：其有效方向即主题 CSS 锚定浮动元素的一侧，作为让位落侧的一致性基准 */
  rootRef: RefObject<HTMLElement | null>;
  /** 标签位置，仅 after 时标签需要让位（对齐原版 labelPosition 判断） */
  labelPosition?: LabelPosition;
}): ScrollbarOffset {
  const [offset, setOffset] = useState({
    width: 0,
    property: "right" as "left" | "right",
    anchor: "right" as "left" | "right",
  });

  useLayoutEffect(() => {
    const input = inputRef.current;
    if (!input) {
      return;
    }
    const measure = () => {
      const width = input.offsetWidth - input.clientWidth;
      // 滚动条物理所在侧跟随输入元素自身的有效方向（dir 按原版落点在 input 上）；
      // 主题CSS锚定浮动元素的一侧（根方向）与宽度同批测量并入状态，使方向随测量周期更新
      const property = getComputedStyle(input).direction === "rtl" ? "left" : "right";
      const anchor = getElementDir(rootRef.current) === "rtl" ? "left" : "right";
      setOffset((prev) =>
        prev.width === width && prev.property === property && prev.anchor === anchor
          ? prev
          : { width, property, anchor },
      );
    };
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(input);
    return () => observer.disconnect();
  }, [inputRef, rootRef]);

  const rootRtl = offset.anchor === "left";
  return useMemo(() => {
    // 无滚动条（宽度为0）本无让位可言；根方向与输入元素方向分叉时同样退回稳态——
    // 主题CSS按根（样式表）方向把指示器/标签锚定在某侧，内联偏移须落在同侧才是平移让位，
    // 二者异侧的偏移会致元素拉伸，故撤回让位（含并入同侧内边距的 scrollbarWidth）
    if (!offset.width || offset.anchor !== offset.property) {
      return {
        scrollbarWidth: 0,
        indicatorStyle: undefined,
        labelStyle: undefined,
        rootRtl,
      };
    }
    const style = { [offset.property]: offset.width } as CSSProperties;
    return {
      scrollbarWidth: offset.width,
      indicatorStyle: style,
      labelStyle: labelPosition === "after" ? style : undefined,
      rootRtl,
    };
  }, [offset, labelPosition, rootRtl]);
}
