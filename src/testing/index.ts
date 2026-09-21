/**
 * 测试共享工具（仅测试使用，不进 `src/index.ts` 导出面，也不参与构建产物）。
 *
 * 此处是测试共享工具的唯一权威实现：
 * **测试文件只引用，不再重复定义或复述本文件的说明**。
 */

/**
 * 让出宏任务一次，使 React 提交与 effect 走完。
 *
 * 仅用于"经 `dispatchEvent` 合成事件驱动"的用例——合成事件不经 React 的事件池 flush，
 * state 更新要等一轮才落到 DOM。断言 DOM 属性/类名本身不需要它；能用 locator 自动等待
 * （`await expect.element(...)`）或 `expect.poll` 表达的场景，优先用那两种。
 * @param ms 让步时长，缺省 20ms；带 CSS 过渡的动画时序由调用方放宽——浮层开合
 * （Popup / PopupButton）缺省一拍不够，统一用 `tick(30)`
 */
export const tick = (ms = 20): Promise<void> =>
  new Promise((resolve) => setTimeout(resolve, ms));

/**
 * 组件根元素（渲染容器 `container` 的首个子节点）。
 *
 * 本库组件的根一律是 `oo-ui-widget` 那一层，故"首子即根"；需要窄化到具体元素类型时用
 * 泛型参数（如 `getRoot<HTMLInputElement>(screen)`），不要再在测试文件里另抄一份带断言的
 * 本地定义。**测试取根一律经本函数，不得内联 `container.firstElementChild`。**
 *
 * 不适用多根 / portal 类组件：其根不在容器首子（如浮层面板经 portal 挂到 `document.body`），
 * 那类节点仍按需在用例内以全局或容器查询取得（见 `src/testing/toolGroups.ts` 的 `getPanel`）。
 */
export const getRoot = <T extends Element = HTMLElement>(screen: {
  container: Element;
}): T => screen.container.firstElementChild as T;

/**
 * 按 `data-testid` 在渲染容器内查元素（harness 自定的定位钩子）。
 */
export const getTestId = (screen: { container: Element }, id: string): HTMLElement =>
  screen.container.querySelector<HTMLElement>(`[data-testid="${id}"]`)!;

/**
 * 以原生 `keydown` 事件模拟一次按键（chromium 里 React 根容器的委托监听会正常收到它，
 * 进而入组件的合成事件分支）。
 *
 * 不用 `locator.press()`：它附带真实的焦点转移与滚动行为，会用例里“先 focus() 再按键”
 * 的既定前提变得不确定。另注意合成 keydown **不会派生 keypress**，需覆盖前缀跳转的
 * document `keypress` 监听时，得再显式派发一次 `keypress`。
 */
export const pressKey = (el: Element, key: string): void => {
  el.dispatchEvent(
    new KeyboardEvent("keydown", { key, bubbles: true, cancelable: true }),
  );
};

/**
 * 单发一次原生 `click`。不用 Playwright 的 `locator.click()`：真实点击会移动虚拟光标，
 * 静止光标下的 DOM 变化会被浏览器补发 `mouseover`，悬停高亮将干扰键盘导航/高亮类断言。
 *
 * checkbox / radio 类组件的勾选、改选也用它：React 把这类输入的 `onChange` 归一到 click
 * 模拟通道，派发 `click` 即触发变更，无需另造 `change` 事件。
 * @param init 覆盖修饰键等（如 Shift+点击范围选择传 `{ shiftKey: true }`）
 */
export const clickElement = (el: Element, init: MouseEventInit = {}): void => {
  el.dispatchEvent(new MouseEvent("click", { bubbles: true, cancelable: true, ...init }));
};

/**
 * 鼠标按压流：成对派发 `mousedown`+`mouseup`（对齐原版"按下进入、松开提交"的拖拽流语义）。
 *
 * 原版多数选项/工具的选定走此流（`mousedown` 在目标上进入按压、`mouseup` 经 document 提交），
 * 故模拟选定用本函数而非单发 click。需要完整"点击"三连（含 `click` 事件）时在调用点组合
 * `pressMouse(el); clickElement(el);`——事件顺序与原三连一致。
 */
export const pressMouse = (el: Element): void => {
  for (const type of ["mousedown", "mouseup"] as const) {
    el.dispatchEvent(new MouseEvent(type, { bubbles: true, cancelable: true }));
  }
};

/**
 * 向受控输入元素写入一段值（`input` 与 `textarea` 通用）。
 *
 * 必须走原型 setter：React 在实例上记录了当前值，直接赋 `el.value` 会被它判定为"值未变化"
 * 而丢弃 input 事件，组件收不到变更。改用 `locator.fill()`/`userEvent.type()` 会附带真实
 * 焦点与逐字符键位行为，只在需要那套语义（如 IME、退格）时才用它们。
 */
export const typeValue = async (
  el: HTMLInputElement | HTMLTextAreaElement,
  value: string,
): Promise<void> => {
  const proto =
    el instanceof HTMLTextAreaElement ? HTMLTextAreaElement : HTMLInputElement;
  const setter = Object.getOwnPropertyDescriptor(proto.prototype, "value")!.set!;
  setter.call(el, value);
  el.dispatchEvent(new Event("input", { bubbles: true }));
  await tick();
};

/**
 * 取元素的 `innerHTML` 并把 id 类属性值归一化为 `r#`，供 `toMatchInlineSnapshot` 使用。
 *
 * React `useId` 在同一页面跨 root 累计且为 base32 编码（r0、r1…ro、rp…），取值随用例执行
 * 顺序漂移；归一化后锁定"id 及其引用结构存在"，不锁定计数值。归一化的属性清单为并集
 * （含 `aria-controls`）——浮层类组件随时可能新增引用属性，缺一项就会把真实 id 锁进快照。
 */
export const snapshotHTML = (el: Element): string =>
  el.innerHTML.replace(
    /((?:id|aria-labelledby|aria-describedby|aria-activedescendant|aria-owns|aria-controls)=")([^"]*)(")/g,
    (_match, prefix: string, value: string, suffix: string) =>
      prefix +
      value
        .split(" ")
        .map((v) => v.replace(/^r[0-9a-v]+(-\d+)?$/, "r#$1"))
        .join(" ") +
      suffix,
  );

/**
 * 等弹窗打开动画跑完（active≈0ms→setup 60ms→ready 120ms）后再断言。
 *
 * ready 前动作按钮与焦点归位均未就绪，早断会抢跑；时长留余量，不随动画调参反向脆弱。
 */
export const openSettled = (): Promise<void> =>
  new Promise((resolve) => setTimeout(resolve, 200));
