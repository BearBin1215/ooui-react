import type { ChangeEvent, RefObject } from "react";

/**
 * 与具体mixin无关的共享工具：选择集的判定与派生（对齐原版SelectWidget/ItemWidget的方法）、
 * DOM与浮层通用工具（对齐原版Element.static与FloatableElement/ClippableElement的辅助逻辑）、
 * 以及跨组件共用的常量。
 * 对齐原版OO.ui.mixin的类名贡献与元素级状态解析见src/mixins.ts，契约类型见src/Element.ts
 */

/**
 * Value-change callback signature `(value, event?)`: value-first, with the native
 * change event as the second argument (provided only by input-type components).
 * The element generic is constrained to `EventTarget` so the type instantiates
 * under both `@types/react` and `preact/compat`.
 *
 * 组件值变化回调（值优先；第二参数为触发变更的原生 change 事件，仅输入类
 * 组件提供）。事件元素泛型约束为 `EventTarget`，保证在 `@types/react` 与
 * `preact/compat` 两套类型体系下都可实例化。
 * @example <TextInput value={text} onChange={setText} />
 */
export type ChangeHandler<T = unknown, P extends EventTarget = HTMLElement> = (
  value: T,
  event?: ChangeEvent<P>,
) => void;

/** 浮层锚点/忽略目标的入参形态：ref或真实元素（均可空） */
export type ElementOrRef = RefObject<HTMLElement | null> | HTMLElement | null | undefined;

/**
 * 开发期一次性告警（同一key只告警一次；生产环境静默）。用于已废弃别名的使用、无法满足
 * 契约的配置组合等「能用但不对」的场景——对齐原版OO.ui.warnDeprecation的用途
 * （该全局工具本身不映射，见dev-docs/DEVIATIONS.md「舍弃」），但不进公开导出面
 */
const warnedKeys = new Set<string>();
export function warnOnceInDev(key: string, message: string): void {
  // 按惯例写成可被bundler静态替换的形式（`process.env?.NODE_ENV`这类可选链会让
  // define替换失配、整个分支无法被DCE消除）
  if (process.env.NODE_ENV === "production") {
    return;
  }
  if (warnedKeys.has(key)) {
    return;
  }
  warnedKeys.add(key);
  console.warn(`[ooui-react] ${message}`);
}

/**
 * 把ref或真实元素统一解析为HTMLElement（皆无时返回null），浮动定位与浮层关闭类组件共用。
 * `current`是ref的判别特征（RefObject与HTMLElement在类型上无法直接区分，需运行时判别）
 */
export function resolveElement(el: ElementOrRef): HTMLElement | null {
  if (el && typeof el === "object" && "current" in el) {
    return el.current ?? null;
  }
  return el ?? null;
}

/**
 * 相对定位可选值（对齐原版SelectWidget.findRelativeSelectableItem）：从start（不含）沿
 * offset方向移动|offset|个可选值后取该项；start不在序列内时正向自首项前、反向自末项后
 * 起步（Home/End即经此取首末项）。命中项不满足filter时沿同方向继续找（前缀跳转的过滤语义）。
 * wrap时端点环绕（最多扫一整圈即终止）；不环绕时移动越界停在端点（钳制），
 * filter扫描越界仍无命中则返回undefined。
 * 「先移动、后过滤」两段实现在filter与wrap=false组合下的边界语义（与原版单循环实现的
 * 差异）及消费点约束见dev-docs/comparison-guide.md「共享抽象」。
 * Select/TabSelect/RadioSelect的键盘导航、前缀跳转与菜单弹层高亮共用
 */
export function findRelativeSelectableItem<T extends string | number>(
  selectableValues: T[],
  start: T | undefined,
  offset: number,
  filter?: (value: T) => boolean,
  wrap = true,
): T | undefined {
  const length = selectableValues.length;
  if (!length || offset === 0) {
    return undefined;
  }
  const step = offset > 0 ? 1 : -1;
  const startIndex = start === undefined ? -1 : selectableValues.indexOf(start);
  const outOfRangeStart = offset > 0 ? -1 : length;
  let index = startIndex === -1 ? outOfRangeStart : startIndex;
  // 移动段：不环绕时越界即停在端点，翻页键因此近端点时收敛到端点项而非原地不动
  for (let i = 0; i < Math.abs(offset); i++) {
    let next = index + step;
    if (next < 0 || next >= length) {
      if (!wrap) {
        break;
      }
      next = (next + length) % length;
    }
    index = next;
  }
  // 过滤段：沿同方向找首个满足filter的项；扫满一圈仍未命中返回undefined
  for (let i = 0; i < length; i++) {
    const candidate = selectableValues[index];
    if (!filter || filter(candidate)) {
      return candidate;
    }
    let next = index + step;
    if (next < 0 || next >= length) {
      if (!wrap) {
        return undefined;
      }
      next = (next + length) % length;
    }
    index = next;
  }
  return undefined;
}

