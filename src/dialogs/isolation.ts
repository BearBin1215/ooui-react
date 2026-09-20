/**
 * 弹窗内容隔离：弹窗处于打开周期时，除「通往最上层弹窗管理器的那条路径」以外的兄弟节点
 * 一律加`aria-hidden="true"`与`inert`（屏幕阅读器与指针/焦点都被挡在弹窗内），关闭后撤销。
 * 最上层按DOM顺序取（portal按挂载顺序追加，叠放视觉由管理器根在body中的先后决定）；
 * 两个属性各自独立判定（已`aria-hidden="true"`的节点照常补`inert`，`aria-hidden="false"`
 * 的节点两个都补——本工程的管理器根即此情形）；撤销`aria-hidden`时还原为被覆盖的原值
 * （该属性由React渲染，一律移除会让React的DOM与其vdom失同步）；`inert`非React托管属性，
 * 撤销即移除——调用方若在隔离范围内的节点上声明`inert`（React 19起支持该prop），
 * 其移除同样会与vdom失同步，勿在背景节点上声明。标记只作用于DOM属性，
 * 遮罩与视觉仍由主题CSS承接。与原版`WindowManager.toggleIsolation`
 * （`dist/oojs-ui.js:25377-25434`）的机制差异见dev-docs/DEVIATIONS.md「等效替代」
 */

/** 处于打开周期的弹窗登记表：key为弹窗实例的登记句柄，value为其管理器根元素 */
const isolatedManagers = new Map<object, HTMLElement>();

/**
 * aria-hidden的原值登记：节点首次进入标记集时快照，跨重建持久、不因重建重写——重建期
 * 「还原→重标」的反复快照会把React在标记期间改写的值当原值回写（React只在自身vdom变化时
 * 写DOM，本模块的中间态对它不可见）。节点退出标记集时才还原并移除
 */
const ariaHiddenOriginals = new Map<HTMLElement, string | null>();

/** 当前被本模块标记inert的节点集合（inert非React托管属性，重建时按集合差量增删） */
const markedInert = new Set<HTMLElement>();

/** 还原节点的aria-hidden原值并移出登记 */
function restoreAriaHidden(node: HTMLElement): void {
  // get对在册节点恒返回string|null（undefined仅在键不存在时出现，而唯一调用点遍历在册键），
  // 类型层兜底并入null（属性原本不存在）分支
  const previous = ariaHiddenOriginals.get(node) ?? null;
  ariaHiddenOriginals.delete(node);
  if (previous === null) {
    node.removeAttribute("aria-hidden");
  } else {
    node.setAttribute("aria-hidden", previous);
  }
}

/** 按当前登记表差量重建隔离标记：仅增删目标集变动的节点，已在标记中的节点不重写 */
function applyIsolation(): void {
  const managerRoots = [...isolatedManagers.values()];
  // 最上层 = DOM顺序最后的管理器根（且须已挂载：卸载期短暂脱离DOM的管理器不参与判层）。
  // 按登记序判定会失步：「关闭后重开」的弹窗在登记表排到末位、DOM位置未变，其叠放视觉
  // 由body中的先后决定（见「弹窗子树内浮层层值」条），与登记序不再一致
  const isAfter = (node: HTMLElement, other: HTMLElement): boolean =>
    !!(node.compareDocumentPosition(other) & Node.DOCUMENT_POSITION_FOLLOWING);
  const topRoot = managerRoots.reduce<HTMLElement | null>((top, root) => {
    if (!root.isConnected) {
      return top;
    }
    return top === null || isAfter(top, root) ? root : top;
  }, null);
  // 目标标记集：最上层管理器根路径以外的兄弟（以body为界）；无可连的最上层时为空（全撤）
  const targets = new Set<HTMLElement>();
  if (topRoot) {
    // 可见路径：最上层管理器根及其全部祖先（到body为止），路径上的节点一律不标记
    // （含嵌套时作为其祖先的其它管理器）
    const visiblePath = new Set<Element>();
    for (
      let el: Element | null = topRoot;
      el && el !== document.body;
      el = el.parentElement
    ) {
      visiblePath.add(el);
    }
    // 逐层向上收集兄弟
    for (
      let el: Element | null = topRoot;
      el && el !== document.body;
      el = el.parentElement
    ) {
      const parent: Element | null = el.parentElement;
      if (!parent) {
        break;
      }
      for (const sibling of Array.from(parent.children)) {
        // script不参与可访问性树；路径上的节点必须保持可见
        if (visiblePath.has(sibling) || sibling.tagName === "SCRIPT") {
          continue;
        }
        targets.add(sibling as HTMLElement);
      }
    }
  }
  // 撤销退出目标集的节点：aria-hidden还原到原值登记中的原值，inert直接移除。
  // 已被React卸载的节点无从还原、其属性随节点一并消失，只出账——否则登记表持元素强引用累积
  for (const node of [...ariaHiddenOriginals.keys()]) {
    if (!targets.has(node)) {
      if (node.isConnected) {
        restoreAriaHidden(node);
      } else {
        ariaHiddenOriginals.delete(node);
      }
    }
  }
  for (const node of markedInert) {
    if (!targets.has(node)) {
      if (node.isConnected) {
        node.removeAttribute("inert");
      }
      markedInert.delete(node);
    }
  }
  // 施加/维持标记：新节点快照原值入登记；已在登记中的节点只在值被外部（如React）改写时
  // 重申标记，不重快照原值
  for (const node of targets) {
    if (!ariaHiddenOriginals.has(node)) {
      ariaHiddenOriginals.set(node, node.getAttribute("aria-hidden"));
    }
    if (node.getAttribute("aria-hidden") !== "true") {
      node.setAttribute("aria-hidden", "true");
    }
    if (!node.hasAttribute("inert")) {
      node.setAttribute("inert", "");
    }
    markedInert.add(node);
  }
}

/**
 * 登记弹窗进入打开周期并施加隔离；已登记时为幂等更新（如管理器根挂载后重新登记）
 * @param handle 弹窗实例的稳定句柄对象，作为登记表key
 * @param managerRoot 该弹窗的管理器根元素（路径起点，其祖先链以外的节点被隔离）
 */
export function acquireIsolation(handle: object, managerRoot: HTMLElement): void {
  isolatedManagers.set(handle, managerRoot);
  applyIsolation();
}

/** 注销弹窗的隔离登记（teardown完成或组件卸载时调用），最后一个注销时撤销全部标记；未登记时为空操作 */
export function releaseIsolation(handle: object): void {
  if (isolatedManagers.delete(handle)) {
    applyIsolation();
  }
}