/** 选项集的最小结构（仅用于可选性判定与值序列派生） */
interface OptionLike {
  /** 选项值；缺省表示分组标题一类不可选项 */
  value?: string | number;
  /** 选项自身禁用 */
  disabled?: boolean;
}

/**
 * 可选项判定（带value且未禁用）：分组标题（无value）与禁用项均不可选。
 * Select/Dropdown/ComboBoxInput/RadioSelect 等经此统一口径
 */
function isSelectableOption<O extends OptionLike>(
  option: O,
): option is O & { value: string | number } {
  return option.value !== undefined && !option.disabled;
}

/** 取选项集的可选值序列（保持展示顺序）；键盘导航、悬停高亮、选中校验与拖拽共用 */
export function getSelectableValues(options: OptionLike[]): (string | number)[] {
  const values: (string | number)[] = [];
  for (const option of options) {
    if (isSelectableOption(option)) {
      values.push(option.value);
    }
  }
  return values;
}

/**
 * 受控值非法时的回退值：值在可选值集合内则原样返回，否则取首个可选值（无可选值则undefined）。
 * 对齐原版`DropdownInput`/`RadioSelectInput`的setValue回退语义（组件始终显示合法值）
 */
export function resolveSelectableValue<T extends string | number>(
  value: T | undefined,
  selectableValues: T[],
): T | undefined {
  return value !== undefined && selectableValues.includes(value)
    ? value
    : selectableValues[0];
}

/**
 * 选项禁用态：组禁用时选项一律禁用，否则取选项自身的disabled
 * （对齐原版ItemWidget.isDisabled的`this.disabled || group.isDisabled()`——组禁用优先，
 * 选项无法在禁用组内单独启用）
 */
export function resolveOptionDisabled(
  option: { disabled?: boolean },
  groupDisabled?: boolean,
): boolean | undefined {
  return option.disabled || groupDisabled;
}

/** 前缀跳转的字符缓冲时长（ms），对齐原版SelectWidget.onDocumentKeyPress的1500 */
export const KEY_PRESS_BUFFER_MS = 1500;

/**
 * 是否为键盘"激活键"（Enter/空格）——对齐原版多处`onKeyPress`经`e.which === 13 || 32`
 * 触发点击/切换的口径
 */
export function isActivationKey(key: string): boolean {
  return key === "Enter" || key === " ";
}

/**
 * 匹配文本归一化（对齐原版SelectWidget.static.normalizeForMatching）：trim、折叠连续空白
 * （nbsp等空白符一并折叠）、小写、Unicode NFC。原版的replace无g标志、只折叠第一段连续
 * 空白，此处照抄该行为；返回值再经startsWith比较（原版getItemMatcher同）
 */
export function normalizeForMatching(text: string): string {
  return text.trim().replace(/\s+/, " ").toLowerCase().normalize();
}

/** 前缀跳转的字符缓冲状态（对齐原版keyPressBuffer；重挂计时器由调用方管理，见各消费点） */
interface PrefixSearchState {
  /** 已累计的匹配缓冲 */
  buffer: string;
}

/**
 * 前缀跳转单字符推进（对齐原版onDocumentKeyPress的字符分支）：连打同一字符时先在同前缀项间
 * 向后循环步进、否则把字符并入缓冲；当前项不存在或不匹配新缓冲时，自其向后环绕找首个文本
 * 命中项。文本口径对齐原版getItemMatcher(prefix)：两侧归一化后startsWith
 * @param state 缓冲状态（原地更新buffer）
 * @param char 本次输入的单个可打印字符
 * @param values 可选值序列（按展示顺序）
 * @param getText 取选项显示文本（原版读渲染后textContent）
 * @param current 导航起点（菜单可见时为高亮项/回退选中项，收起态为选中项）
 * @returns 命中的值；无命中时undefined
 */
export function advancePrefixSearch<T extends string | number>(
  state: PrefixSearchState,
  char: string,
  values: T[],
  getText: (value: T) => string,
  current: T | undefined,
): T | undefined {
  let item = current;
  if (state.buffer === char) {
    // 连打同字符：缓冲不变（仍是该字符），导航点先向后一步以循环同前缀项
    if (item !== undefined) {
      item = findRelativeSelectableItem(values, item, 1);
    }
  } else {
    state.buffer += char;
  }
  // 缓冲在一次扫描内不变，归一化提到闭包外只算一次
  const needle = normalizeForMatching(state.buffer);
  const matches = (value: T) => normalizeForMatching(getText(value)).startsWith(needle);
  if (item === undefined || !matches(item)) {
    item = findRelativeSelectableItem(values, item, 1, matches);
  }
  return item;
}

/**
 * 浮动定位/钳高类组件的视口四周留白缺省值（px），可经OOUIProvider.viewportSpacing覆盖；
 * MenuSelect/Popup/PopupToolGroup共用。缺省0对齐原版`OO.ui.getViewportSpacing`（站点若要
 * 避开固定头栏一类悬浮元素，由宿主显式配置）
 */
export const VIEWPORT_SPACING = 0;

/** 浮层尚未完成定位时的哨兵坐标（px）：先置于视口外，避免首帧在左上角闪现；MenuSelect/Popup/PopupToolGroup共用 */
export const OFFSCREEN_POSITION = -9999;

/**
 * 就近可滚动容器（对齐原版`getClosestScrollableElementContainer`：自父链向上取第一个
 * overflow 为 auto/scroll 的祖先），无则回退根元素。浮层的裁剪/钳高与滚出判定以此为
 * 可视区，视口即根元素。与原版的口径差异（只认 auto/scroll、恒查两轴、未命中回落
 * documentElement）见dev-docs/DEVIATIONS.md「等效替代」
 */
export function findScrollableContainer(el: HTMLElement | null): HTMLElement {
  let current = el?.parentElement ?? null;
  while (current && current !== document.body) {
    const style = getComputedStyle(current);
    if (/(auto|scroll)/.test(style.overflowY) || /(auto|scroll)/.test(style.overflowX)) {
      return current;
    }
    current = current.parentElement;
  }
  return document.documentElement;
}

/**
 * 将选项滚入其就近可滚动容器的可视区（`block:"nearest"` 语义：最小纵向位移使其完全可见），
 * 只对该容器施加位移、不冒泡到文档根。对齐原版 `SelectWidget.scrollItemIntoView` 经
 * `OO.ui.Element.static.scrollIntoView`「只对就近可滚动容器施加计算位移」的口径
 * （`oojs-ui.js:1347`、`:7642`）——而非原生 `Element.scrollIntoView`（后者会递归滚动含
 * window 在内的每一层可滚动祖先）。
 *
 * **就近容器落到文档根时不滚动**：菜单收起时面板停到屏外哨兵位（见 {@link OFFSCREEN_POSITION}），
 * 此刻对屏外选项做文档级滚动会把整页拽到顶部；而菜单选项导航本就只应在菜单自身的溢出区内
 * 滚动，从不需要滚动页面（放得下的菜单其选项恒可见、放不下的菜单自身即滚动容器）。原版靠
 * 「收起菜单仍留在锚点附近」（`togglePositioning(false)` 清空内联定位，`oojs-ui.js:5259`）使
 * 文档级位移约等于 0 而无副作用，本工程收起统一停到屏外，故在此收敛。代价：独立 `Select`
 * 若唯一可滚动祖先是页面本身，键盘导航不再滚动页面（deviations 见 dev-docs/DEVIATIONS.md）
 */
export function scrollOptionIntoView(option: HTMLElement): void {
  const container = findScrollableContainer(option);
  // 就近可滚动容器即文档根 → 位移只会滚动整页，按上述口径不做
  if (container === document.documentElement) {
    return;
  }
  const containerRect = container.getBoundingClientRect();
  const optionRect = option.getBoundingClientRect();
  // 容器 padding-box 的纵向可视范围：clientTop 为上边框宽、clientHeight 不含边框与横向滚动条
  const viewTop = containerRect.top + container.clientTop;
  const viewBottom = viewTop + container.clientHeight;
  let delta = 0;
  if (optionRect.top < viewTop) {
    // 上缘越界（选项高于可视区时亦按此对齐上缘）：上滚至上缘齐平
    delta = optionRect.top - viewTop;
  } else if (optionRect.bottom > viewBottom) {
    // 下缘越界：下滚至下缘齐平（block:"nearest" 的最小位移，不反使上缘越界）
    delta = optionRect.bottom - viewBottom;
  }
  if (delta !== 0) {
    container.scrollTop += delta;
  }
}

/**
 * 取元素的有效文本方向（'ltr'|'rtl'）。读取computed direction（继承dir属性与CSS），
 * 对齐原版`OO.ui.Element.static.getDir`的语义。portal出控件子树的浮层无法继承内容区方向，
 * 以锚点元素的有效方向为准
 */
export function getElementDir(el: HTMLElement | null | undefined): "ltr" | "rtl" {
  return getComputedStyle(el ?? document.documentElement).direction === "rtl"
    ? "rtl"
    : "ltr";
}

/** IME合成判据的入参形态：原生键盘事件，或携带`nativeEvent`的React合成事件 */
type ComposingKeySource =
  | { isComposing?: boolean; keyCode?: number }
  | { nativeEvent: { isComposing?: boolean; keyCode?: number } };

/**
 * 键盘事件是否处于IME合成期：合成期的按键（确认候选的Enter、选词的方向键等）不该驱动组件的
 * 开合、导航与提交。判据取`isComposing`与`keyCode === 229`——后者是部分环境（Windows等）在
 * 合成期对按键的通行上报方式，可补上`isComposing`未置位的场合。React合成事件经`nativeEvent`
 * 读取（其自身不携带`isComposing`）。本判据为原版所无的附加防御，覆盖处见
 * dev-docs/DEVIATIONS.md「增强」的IME条
 */
export function isComposingKeyEvent(event: ComposingKeySource): boolean {
  const source = "nativeEvent" in event ? event.nativeEvent : event;
  return !!source.isComposing || source.keyCode === 229;
}

/** 可视区边界（viewport-relative坐标，px）：浮层裁剪/钳高/滚出判定的统一可视范围 */
export interface VisibleBounds {
  /** 可视区上缘 */
  top: number;
  /** 可视区左缘 */
  left: number;
  /** 可视区右缘 */
  right: number;
  /** 可视区下缘 */
  bottom: number;
}

/**
 * 滚动容器的可视区边界（viewport-relative，px）：视口为`documentElement.clientWidth/Height`
 * 矩形（不含滚动条沟槽，对齐原版clip的viewportRect与computePosition钳制的`$container.innerWidth()`
 * 口径），元素容器扣除滚动条沟槽（RTL时沟槽在左，对齐原版clip的方向分支，oojs-ui.js:5826-5835）。
 * 纯几何口径：视口留白与clip buffer由调用方按原版对应机制计入（见{@link getClipBounds}），
 * 需要未内缩的原始边界时才直接用本函数（如滚出判定）。
 * useAnchoredPanelLayout与Popup的裁剪/钳高/滚出/翻转判定共用
 */
export function getVisibleBounds(scroller: HTMLElement): VisibleBounds {
  if (scroller === document.documentElement) {
    return {
      top: 0,
      left: 0,
      right: document.documentElement.clientWidth,
      bottom: document.documentElement.clientHeight,
    };
  }
  const rect = scroller.getBoundingClientRect();
  const gutterX = scroller.offsetWidth - scroller.clientWidth;
  const rtl = getComputedStyle(scroller).direction === "rtl";
  return {
    top: rect.top,
    left: rtl ? rect.left + gutterX : rect.left,
    right: rtl ? rect.right : rect.right - gutterX,
    bottom: rect.bottom - (scroller.offsetHeight - scroller.clientHeight),
  };
}

/**
 * 裁剪/翻转判定的可视区内缩量（px）：原版`ClippableElement.clip`给可视矩形四边各留7px余量
 * ——「Chosen by fair dice roll」，为阴影/边框留出空间，避免贴边即判为需裁剪/需翻转
 * （oojs-ui.js:5837-5844）。翻转与选侧的空间判定、钳高统一扣此量，对齐原版isClipped*的基准
 */
export const CLIP_BUFFER = 7;

/**
 * 裁剪/翻转/选侧判定的内缩可视边界（viewport-relative，px）：在给定可视边界之上计入视口留白
 * 与{@link CLIP_BUFFER}，对齐原版`clip()`的可视矩形——viewportSpacing只作用于html容器
 * （本工程的视口回落值即`documentElement`，`oojs-ui.js:5813-5829`），buffer四边恒计
 * （`:5837-5844`）。
 * 边界经传入而非内部重测：滚动/缩放回调里调用方通常已持有一份（滚出判定要用未内缩的原始
 * 边界），重复测量会在高频路径上多一次rect与computed style读取
 */
export function getClipBounds(
  bounds: VisibleBounds,
  scroller: HTMLElement,
  spacing: { top: number; right: number; bottom: number; left: number },
): VisibleBounds {
  const s =
    scroller === document.documentElement
      ? spacing
      : { top: 0, right: 0, bottom: 0, left: 0 };
  return {
    top: bounds.top + s.top + CLIP_BUFFER,
    left: bounds.left + s.left + CLIP_BUFFER,
    right: bounds.right - s.right - CLIP_BUFFER,
    bottom: bounds.bottom - s.bottom - CLIP_BUFFER,
  };
}

/**
 * 翻转定侧内核：「首选侧放得下→保持首选；否则试对侧；两侧都放不下时取空间更大的一侧
 * （相等时保持首选）」的共享判定。一次按预计算空间定侧，不做「先定位再测量」。
 * 消费方两处：`Popup`的`resolvePopupPosition`（四方位翻转，对齐原版`PopupWidget.toggle`
 * 的autoFlip，`dist/oojs-ui.js:6355-6406`）与`useAnchoredPanelLayout`的
 * `resolvePanelVerticalSide`（上下翻转，对齐原版`MenuSelectWidget.toggle`的
 * `static.flippedPositions`，`dist/oojs-ui.js:8940-8957`）
 * @param preferred 首选侧
 * @param opposite 由当前侧求对侧的映射（对侧与首选侧必同轴，required才可用单一标量）
 * @param spaceOf 取某一侧的可用空间
 * @param required 放下所需的最小空间（两侧同轴，故共用一个阈值）
 */
export function resolveFlipSide<A extends string>(
  preferred: A,
  opposite: (side: A) => A,
  spaceOf: (side: A) => number,
  required: number,
): A {
  if (spaceOf(preferred) >= required) {
    return preferred;
  }
  const other = opposite(preferred);
  return spaceOf(other) >= required || spaceOf(other) > spaceOf(preferred)
    ? other
    : preferred;
}

/**
 * 根节点内可聚焦元素选择器（原版`OO.ui.findFocusable`候选集的近似，既有差异：多含
 * `iframe`、不含`object`与`area[href]`）：已排除`tabIndex=-1`与表单控件的`disabled`。
 * 选择器表达不了的两项——非表单控件的`disabled`与「不可见」——由
 * {@link isFocusableElement}在运行期兜底。Dialog的焦点陷阱、布局切换的自动聚焦与
 * Popup的Tab边界共用同一口径
 */
const FOCUSABLE_SELECTOR = [
  "a[href]",
  "input:not([disabled])",
  "select:not([disabled])",
  "textarea:not([disabled])",
  "button:not([disabled])",
  "iframe",
  '[tabindex]:not([tabindex="-1"])',
  '[contenteditable]:not([contenteditable="false"])',
].join(",");

/**
 * 候选元素是否真正可聚焦（对齐原版`OO.ui.isFocusableElement`在CSS选择器之外的运行期判定）：
 * `disabled`兜底覆盖非表单控件；可见性优先用原生`checkVisibility({visibilityProperty:true})`
 * ——一条调用同时覆盖`display:none`、`content-visibility:hidden`（如IndexLayout未激活面板的
 * `hidden="until-found"`，内容仍占位、rects非空）与自身/祖先的`visibility:hidden`，较逐元素
 * 读computed style便宜得多。支持面为Chrome/Edge 105+、Firefox 106+、Safari 17.4+
 * （Baseline自2024-03广泛可用），缺失时回退「`getClientRects()`非空（等价原版
 * `$.expr.pseudos.visible`：display:none子树内无布局盒）+ 祖先`visibility`计算值遍历」
 * （等价原版`.parents().addBack()`的过滤）
 */
function isFocusableElement(el: HTMLElement): boolean {
  if ((el as HTMLElement & { disabled?: boolean }).disabled) {
    return false;
  }
  if (typeof el.checkVisibility === "function") {
    return el.checkVisibility({ visibilityProperty: true });
  }
  if (el.getClientRects().length === 0) {
    return false;
  }
  for (let node: HTMLElement | null = el; node; node = node.parentElement) {
    if (getComputedStyle(node).visibility === "hidden") {
      return false;
    }
  }
  return true;
}

/** 取根节点内可聚焦元素（文档顺序；不可见与禁用者已按{@link isFocusableElement}排除） */
export function getFocusableElements(root: ParentNode | null | undefined): HTMLElement[] {
  return Array.from(root?.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR) ?? []).filter(
    isFocusableElement,
  );
}

/** 取根节点内第一个可聚焦元素（跳过不可见/禁用者，判定同{@link getFocusableElements}） */
export function getFirstFocusable(
  root: ParentNode | null | undefined,
): HTMLElement | undefined {
  const candidates = Array.from(
    root?.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR) ?? [],
  );
  return candidates.find(isFocusableElement);
}

/**
 * 临时改写类集合执行同步测量后恢复原状态：`remove`中的类在测量期移出、`add`中的类在测量期
 * 加入，测量后在finally中按测量前的有无各自复原。用于"必须以某个确定状态为测量基准"
 * 的场景（工具栏窄栏判定以未压缩宽度为基准、MessageDialog动作区判定以横向布局为基准），
 * 恢复置于finally：测量抛错也不残留临时状态
 */
export function withTemporaryClasses(
  el: HTMLElement,
  changes: { remove?: readonly string[]; add?: readonly string[] },
  measure: () => void,
): void {
  const removed = (changes.remove ?? []).filter((className) =>
    el.classList.contains(className),
  );
  const added = (changes.add ?? []).filter(
    (className) => !el.classList.contains(className),
  );
  for (const className of removed) {
    el.classList.remove(className);
  }
  for (const className of added) {
    el.classList.add(className);
  }
  try {
    measure();
  } finally {
    for (const className of added) {
      el.classList.remove(className);
    }
    for (const className of removed) {
      el.classList.add(className);
    }
  }
}

/** URL协议白名单（对齐原版`OO.ui.isSafeUrl`；该列表与原版注释要求的php/Tag.php保持同步） */
const SAFE_URL_PROTOCOLS = [
  "bitcoin",
  "ftp",
  "ftps",
  "geo",
  "git",
  "gopher",
  "http",
  "https",
  "irc",
  "ircs",
  "magnet",
  "mailto",
  "mms",
  "news",
  "nntp",
  "redis",
  "sftp",
  "sip",
  "sips",
  "sms",
  "ssh",
  "svn",
  "tel",
  "telnet",
  "urn",
  "worldwind",
  "xmpp",
];

/**
 * Sanitize a URL: when its protocol is not in the whitelist and it is not a
 * relative / query / fragment prefix, prepend `./` to neutralize it into a
 * relative path, so dangerous protocols like `javascript:` / `data:` are inert on
 * `href` / `action`. An empty string is treated as safe. Components do **not**
 * rewrite URLs automatically — screen untrusted URLs yourself, or apply this
 * function explicitly.
 *
 * 净化 URL：协议不在白名单内、且不是相对 / 查询 / 片段前缀时，加 `./` 前缀
 * 中和成相对路径，使 `javascript:` / `data:` 一类危险协议在 `href` / `action`
 * 上失效。空串视为安全。本工程组件不自动改写 URL，来源不可信的 URL 须由
 * 调用方或后端筛过，需要时显式使用本函数。
 */
export function sanitizeUrl(url: string): string {
  if (url === "") {
    return url;
  }
  for (const protocol of SAFE_URL_PROTOCOLS) {
    if (url.startsWith(`${protocol}:`)) {
      return url;
    }
  }
  if (
    url.startsWith("/") ||
    url.startsWith("./") ||
    url.startsWith("?") ||
    url.startsWith("#")
  ) {
    return url;
  }
  return `./${url}`;
}
