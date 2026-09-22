# ooui-react 对照开发指南（原版 oojs-ui vs React 版）

本组件库以 React 重新实现 [OOUI](https://www.mediawiki.org/wiki/OOUI)，依托 MediaWiki 站点自带样式，不自带 CSS。开发复杂组件时必须与本地安装的原版 `oojs-ui` 做行为对照，确保交互语义（键盘、焦点、a11y、边界值）一致。

本文的四块内容：**对照开发流程**（§1）、**对照页基础设施**（§2，playground 的原版侧加载、主题/方向切换、对照页骨架与原版固有行为）、**关键经验**（§3，跨组件踩坑沉淀）、**共享抽象索引**（§4，动手前先查是否已有对应实现）。另有全局能力映射（§5）、浏览器自动化验证（§6）与验收清单（§7）。

与其他文档的分工：组件对外 API 与用法见文档站（`docs/` 的组件页与 guide 各章）；与原版的行为差异（舍弃 / 增强 / 等效替代 / 暂未实现）一律记入 `dev-docs/DEVIATIONS.md`，本文不重复记录，只在必要时给出指针。差异的消费方落点与台账元数据的同步契约见 `dev-docs/DEVIATIONS.md`「双层文档契约」节；本文引用差异时优先给条级 id（`dev-*`）而非「某节某条」。

## 1 对照开发流程

新组件（尤其是有交互的）按以下步骤开发：

1. **精读原版源码**，整理行为清单。原版未压缩源码在 `node_modules/.pnpm/oojs-ui@<版本>/node_modules/oojs-ui/dist/oojs-ui.js`（合并版，含 core/widgets/windows/主题类）。定位技巧：搜 `OO.ui.<类名>.prototype.<方法> = function` 逐个方法读。
2. **列出差异清单**：逐项对照构造函数 config、事件绑定、键盘处理、a11y 属性、边界值，再决定修复 / 实现 / 记差异。
3. **建对照页**（见 §2），与原版并排实测。
4. **行为验收**：肉眼对比动画观感 + 自动化脚本验证数据（见 §6）。
5. 无法对齐的低频行为记入 `DEVIATIONS.md`（按其「双层文档契约」节回填元数据与文档落点），并在对照页说明。
6. **文档回归**：Agent和用户协作过程中，如果要求的方案和本文档冲突，回归修改本文档。

## 2 对照页基础设施（playground）

### 2.1 原版库加载

- 原版库依赖全局 `jQuery` / `OO`，其 dist 是 IIFE（挂在 `this` 上），不能直接打包 import。
- dist 文件在 `playground/src/components/ooui.ts` 顶部以 `?url` 引入（文件保留在 node_modules，不入库、随依赖升级），如 `import oouiUrl from 'oojs-ui/dist/oojs-ui.js?url'` 得到 URL 字符串，运行时注入 `<script>`。`vite.config.ts`（仓库根目录，`root` 指向 playground）经别名把 `ooui-react` 指向 `src/index.ts`；子路径 `ooui-react/locales/*` 须单列别名条目（字符串别名按前缀匹配会吞掉子路径）。
- `ensureOOUI()`（`ooui.ts`）：按 `jquery → oojs → oojs-ui → 主题` 顺序注入四个脚本到全局，返回 `OO` 命名空间。有三点必须遵守：
  - 脚本注入必须 `script.async = false`（动态脚本默认按**下载完成顺序**执行，大文件会乱序）；
  - 每个脚本带 id 去重（防 HMR / StrictMode 双跑导致 `customElements.define` 重复注册）；
  - 模块级 promise 单例（StrictMode effect 双调用只注入一次），失败时清空单例以便重试。
- `useOriginalWidgets(build)`（`playground/src/components/original.ts`）封装「`ensureOOUI` → `build` 创建原版控件 → 卸载统一 destroy」，返回 `{ containerRef, status }`（`status` 为「原版已就绪」，供自动化等待，见 §6）。`build` 内用 `createOOUIWidgets()` 返回的 `register` 登记原版控件——原版只有 Toolbar / ToolGroup / Tool / WindowManager 有 `destroy`，普通 widget 的监听在自身子树内，随宿主容器卸载一并清理。
- `unwrapJQuery($el)`：jQuery 对象取真实 DOM 节点（`appendChild` 用）。`createRowAppender(container, register)` 输出与 React 侧逐行对照的「名称 + 控件」行（行容器为何用 `div` 见其 jsdoc）；`appendValueOutput(widget)` 在行尾追加实时值读数 `span`，供两侧逐行展示取值。

### 2.2 主题与方向切换

playground 头部可在 wikimediaui / apex 两个原版主题与 LTR / RTL 两个方向间切换（另有语言与移动端形态开关）。主题 = JS 类实例 + 样式表两部分：

- **主题 CSS 以文本导入，不走文档样式注入**：`ooui.ts` 顶部 `import ... from 'oojs-ui/dist/oojs-ui-wikimediaui.css?inline'` 经 Vite CSS 管线得到处理后的文本字符串。普通 import 会把两份主题样式无条件打进文档、无法整体切换；`?raw` 则不会重写图标 url。0.54 起主题 CSS 引用 Codex 设计令牌（`var(--*)` 约 450 处）但自身不定义，令牌表（`@wikimedia/codex-design-tokens`）须一并前置注入。
- **图标 url 构建期重写**：主题 CSS 内图标是相对路径（`themes/wikimediaui/images/icons/xxx.svg`），做成 Blob URL 后相对引用会以 `blob:` 为 base 而全部失效。`?inline` 导入时 Vite 的 CSS 管线会将 `url()` 重写为构建资源 URL（小图标内联为 data URI），文本即可直接 `new Blob([...])` + `URL.createObjectURL` 生成样式表地址（按主题 + 方向缓存，避免重复生成）。
- **方向各有整份样式表**：每个主题另有 `.rtl.css` 整文件翻转版（没有 `[dir]` 选择器），按方向选用其一，故缓存键是「主题 + 方向」。
- **切换样式表用整节点替换，不用 `link.disabled` 互斥**：在样式表**加载完成前**设置 `disabled` 会中止加载，之后翻转标志位也不会恢复（浏览器行为）。`applyThemeCss(theme, dir)` 直接移除旧 `<link>`、追加新节点，同一时刻只存在一份。
- **JS 侧：主题类共存，切换即重建实例**：两份主题脚本加载后主题类共存于 `OO.ui`（`WikimediaUITheme` / `ApexTheme`），`setOOTheme(theme)` 懒加载对应主题脚本后以 `ui.theme = new ThemeClass()` 重建实例（apex 按需懒加载，wikimediaui 随 `ensureOOUI()` 主流程注入）。原版控件在**构造时**读取主题实例，切换只影响此后新建的控件。
- **已挂载控件靠 remount 重建**：时序为先 `setOOTheme`（切 JS）→ `applyThemeCss`（切 CSS）→ 触发渲染重挂；`playground/src/App.tsx` 内容区（`Layout.Content`）以模板串 `${theme}-${dir}` 作为 `key` 强制 remount，使两侧已挂载控件在新主题 / 方向下全部重建。方向切换另需先改 `document.documentElement.dir` 再换样式表（普通组件经 DOM 继承 direction，portal 浮层经锚点解析）。

### 2.3 对照页骨架与读数工具

- 页面文件放 `playground/src/pages/xxx-compare/index.tsx`，并在 `playground/src/routes.ts` 的 `compareRoutes` 登记（`path` 即目录名，`group` 决定侧栏分组）。
- 页面骨架用 `CompareLayout` + `CompareColumns`（`playground/src/components/CompareLayout.tsx`）：左列原版、右列本组件库，两侧标题与列宽一致。
- 动态 ARIA（`aria-expanded` / `aria-activedescendant` / `aria-owns` 等）经 `AriaProbe`（`playground/src/components/AriaProbe.tsx`）实时读数，免去逐次查 DOM；`findOwnedMenu(owner)` 按 `aria-owns` 定位触发控件自己的菜单面板——比按「浮层在哪一侧」筛选精确到实例，也用于自动化定位（见 §6）。

### 2.4 原版库固有行为（构造对照页时必读）

- **`MessageDialog` 的 `size` 只在 `open()` 的 data 里生效**：`getSetupProcess` 每次打开都以 `data.size ?? static.size`（static 为 `'small'`）覆写本次开窗值，构造期传的 `{ size }` 不生效。展示多尺寸弹窗须经 `dialog.open({ size })`。
- **同一 `WindowManager` 的窗口按 `constructor.static.name` 注册**：`addWindows` 以类静态 name 为 key，同类多实例互相覆盖，只有最后一个真正挂载。同类多窗口须各自配一个 manager（`dialog-compare` 页五尺寸即五个 manager）。
- **工具在工具栏内按组独占**：`ToolGroup.populate` 经 `toolbar.isToolAvailable(name)` / `reserveTool` 预留工具，同一工具在一条工具栏内只能进一个工具组；被别的组预留后本组拿不到工具，组被标记 `oo-ui-toolGroup-empty` 而静默隐藏。对照页安排多组工具时各组必须用不同的工具名（`toolbar-compare` 页即因此踩坑）。
- **原版侧只能沿可用路径构造**：原版有些状态无法经构造配置表达（如 `SelectFileInputWidget` 构造期传 `value` 会被丢弃，只能构造后 `setValue`）。对照页要按原版**可用**的路径构造，否则同一行两侧状态不同，会看起来像 React 侧实现错了。
- **`OO.ui.isMobile()` 在 dist 里是恒返回 `false` 的桩**（源码注释即「由实现方决定」，dist 中没有任何组件把它覆盖成真值），原版所有移动端分支在纯 OOUI 环境下都不可达。本工程把它映射为 `OOUIProvider.isMobile`（见 §5），配置后这些分支才可达；遇到「原版有、React 版没有」的移动端差异时，先确认原版该分支是否真的可达。
- **`FloatableElement.hideWhenOutOfView` 只给浮层加 `oo-ui-element-hidden` 类，并不改写 `aria-expanded`**：本工程把 `outOfView` 收敛在组件内部、由调用方维持 `aria-expanded`，两者行为一致，不是差异。
- **原版个别配置的 JSDoc 与代码相悖，对照时以代码行为为准**：`PopupWidget` 的 `align: 'force-left'/'force-right'`，JSDoc（`dist/oojs-ui.js:6001-6002`）两行描述的是同一条映射（第二行是复制后未做镜像），按字面读会得出「force-left 在 LTR 等价 forwards」这种与名字相反的规范；实际行为见同文件 `alignMap`（`:6488-6497`）——LTR 下 `force-left → backwards`、RTL 下 `force-left → forwards`（`force-right` 反向），即弹层体恒在锚点的物理左/右侧、不随方向翻转，与 <https://www.mediawiki.org/wiki/OOUI/Widgets/Popups> 的配置说明（*the popup body is aligned to the left/right of the anchor in both LTR and RTL contexts*）一致。本工程按代码实现（`src/widgets/Popup/popupLayout.ts` 的 `resolveAlign`，断言见同目录 `popupLayout.test.ts`）。

## 3 关键经验（踩坑沉淀）

### 3.1 动画与测量

- **frame 的 transition 只做 `opacity + transform`，不要 `all`**：布局属性（如 height）参与过渡会产生「从矮到高」的观感，且过渡期间 body 溢出出现滚动条。`opacity + transform` 是纯视觉效果，不影响布局。JSX 内联写法如 `transition: 'opacity 0.25s, transform 0.25s'`。
- **测量必须在 paint 前完成**（`useLayoutEffect`），且**测量前先把目标瞬时钳制到初始值**（如 `height: 0`）再设最终值。若过渡含布局属性，钳 0 后 `scrollHeight` 仍会被上一帧盒子高度垫高，导致每次开合尺寸递增。
- **不要把会动画的属性写死在 JSX style**：React 每次渲染都会重置 DOM style，命令式设置的值会被抹掉（这是多个诡异 bug 的根源）。
- **测量手段与结果的去向**：需要在不干扰真实受控元素的前提下测量时用**离屏克隆**节点（把真实元素的盒模型与字体同步到克隆节点，见 `widgets/Input/autosize.ts`、`widgets/TagMultiselect/useInlineInputWidth.ts`）。高度类测量结果**经 state 回到渲染流程**，不要命令式写 DOM；宽度类只能命令式写 `style.width`（React 不接管该内联样式，也就**不得写进 JSX style**，否则每次渲染被抹掉）。

### 3.2 事件与键盘

**浮层关闭**

- **浮层的 Escape 统一在捕获阶段处理并 `stopPropagation`**（`hooks/dismiss.ts` 的 `useDismissablePopover`）：Popup / MenuSelect / PopupToolGroup 都经它关闭。Dialog 的 ESC 是 React `onKeyDown`（冒泡阶段、绑在弹窗根），故弹窗内嵌套浮层的 ESC 只会关最内层浮层。新增浮层必须复用该 hook，不要各自写 document 监听——否则 ESC 会同时关掉浮层与弹窗。
- **「点击外部关闭」按原版分两档**：`useDismissablePopover` 的 `dismissOnClick` 缺省 `false`（只监听 `mousedown`），对齐原版**菜单类**浮层（`MenuSelectWidget` 的 autoHide 只绑 mousedown）；**弹层类**（本工程 Popup / PopupToolGroup）须置 `true`——原版 `PopupWidget.bindDocumentMouseDownListener` 同绑 `mousedown` 与 `click`（iOS Safari 所需），PopupToolGroup 原版绑的是 `mouseup` / `keyup`，本工程统一以 mousedown + click 承担同样的外点关闭。两侧都忽略 `document.documentElement` 目标（滚动条上的按下不关浮层）；同绑两个事件时须做「以先触发者为准」的去重，否则受控父级会收到两次关闭请求。
- **菜单开启时 Escape 的附带动作须经 `onEscape` 回调**：浮层关闭监听在 document 捕获阶段消费 Escape 并 `stopPropagation`，组件的输入框 `onKeyDown` 收不到该事件（嵌套浮层只关最内层依赖此吞键）。原版 `MenuTagMultiselectWidget` 的 Escape 清空输入走输入框 keydown（`doInputEscape`），与菜单关闭两个都发生；React 版须在 `useMenuPopup` / `useDismissablePopover` 上传 `onEscape`（如 `() => setInputValue('')`）补齐，不要指望输入框的 Escape 分支在菜单开启时执行。

**键盘与选择语义**

- **React 合成 `wheel` 事件是 passive 的**，`preventDefault()` 无效。需要阻止默认行为的滚轮处理必须用原生监听：`element.addEventListener('wheel', fn, { passive: false })`。
- **`choose` 与 `select` 是两个事件，别合并成一个回调**：原版 `chooseItem` 先 `selectItem`（命中已选中项时提前返回、不派发 `select`），再无条件的派发 `choose`；菜单的收起走的是 `MenuSelectWidget.hideOnChoose` 这一 `choose` 路径，与值是否变化无关。本工程菜单显隐由调用方持有，故 `Select` 同时给出 `onChange`（值变化）与 `onChoose`（每次选定，含重复选定当前项），前者先派发、后者随后，Dropdown / ComboBoxInput 用后者收起菜单——只用 `onChange` 会导致「重复选定当前项时菜单关不掉」。
- **选择组的键盘形态由选项的 `static.highlightable` 决定**：原版 `SelectWidget.onDocumentKeyDown` / `onDocumentKeyPress` 对命中项分流——可高亮则 `highlightItem`（↑↓ 移动高亮、Enter 选中），不可高亮则直接 `chooseItem`（↑↓ 即改选）。已核对的静态配置：`OptionWidget` / `MenuOptionWidget` / `OutlineOptionWidget` 为可高亮，`RadioOptionWidget` / `TabOptionWidget` / `ButtonOptionWidget` / `MenuSectionOptionWidget` 为不可高亮。新增选择组时先查该静态值，再决定走 `useMenuPopup` 的高亮导航还是 `useGroupKeyboardSelection`；`aria-activedescendant` 也随之分流（可高亮指向高亮项，不可高亮指向选中项）。
- **多选展示统一走 `Select.selectedValues`**：传入即进入多选展示（命中集合的选项输出选中态、`aria-multiselectable=true`，单值 `value` 不再参与展示），选中提交仍走 `onChange` / `onChoose`（单值语义），多选语义由调用方维护（`MenuTagMultiselect` 的标签集合）。`MenuSelect` 透传该 prop，新增需要「菜单多项选中」的组件复用此通道，不要另建多选选择组件。
- **焦点在输入框、由它驱动列表高亮的组合**（SearchWidget 形态）：keydown 挂在输入框所在容器上、受控驱动 `Select` 的 `highlightedValue`；同时必须把 `aria-activedescendant` 的落点交给真正持有 DOM 焦点的元素——即 `Select` 的 `focusOwnerRef`（对齐原版 `setFocusOwner`；原版 `SearchWidget` 经 `results.setFocusOwner(query.$input)` 实现；Dropdown / ComboBoxInput 落触发器、TagMultiselect 落输入框或焦点陷阱 `span`，对应原版 `MenuSelectWidget` 以 `config.widget.$tabIndexed` 为归属元素）。不交出去会留下两处偏差：`activedescendant` 挂在无焦点的列表根上（读屏器读不到活动项）、列表根可聚焦成为多余 Tab 停靠点。`Select` 的缺省即不输出 `tabindex`（对齐原版 `SelectWidget` 根非 `TabIndexedElement`），组合侧**无需**为此传 `tabIndex={-1}`——只有确实需要编程聚焦列表根的组合才显式传值，口径见 DEVIATIONS「等效替代」的 `Select` 条。
  `activedescendant` 的**开合时点**同样对齐原版 `MenuSelectWidget.toggle`：经 `MenuSelect` 使用时随菜单显隐门控（`Select.focusOwnerActive`）——打开时无高亮则指向当前选中项、关闭时从焦点归属元素移除（隐藏选项的 id 不留在触发元素上）；例外是 Dropdown 的聚焦期（`MenuSelect.screenReaderMode`），原版该期内 `highlightItem` 照常写回 `$focusOwner`，故管理期一并延长。SearchWidget 这类输入框常驻驱动的独立组合不经门控（不传即恒管理）。

**工具组按压流**

- **原版 `Tool.active` 兼作瞬时按压视觉态**：`ToolGroup` 在 mousedown 时 `pressed.setActive(true)`、松开复位，故原版 `onSelect` 内不能以 `isActive()` 取反实现切换（读到的是按压态），须用应用自有标志（官方 Demo 的 `reallyActive` 模式）。React 版已将两者分离：`pressed` prop 承载瞬时按压，`active` prop 为受控激活态，二者都映射到 `oo-ui-tool-active` 类。
- **按压流只派发 `onSelect`，不承担工具自身的浮层显隐**：原版 `ToolGroup.onMouseKeyUp` 调用 `pressed.onSelect()`，而 `PopupTool.onSelect` 就是 `popup.toggle()`，二者是同一个入口；React 版 `onSelect` 保留为调用方回调（原版它被占用、调用方收不到通知），浮层开合改由 `ToolView` 在工具链接上的 `onClick` / `onKeyUp` 驱动，打开态另经 `popup.onOpenChange` 通知（见 DEVIATIONS 增强节）。新增「选中即开合某物」的工具形态时按此分工接入，不要把开合塞进 `onSelect`。
- **弹层开合回调统一命名 `onOpenChange`**（Popup / PopupButton / `ToolProps.popup` / ButtonMenuSelectWidget 均此口径）：打开与关闭任一路径（选中工具 / 点外部 / 关闭按钮 / Escape）都回调，配合 `open` / `defaultOpen` 构成受控通道；组件内部的关闭请求统一经 `useControlledValue` 的 commit 发出并回调。不要再造 `onClose`（仅关闭语义）/ `onOpen` / `onToggle` 之类名字（`Message.onClose` 是「点击关闭按钮」回调、无浮层打开态，不在此列）。**例外：Dialog 家族为受控-only**——只有必填 `open`、无 `defaultOpen`，关闭意图经 `onEscape`/`onPrimaryAction` 等回调报出（见 DEVIATIONS「等效替代」的 `Dialog` 恒受控条），读三件套约定时勿把 Dialog 误判为不合规。
- **工具承载子内容的两个通道是 `ToolProps.popup` 与 `ToolProps.group`**（对齐原版 `PopupTool` / `ToolGroupTool`）：前者为浮层配置对象（工具选中即开合，锚点与 `autoCloseIgnore` 均为工具元素，对应原版 `PopupElement` 的 `$floatableContainer` / `$autoCloseIgnore`）；后者为 **React 元素**（原版经 `groupConfig` + `ToolGroupFactory` 创建 list 组）。用元素而非配置对象是为了让「工具组再嵌工具组」的递归交给组件树——若由库内渲染内嵌组，`Tool`（渲染工具）与 `ListToolGroup` / `MenuToolGroup`（渲染面板）会形成模块循环依赖。内嵌工具组工具不渲染链接、也不带 `data-tool-name`，故不参与外层组的按压流；原版对应机制是 `ToolGroupTool` 构造期 `$link.remove()`，使外层组 `findTargetTool` 只认 `.oo-ui-tool-link` 时解析不到工具（不是靠阻止冒泡）。内嵌工具组的面板虽 portal 至 body，React 合成事件仍会冒到外层组容器，当前靠 `useToolGroupPressed` 的 `canPress` 在外层 tools 里查不到内嵌工具名而安全，不要改成「按事件目标直接触发」。

**拖拽重排**

- **拖拽重排的实时预览必须走 React state，不要学原版搬 DOM 节点**：原版 `DraggableGroupElement.onDragOver` 在 dragover 时直接 `$(...).after(item.$element)` 搬动节点做预览换位，React 会因下次渲染的重排而抹掉这处手改。React 版把「预览顺序」作为 state（`previewKeys`）在 dragover 时更新、由渲染体现，drop / dragend 时才把顺序提交回 `value`。该状态机已收敛为 `widgets/TagMultiselect/useDraggableKeys.ts`（只吃「有序 key 序列 + 屏障项判定」，与标签无关，其它可拖拽组可直接复用）。
- **拖拽处理器须经 ref 读拖拽态，不能只依赖渲染期闭包**：`dragover` / `drop` 可能在同一次任务内紧随 `dragstart` 触发（React 状态尚未回流），此时处理器闭包里的 `draggingKey` 仍是旧值、整段拖拽会静默失效。`useDraggableKeys` 的拖拽态同时写入 ref 与 state（ref 供处理器同步读取、state 驱动渲染）。用合成 drag 事件做自动化验证时会必然踩到这一点。
- **原生 HTML5 DnD 的类由主题 CSS 承担，JS 只需输出类与属性**：`oo-ui-draggableElement-handle:not(-undraggable)` 给 grab 光标、`-placeholder{opacity:.2}` 给原地占位观感、`-clone` 在 wikimediaui 无规则（仅用于 Chrome 原生拖影）；不可拖时靠 `-undraggable` + `draggable=false` 撤下（原版 `toggleDraggable` 即如此）。原版把项下标写进 jQuery 内部数据（`$element.data('index')`，DOM 上不可见），React 版写成 `data-index` 属性以便 dragover 命中——行为等价，仅是取值通道不同。
- **按钮式选项要放行 mousedown**：原版 `ButtonElement.static.cancelButtonMouseDownEvents` 缺省 `true`（mousedown 时 `preventDefault` 以阻止焦点转移），`ButtonOptionWidget` 专门置为 `false` 让事件穿透给父级选择组（否则父级的按压 / 拖拽选择收不到），`ButtonWidget` 同样为 `false`。React 版中选项不自行处理 mousedown，由 `useOptionDrag` 在组根上统一接管。

### 3.3 输入类组件的通道

- **非受控用法兼容**：类输入组件不能只依赖 `value` prop 变化触发副作用（非受控时 `value` 恒 `undefined`，effect 只跑一次）。用 `input` 事件监听（键入即时）+ `value` 依赖（程序化赋值 / 受控回流）双通道。
- **props 的落点**：`SearchInput` / `TextInput` 的 props 经 `...rest` 落在**根元素**而非 `input`，键盘处理要挂在能收到冒泡的容器上，或改由组件内部承接。要把属性写到 `input` 上用 **`inputProps` 通道**（TextInput / MultilineTextInput / NumberInput / ComboBoxInput 均已提供；非事件属性冲突时以通道为准，`onChange` / `onBlur` / `onFocus` 串联在组件逻辑之后）；需要**元素引用**（聚焦、`Select.focusOwnerRef`）时才用 `inputRef`。
- **输入框失焦提交文本时先收起浮层并清高亮**（TagMultiselect）：失焦会把输入框文本提交为标签，而候选菜单可能仍持有高亮项。原版 `MenuTagMultiselectWidget.onMenuToggle(false)` 的 `highlightItem(null)` 先于失焦提交生效，故不会把鼠标悬停 / 键盘高亮项当作输入内容提交。React 版在输入框 `onBlur` 中先 `setOpen(false)` + 清高亮，再以「忽略高亮」的方式提交文本；直接复用 Enter 的提交路径（会优先取高亮项）会在浮层点击后失焦时误把高亮项加回。
- **无法经 props 表达的原生状态靠命令式写回**：`<input type=file>` 的值（`files` 是只读 `FileList`）须在 effect 里用 `DataTransfer` 造 `FileList` 赋给 `input.files`，且**赋值前先与 DOM 现有集合比较**（按 `name` / `size` / `type` / `lastModified` 四字段，`File` 字段不可枚举），否则会把用户刚在系统选择器里选中的文件清掉；`DataTransfer` 构造器在 Safari<14.1 缺失，须探测并连带关闭拖放。实现见 `SelectFileInputWidget`。
- **原生控件必须挂进某个内部元素（而非组件根）时，给基础组件加窄通道**：`SelectFileInputWidget` 的 `<input type=file>` 必须是 `.oo-ui-buttonElement-button` 的**直接子元素**（主题以 `> [type='file']` 选中它并做成铺满按钮的透明覆盖层，点击才开系统选择器），React 版为此给 `Button` 加了 `anchorContent`（渲染在图标 / 标签 / 指示器之后的原生内容，与 `widgetNames` 同属组件内部组合通道），而不是 portal 出去或命令式 `appendChild`（后者会被下次渲染抹掉）。同理，`aria-haspopup` / `aria-owns` / `aria-expanded` 这类「状态挂在触发控件上」的语义，原版都写在锚点（`$button`）上——`Button.anchorProps` 即此通道（`PopupButton` 与 `ButtonMenuSelectWidget` 共用）；**不要经 `rest` 传**（会落到根 `span`，读屏与 AT 都认不到）。
- **与 HTML 原生属性同名的 props 须先 `Omit` 再声明**：`WidgetProps` 链路继承 `HTMLAttributes`，`SearchWidget` 的 `results`（结果集）与原生 `results`（`<input type=search>` 的属性，类型 `number`）同名，直接声明会报「Interface incorrectly extends」。新增 props 前先对照原生属性表，撞名则先在 `Omit` 里剔除。

### 3.4 焦点与 a11y 落点

- **`tabIndex` 统一走 `resolveTabIndex(tabIndex, disabled)`**（`mixins.ts`）：原版 `TabIndexedElement.updateTabIndex` 是 **disabled 覆盖显式值**（`isDisabled() ? -1 : tabIndex`，注释「Do not index over disabled elements」），启用时缺省 0。两条落点规则同样来自原版：
  - `tabIndex` 必须落在与原版 `$tabIndexed` 相同的元素上（Button / ToggleButton → 锚点 `a`；InputWidget 全族含 Checkbox / Radio / ComboBox → `input`；ButtonInput → 真实 button/input；Dropdown → handle；ToggleSwitch / RadioSelect / TabSelect → 根元素；DropdownInput / RadioSelectInput 转发给内部控件），**不要落在不可聚焦的外层容器上**；
  - `aria-disabled` 也写在该元素上——ChromeVox / NVDA 不继承父元素的 `aria-disabled`，只标根会读不到。

  新增「可聚焦元素与根不同」的组件时按这两条接入；`aria-labelledby` 落点同此口径（如 Button 的 anchor、Dropdown 的 handle，见 §4.2 的 `FieldLabelLink`）。
- **a11y 布尔属性写实际布尔值**（`aria-selected` / `aria-checked` 等），不要写死 `false`。
- **原生属性不包 helper**：`aria-disabled={disabled || undefined}`、`oo-ui-element-hidden`、`input` 的 `required` / `aria-required` 在组件里直写即可（React 惯例是原生属性留在 JSX 中可读可搜）。包成 `disabledAria()` 之类只增加间接层，且不解决真正的风险点——`aria-disabled` / `tabIndex` 须落在与原版 `$tabIndexed` 相同的元素上，仍需逐组件核对。
- **「隐藏」的类未必是 `display:none`**：主题对隐藏菜单用 `width/height: 0 + overflow: hidden`（`oo-ui-menuLayout-hideMenu`），其中可聚焦元素仍在 tab 序，构成隐形焦点陷阱。此类隐藏必须卸载子树或设 `inert`，只加 `aria-hidden` 不够。判断前先查主题 CSS 的实际属性。
- **`hidden="until-found"` 不要同时标记 `aria-hidden`**：`until-found` 的语义是「对浏览器查找可见、对用户暂时不可见」，持续向辅助技术声明不可见会与「查找命中激活面板」的意图冲突。`Layout` 仅在 `hidden === true` 时输出 `aria-hidden`。

### 3.5 React 写法陷阱

- **回调用 ref 承载、而非进依赖数组**：最新值 / 回调统一经 `useLatestRef` 读取，使 effect 与 document 监听只随真正需要的开关挂卸，避免内联箭头函数每渲染重挂监听。
- **Hook 不可置于短路 / 条件表达式中**：把 Hook 调用写在 `??` / `&&` / 三元的右侧时（如按需生成的 id），左侧有值就会跳过该 Hook，同一实例切换时 React 抛「Rendered fewer hooks than expected」并卸载整树。先生成再合并。
- **组级禁用经 Context 下发，不用 `cloneElement`**：`ButtonGroup` 经 `ButtonGroupDisabledProvider` / `useButtonGroupDisabled` 下发组禁用态，组内按钮自行与 `disabled` 取或。`cloneElement` + `child.type === Button` 会静默漏掉 ToggleButton 等组合形态、包一层的 Button 与 memo 后的 Button（原实现即存在此漏失）。

### 3.6 渲染契约的靶心（快照与断言）

- **期望值的靶心是原版 DOM，不是本实现的输出**：属性值字面量、标签名、节点层级这三类最容易「先射箭后画靶」——`toMatchInlineSnapshot` 跑 `-u` 会把本实现的任意写法写成「契约」，显式断言同理。每条锁定此类细节的用例，注释里要写明原版出处（类名 + `dist` 文件名:行号），让后人有可核对的靶子。
- **原版靶的取法**：构造期 DOM（类名 / 属性 / 层级）在 `oojs-ui-{core,widgets,toolbars,windows}.js` 对应类的构造段；**层级能否被包裹**要看 `oojs-ui-<主题>.css` 的选择器形态——原版装饰 / 标签的定位规则大量是 `>` 直接子选择器（如 `.oo-ui-textInputWidget > .oo-ui-iconElement-icon`），把它塞进包裹层就是失配，而非只是「结构不同」。
- **快照只能防「自己回退」**，不能证明「与原版对齐」；新增快照时同时注明该 DOM 来自原版哪一段构造代码（或指向对照页 / DEVIATIONS 条目）。
- **实测纠正过的四处画靶**（同类问题先往这几条上对）：
  - `aria-haspopup` 原版是字面量 `'true'`（`oojs-ui-core.js:9118` DropdownWidget、`oojs-ui-widgets.js:3913` ButtonMenuSelectWidget），不用语义更精确的 `'listbox'`；三处触发元素同此口径。
  - 手抄「原版自动生成的真 ButtonWidget」时，锚点必须是 `<a>` 并抄全 `rel="nofollow"` 与 `invisibleLabel` 时的 `title` 兜底（ComboBoxInput 的下拉按钮曾抄成 `<span>`）；原版只给该按钮 `aria-controls`，**不给** `aria-haspopup`（菜单归属由输入框的 `aria-owns` 声明）。
  - 根元素标签名逐类核对：`ToggleSwitchWidget` 未覆写 `getTagName` 故为 `div`，`ToggleButtonWidget` 继承 `ButtonWidget` 故为 `span`。
  - `InputWidget` 构造期恒写 `value`（未配置为空串）：不写该属性会使 radio / checkbox 的隐式提交值变成 `on`。
- **三类不可直接用 DOM 比对定靶的差异**：
  1. `oo-ui-image-*` 变体类由原版主题 JS 的 `getElementClasses` / `updateElementClasses` 运行期写入（见 `oojs-ui-wikimediaui.js:44-86`：framed 且激活 / 禁用 / primary 则 invert，CheckboxInput 的 checkIcon 恒 invert），本工程改为静态求值（`mixins.ts`）。测试环境既无主题 CSS 也无主题 JS，**只能人工校主题 JS 的条件分支**，不能靠比对原版输出定对错。
  2. 原版自身在两主题下不一致者（如 `oo-ui-buttonElement-size-medium` 仅原版 JS 输出、两主题 CSS 均 0 条规则），本工程不输出，已记 DEVIATIONS。
  3. 同一属性可能有多个写入方、稳态与初始态不同——`aria-owns` 原版先由 `ComboBoxInputWidget` / `ButtonMenuSelectWidget` 构造期写入（`oojs-ui-core.js:12689`、`oojs-ui-widgets.js:3913`），收起时再由 `MenuSelectWidget.onToggle` `removeAttr`（`oojs-ui-core.js:8986`）；**只观察未开合过的初始帧会得出「恒在」的错误结论**，取靶要跑完一个完整开合周期再看稳态。本工程三个菜单触发组件统一按开合增删，差异仅剩初始收起帧，已记 DEVIATIONS。

## 4 共享抽象索引（改动前先查）

跨组件重复逻辑一律收敛，**不得按组件手抄**同类交互。三个锚点目录：`src/mixins.ts`（类名贡献与元素级状态解析）、`src/hooks/`（跨组件 hook）、`src/utils.ts`（纯函数工具）。

### 4.1 类名与元素级状态（`src/mixins.ts`）

每个导出对应原版一个 mixin 的「类名贡献」或「元素级状态解析」（Widget / IconElement / IndicatorElement / LabelElement / FlaggedElement / ButtonElement / OptionWidget / TitledElement / AccessKeyedElement / RequiredElement / PendingElement / TabIndexedElement），另含原版 `Element#toggle` 的隐藏类贡献器与 SelectWidget 根按压态贡献器。**新增或对齐一个元素级能力时先在这里加贡献器 / 解析器，不要在组件里手写类名拼接或属性落点判断**；契约由 `src/mixins.test.ts` 锁定，改期望值前先核对原版对应 mixin。

- **根类组装有两条路径**：
  - **Widget 型组件走 `getWidgetClassName(props, ...widgetNames)`**：`widgetNames` 即原版 `oo-ui-<Name>Widget` 系列类（内部经 `widgetNameClasses`），一个组件的根类名一次输出完毕（如 `getWidgetClassName({ disabled }, 'search')`、`…, 'input', 'textInput', 'comboBoxInput'`）。组件内不要把 `oo-ui-*Widget` 根类另写在 `clsx` 参数里。边界：名称类无 Widget 后缀的组件（BarToolGroup / LabelToolGroup 的 `oo-ui-toolGroup`、Tool 的 `oo-ui-tool` 等）不在名称位覆盖范围，根类仍手写在 `clsx`。
  - **非 Widget 的布局组件**（FieldLayout / FieldsetLayout）不走折叠层，直接调 `labelElementClasses` / `iconElementClasses`——不要手写 `hasLabel(label) && 'oo-ui-labelElement'` 之类的等价判断。根元素为原生标签（`<form>` / `<fieldset>`）的布局组件不经 `Layout` 组件，须自行补齐 `oo-ui-layout`（该类的主题规则含 `.oo-ui-horizontalLayout > .oo-ui-layout` 一类后代选择器，漏掉会失去外边距归零）。
- **`getTextInputClassName`（输入框继承线的折叠层）**：TextInput / MultilineTextInput / NumberInput / ComboBoxInput 的根类经它一次输出（widget 基类 + labelPosition 类 + type 类 + flagged 变体），形态专属状态类经 `extraStateClasses` 保序插入，**勿在各输入组件重抄这组类**。TextInput 系组件的 `flags` prop（`FlaggedElement` 类型，`Element.ts`）经 `flaggedElementClasses` 输出，软校验的 invalid 标志经 `mergeInvalidFlag` 叠加（配置 `flags` 为声明式基线，不随校验通过移除——原版 config.flags 与 setFlags 共享存储的移除语义不适用于声明式 props）。
- **`getWidgetClassName` 折叠组之外单独调用的贡献器**：`flaggedElementClasses`（需与软校验 invalid 合成）、`buttonElementClasses`（需 framed / active / pressed 入参）。`buttonElementClasses` / `imageVariantClasses` / `getButtonIconClasses` / `getOptionIconClasses` 覆盖 ButtonElement 的根类、image 变体类与图标 / 指示器着色规则（边框按钮 active / disabled / primary 反色）：Button / ButtonInput / ButtonOption 共用，新增按钮形态勿再手写类组；选项族选中 / 按压态的着色走 `getOptionIconClasses`（经 `DecoratedOption` 的 `variantClasses` 透传给 `ButtonSlots`），该函数同时消费选项的 `flags`（→ 对应 `oo-ui-image-*` 变体，只落 icon / indicator、不出根类），条件与落点见 DEVIATIONS 等效替代节。
- **`ButtonSlots`（`widgets/Button/slots.tsx`）**：图标 → 标签 → 指示器的三元排布（无图标 / 指示器时照常输出 noIcon / noIndicator 空占位），并承载 `variantClasses`——一份 `oo-ui-image-*` 变体类同时落到 icon 与 indicator（对齐原版 `Theme.updateElementClasses` 把主题类加在 `$icon` / `$indicator` 上的机制）。按钮系（Button / ButtonOption / ButtonInput、ComboBoxInput 下拉按钮）与装饰选项共用。本节开头的「同类收敛」原则同样适用于 DOM 结构与类名派生，勿在新组件里手抄三元或自行拼变体类的落点。
- **`optionWidgetClasses`**：OptionWidget 的 selected / highlighted / pressed 状态类，**门槛须按原版该类 static 值传入**（基类三者皆 true；`RadioOptionWidget` 的 highlightable 与 pressable 为 false，`TabOptionWidget` / `ButtonOptionWidget` 的 highlightable 为 false）。新增选项形态先查原版 static 再接入；`oo-ui-optionWidget` 根基类由 `widgetNameClasses('option')` 输出，本函数不重复。另注意 `MultioptionWidget`（CheckboxMultioption）是另一条继承线：根类 `oo-ui-multioptionWidget`、选中类 `oo-ui-multioptionWidget-selected`。
- **`pendingElementClasses` / `resolveRequiredIndicator`**：PendingElement 的 pending 类（pending 的来源与计数由调用方持有）与 RequiredElement 的指示器缺省（显式 indicator 恒优先，对齐原版「只在当前指示器是对应位时才改写」以免破坏无关指示器的守卫）。
- **`resolveTitle`（TitledElement）**：①未显式给 title 且标签不可见时以标签文本兜底；②有 accessKey 时在 title 末尾附 `[键]`（原版 `formatTitleWithAccessKey`；MediaWiki 经 `jquery.accessKeyLabel` 显示的修饰键文案在纯 DOM 环境不可得，按其回落分支取原键值）。**落点须与原版 `$titled` 一致**：

  | 组件族 | title 落点 |
  | --- | --- |
  | Button / ToggleButton / ButtonOption | 各自的锚点 `$button`（ButtonOption 的 `$accessKeyed` 仍是选项根元素） |
  | InputWidget 全族（TextInput / MultilineTextInput / NumberInput / ComboBoxInput / CheckboxInput / RadioInput / SelectFileInputWidget） | `input` / `textarea`（SelectFileInputWidget 以 `''` 兜底抑制浏览器默认提示，调用方 title 同落此处） |
  | OptionWidget 系（MenuOption / OutlineOption / TabOption / RadioOption） | 选项根元素 |
  | FieldLayout | 其 label 元素 |
  | ToggleSwitch（继承 ToggleWidget） | 组件根元素 |
  | 其余混入 TitledElement 的组件（Icon / Indicator / Label / Message / ButtonGroup / LabelToolGroup / PopupToolGroup / TagMultiselect） | 组件根元素 |

  **带 accessKey 或可隐藏标签的组件按此表接入，勿再写裸 `title={title}`**；两者都不涉及的组件直接用原生 title 即可。已知偏差：`DropdownWidget` 的 `$label` 未接、title 落根元素；PopupToolGroup 按窄栏生效值兜底；ButtonInput 落真实 button/input 并接入兜底（原版经 `InputWidget` 混入 TitledElement、`$titled` 即 `$input`，本工程为对齐而非增强）；FieldsetLayout 原版不混 TitledElement，title 经 rest 原生落在 `<fieldset>` 上——均见 DEVIATIONS。
- **`mergeAriaLabelledBy`**：合并 FieldLayout 联动下发的 labelId 与调用方透传的 `aria-labelledby`（空格分隔），全空时返回 `undefined`。所有 `aria-labelledby` 落点都经它合并，不要各组件自己 join。
- **`labelElementLabelClasses`**：`$label` 元素自身的类（`oo-ui-labelElement-label` + invisible），Label / LabelBase / FieldLayout 共用。
- **`resolveTabIndex` / `toFlagArray`**：可聚焦元素的 tabIndex 取值（落点规则见 §3.4）与标志参数归一化。
- **主题 CSS 契约守卫 `src/theme-contract.node.test.ts`（node 组）**：本库不自带样式，`oo-ui-*` 类名即与原版主题 CSS 选择器的契约。该测试从已装的 `oojs-ui/dist/oojs-ui-{wikimediaui,apex}.css` 抽类 token，核对贡献器产出的类仍存在于契约（两主题并集，白名单除外），把上游改名从「静默失效」变为测试断言。范围、白名单与固有盲区见该文件顶部 jsdoc——**新增贡献器分支产出主题无规则的类时测试会失败**，处置方式（修正贡献器 / 记入 `ALLOWLIST` 并写明理由）也在那里。

### 4.2 共享 hooks

`src/hooks/` 按能力域拆分，barrel `src/hooks/index.ts` 保持 `../hooks` 引用路径不变（能力域：refs / field / value / dismiss / press / input / menu / select / prefixSearch / anchored / portal）。输入族专属的共享 hook 在 `widgets/Input/` 下（消费者是同一继承线的输入形态，不是任意组件）。

- **位置按消费者数定**：`src/hooks/` 只收 ≥2 个组件共用的 hook；单消费者的 hook 与组件同目录（见 §4.4）。把单消费者逻辑放进本层会谎报共享关系并持续撑大该文件；待出现第二个消费者时再提升。
- **`useControlledValue` / `useControlledValueNotify`（value）**：受控 / 非受控值状态；后者在受控值非法（不在可用值集合内）时把生效值回写父级，同一非法值仅回写一次（父级未采纳时不反复触发），`useLayoutSelection` 的受控回写共用同一守卫。返回的 `commit` 与 `commitIfChanged` 分工明确：**选择集类组件的选中提交一律用后者**（对齐原版 `selectItem` 对已选中项的提前返回，Select / TabSelect / ButtonSelect / Dropdown / ComboBoxInput 皆此），输入类组件必须用前者（「始终转发」是刻意语义）。
- **`useLayoutSelection`（value）**：布局激活项的统一「派生 + 失效补选」，派生走同一文件的纯函数 `resolveLayoutSelection`（有效值原样、缺失 / 失效按邻近回退：原位置 → 前一项 → 首项；`prevOptions` 须传上一轮 options）。`selectIfChanged` 与**生效值**比较（对齐原版 `BookletLayout.setPage` 与当前页比较的提前返回），受控值非法时点击回退项不重复派发。两者保持**一元签名**（不转发事件）——`ChangeHandler` 约定第二参数为 change 事件，而 `StackLayout.onPageFocus` 传来的是 FocusEvent，不进参数是从源头规避串味。
- **`useLatestRef` / `useMergedRefs` / `useCleanId`（refs）**：渲染期同步最新值的 ref（供事件监听 / 定时器读取最新 props 而不重挂监听，`useControlledValue.commit`、`useDismissablePopover`、`useValidityFlag` 等内部回调均经它稳定化）；同时持有元素引用并向外转发 ref（替代 `useImperativeHandle` 手工桥接）；生成不含 `:` 的 id 片段（`useId` 的 `:` 在 CSS 选择器中非法）。
- **`useDismissablePopover`（dismiss）**：浮层的外点 / Escape 关闭，规则见 §3.2。`ignore` 为忽略目标白名单（ref 或真实元素数组），浮层自身根节点须列入（Popup 传入 portal 根 `rootRef` 与 `autoCloseIgnore`）。
- **`usePressedState`（press）**：鼠标 / 键盘按压态的进入与复位（document 级 capture `mouseup` / `keyup` 兜底），Button / ButtonInput / Tool 组共用。组内委托场景经 `resolveTarget` 从事件 target 解析目标、`canPress` 过滤、`onTrigger` 在释放落在发起目标上时回调（Tool 组的 `onSelect` 位）。四个透传回调参数的转发时机（**先于**按压逻辑无条件转发）见 `hooks/press.ts` 的 jsdoc——按压逻辑含 disabled / 非左键的提前返回，顺序颠倒会导致这些分支下调用方收不到事件。
- **`useOptionRegistry` / `useOptionDrag`（press）**：Select 系的选项 DOM 双向索引与拖拽选择。`useOptionRegistry` 须传入当前渲染的选项值列表——值移除时其 ref 回调缓存随之淘汰，避免长期运行下缓存累积。
- **`useMenuPopup`（menu）**：菜单触发类组件（Dropdown / ButtonMenuSelectWidget / ComboBoxInput / TagMultiselect）共用的菜单开合与键盘高亮，组件内不要再手写按键分支；契约对齐原版 `MenuSelectWidget`，完整说明见 `hooks/menu.ts` 的 jsdoc。组件侧须注意：
  - **导航起点 `navigationValue` = 高亮项（须在可选集内），无高亮时是否回退选中项由调用方按形态定**：原版 `SelectWidget.onDocumentKeyDown` 的 `currentItem = (isVisible() && highlighted) || (!multiselect && selected)` 对单选回退选中项、多选不回退（`MenuSelectWidget.onDocumentKeyDown` 自身的 `findHighlightedItem() || findFirstSelectedItem()` 只服务 TAB / ESCAPE 分支，对多选均为无操作），故 Dropdown / ComboBoxInput / ButtonMenuSelectWidget 传 `selectedValue`，TagMultiselect 的多选菜单不传。Enter 与翻页都从它出发，组件的 Enter 分支直接选定 `navigationValue`；TagMultiselect（菜单模式）的 Enter 是切换 / 提交双路径——菜单开启且 `navigationValue` 已是标签时移除该标签（原版 ENTER 经 `chooseItem` 的多选切换：已选定 → unselect → `onMenuChoose` 移除），否则按原版 `getTagInfoFromInput` 语义提交高亮项 / 输入文本。
  - **菜单键位一律转调 `consumeNavigationKey(event)`**（命中即 `preventDefault`）：↑↓←→±1、Home / End 首末、PageUp / PageDown±10，端点**钳制不环绕**（原版 `static.listWrapsAround=false`）。←→ / Home / End 只在**无输入框**的形态消费——有 `$input` 时原版让位给光标，故 ComboBoxInput / TagMultiselect 的调用方要自行把这几个键留给输入框（hook 不区分，规则在调用侧）。
  - **Tab 特例**（原版 TAB 分支）：存在未选中的导航项时提交它并阻止移出焦点（经 `onChoose`，多选菜单另传 `isSelectedValue` 做集合判定），否则仅收起并放行 Tab；**两条路径都收起菜单**（hook 在提交路径统一 `onClose`，不依赖 `onChoose` 收起——TagMultiselect 的 `onChoose` 是切换语义）。
  - **`screenReaderMode` 只有 Dropdown 传**：收起态也接管键盘并直接改选，对齐原版 `DropdownWidget.onFocus` / `onBlur` 切换的 `menu.screenReaderMode`（document 监听提前到聚焦期，`SelectWidget` 的 `isVisible()` 为假分支遂走 `chooseItem`）。由调用方以「触发元素聚焦中」布尔量驱动；BMSW 原版与本工程都不开启该模式（其收起态方向键不接管、不展开，交回默认行为，仅 Enter / Space 展开），有输入框的组件按键归输入路径。**启用侧的组件不要再自行在收起态分方向键分支**（Dropdown 收起时按 Enter / Space 才展开，方向键不展开）。
  - **前缀跳转（type-to-search）经 `getItemText` 启用**，对应原版无 `$input` 时绑定的 document `keypress`（窗口为菜单展开期，`screenReaderMode` 期同样绑定并在收起态命中即选定，起点对齐原版，导航键命中即清缓冲）。取文本用共用实现 `createMenuOptionTextLookup(options, menuRef)`（读菜单面板 DOM 文本，对齐原版读 textContent 的口径；依赖「Select 根 children 与 options 按下标一一对应」的 DOM 不变量），不要各自手写；带输入框的组件不传即不启用。算法与 `Select` 的 keydown 通道共用 `advancePrefixSearch`。
  - **高亮的清理时机随原版**：仅 Escape（原版 ESCAPE 分支 `setHighlighted(false)`）清除，其他收起通道保留（原版 `toggle(false)` 只置 `lastHighlightedItem=null`），否则下次展开的导航起点会与原版不一致。
- **`useGroupKeyboardSelection`（menu）**：直选型选项组（TabSelect / RadioSelect / ButtonSelect）的键盘改选，`selectableValues` 由调用方按展示顺序给出。选中提交带「值未变化不提交」守卫（对齐原版 `selectItem` 对已选中项的提前返回，`Select` 的 Enter 与拖拽提交同理）。它内部不调用 React Hook（返回读取入参的纯闭包），故可在 node 环境直接构造伪事件做契约测试。
- **`useSelectableValues` / `useOptionElementIds`（select）**：选择族（Select 引擎族 / 直选族 / 菜单族）共用的两个原语。前者统一 `getSelectableValues` 的 memo 派生并附 Set 命中判定 `has`（拖拽逐帧 / 键盘高频路径 O(1)）；后者统一「显式 id 优先、缺省按下标（`useCleanId` 去 `:`）」的选项元素 id 口径（原版为 `ooui-` 前缀全局计数，机制不同、契约等价）。选择族组件一律经这两个原语取值，不再各自 `useMemo` 手抄派生。
- **`useDirectSelect`（select）**：直选型选择组（ButtonSelect / TabSelect）的共用容器脚手架，收敛两者逐字重复的部分——受控值态（`useControlledValue` + `commitIfChanged`）、可选值序列派生、选项 DOM 双向索引、拖拽选择、直选键盘改选、选项 id 生成与按压态类。各组件保留 root ref 策略（Button 走 `useFieldLabelFocus`、Tab 走 `useMergedRefs` 供滚动读取，经 `focusRoot` 回调下给 hook）、根 role / aria 模型、Option 组件绑定与各自独有交互（Tab 选中滚动可见 / 移动端居中、Button 的 `aria-activedescendant`）。指针按下时 hook 会调用 `focusRoot` 把焦点收进组根（原版 mousedown preventDefault 后焦点不动、键盘失效，此处对齐 ARIA APG 的改良，见 DEVIATIONS「增强」）。`RadioSelect` 差异更大（原生 radio input + `FieldLabelLinkProvider` + 聚焦自动选首项），**不并入本 hook**；`Select` 引擎族因键盘范式不同（高亮导航 vs 直选）也不合并——两族共享 `useSelectableValues` / `useOptionElementIds` / `selectWidgetStateClasses` 与 `findRelativeSelectableItem` / registry / drag 底层原语，容器脚手架不合并。
- **`usePrefixSearchBuffer`（prefixSearch）**：按键前缀跳转的字符缓冲与 1500ms 超时计时，`Select` 的 keydown 通道与 `useMenuPopup` 的 document keypress 通道共用；匹配算法是纯函数 `advancePrefixSearch`（§4.3）。新增前缀跳转入口只接这套 hook + 函数，不要另写缓冲 + 定时器 + 匹配分支。
- **`useFloatPortal`（portal）**：浮层 portal 容器的解析与层值。三个消费点即全部 portal 化的浮层（`Popup` / `MenuSelect` / `PopupToolGroupBase`），新增浮层形态必须接它、不要各自读 `getPortalContainer`：容器按「宿主 `OOUIProvider.getPortalContainer` → 弹窗子树内该弹窗的 WindowManager 根（`WindowManager` 经 `PortalHostProvider` 下发自身根元素）→ `document.body`」回落；弹窗子树内另给出 `DIALOG_FLOAT_Z_INDEX`（与主题给 `.oo-ui-windowManager-modal > .oo-ui-dialog` 的层值相等，由 `theme-contract.node.test.ts` 守卫），须写到浮层的**定位元素**上——原版浮层位于窗口的层叠上下文内、层值只在窗口内比较，本工程浮层是弹窗的兄弟节点，不写就会被主题层值（`.oo-ui-popupWidget` 为 1）压到弹窗之下。这套回落也是弹窗内容隔离（`dialogs/isolation.ts`）不需要 portal 根豁免名单的前提：浮层是管理器根的子节点而非兄弟，逐个标记兄弟碰不到它。改动这两处前先读 `hooks/portal.ts` 的文件头说明与 DEVIATIONS「等效替代」的两条内容隔离条目。
- **`useInputProps` / `useNativeInputProps`（`widgets/Input/props.ts`）**：
  - `useInputProps` 派生输入元素在该继承线上的公共属性（七项：字段 id、`resolveTabIndex`、`aria-disabled` / `aria-invalid`、标签让位的内边距、required 指示器缺省回退、图标与指示器的 mousedown 聚焦、软校验），TextInput / MultilineTextInput / NumberInput / ComboBoxInput 共用。形态差异经返回的 `inputProps(overrides, userProps)` 工厂传入：`overrides` 是形态专属属性（type / rows / min / max / step、combobox 角色、按键处理器），`userProps` 即调用方的 `inputProps` 通道——className / style / id 合并，`onChange` / `onBlur` / `onFocus` **串联在组件内部逻辑之后**（值管线与软校验不会被调用方截断），其余非事件属性以 `userProps` 覆盖（声明过的逃生舱）。**新增输入形态接入时必须一并传 `rootRef`**（组件根元素的内部 ref，与转发 ref 经 `useMergedRefs` 合并）：标签让位与「滚动条宽度并入 after 同侧」的落侧统一由**组件根元素**的样式表方向解析（对齐原版 `positionLabel` 读 `$element`），不要改读输入元素自身的 `dir`——它按原版只落在输入元素上、仅影响文本方向，而标签由主题 CSS 以物理 left/right 定位。
  - 值解析一律挂 `onCommitValue`，不要占 `overrides.onChange`。同名事件处理器由该工厂统一串联（组件内部逻辑在前、调用方通道在后），故组件的交互处理器（按键导航、点击展开、步进等）经 `overrides` 下发即可，调用方无法经 `inputProps` 截断交互管线；新增形态自身的交互动作直接写在 `overrides` 的处理器里（它即链条首段）。
  - `useNativeInputProps`：**原生 input 的落点属性组**（`id` / `name` / `title` / `accessKey` / `tabIndex` / `dir`，含 `useFieldInputId` 的字段 id 认领、`resolveTitle` 的 invisibleLabel 兜底与 accessKey 键位后缀、`resolveTabIndex` 的禁用优先）加 `disabled` / `aria-disabled` / `oo-ui-inputWidget-input` 类。不走值管线的原生 input 组件（CheckboxInput / RadioInput）直接接它，自己写 `type` / `checked` / `onChange`；`useInputProps` 内部亦复用它，故两条通道的落点口径恒一致。
- **`useAutosize` / `useScrollbarOffset`（`widgets/Input/autosize.ts`）**：多行输入框的自动高度（经克隆 textarea 测量，高度**经 state 回到渲染流程**而非命令式写 DOM）与出现垂直滚动条时指示器 / 后置标签的让位。前者的结果经 `useInputProps` 的 `inputStyle` 并入输入框 style，后者返回滚动条宽度与指示器 / 标签各自的偏移样式；滚动条宽度同时计入输入框标签同侧内边距（对齐原版 `positionLabel` 的 `labelWidth + (after ? scrollWidth : 0)`）。测量时机、克隆节点须同步的样式清单见该文件 jsdoc；与原版的差异见 DEVIATIONS 增强节。
- **`useValidityFlag`（input）**：输入类组件的软校验反馈（输入元素 `aria-invalid` + 根元素 invalid 标志类，不改写值）。触发时机对齐原版 `setValidityFlag`：值变更防抖 250ms、失焦立即校验、聚焦清除；初始值不主动校验（NumberInput 的挂载期校验由组件传 `validateOnMount` 补齐，对齐原版 setRange / setStep 的构造期校验）。
- **`useLabelPadding`（input）**：按标签 `offsetWidth` + 2px 间距给输入框预留内边距，落侧由**根元素**方向决定（`before` 落行首、`after` 落行尾，RTL 与 LTR 相反）。取值口径与原版的差异（取整 + 固定 2px，实测差 1–3px）见 DEVIATIONS 等效替代节。
- **`useAnchoredPanelLayout` / `resolvePanelAlignSide` / `useAutoFocusPanel`（anchored）**：锚定浮层的定位与视口钳高（MenuSelect / PopupToolGroup），留白与方向经全局配置解析，可视区边界经 `getVisibleBounds` 解析；方向按锚点元素缓存，避免滚动重算触发样式重算。`offset` 承担原版 `FloatableElement` config.spacing（Dropdown 为 0、ButtonMenuSelectWidget 为 4）并计入可用空间（贴边时钳高相应减少）。`horizontalFit` / `preferredSide` 供 PopupToolGroup 在面板宽度放不下时按左右空间选对齐侧（降级顺序见 `resolvePanelAlignSide`：首选侧→对侧→居中→铺满容器；两侧可用宽由 `resolvePanelSideSpaces` 按容器边界收口。开关缺省关闭——贴合锚点宽度的菜单类浮层无需选侧）。`useAutoFocusPanel` 切换激活面板后聚焦其内首个可聚焦元素（IndexLayout / BookletLayout）。
- **FieldLayout 标签联动双通道（field）**：对齐原版按 `getInputId()` 分流的两条路径。
  - **通道 A（输入类组件）**：`useFieldInputId` 认领字段 id 与 label 的 `htmlFor` 原生关联。
  - **通道 B（无原生 input 的组件）**：经 `useFieldGroupLabelLink` 注册标签点击激活回调（原版 `simulateLabelClick`），并经 labelId 挂 `aria-labelledby`（原版 `setLabelledBy`）。aria 落点须与原版 `$tabIndexed` 同元素（见 §3.4）。通道 B 的推荐入口是 `useFieldLabelFocus`：内部持有根元素 ref 并与外部转发的 ref 合并，点击标签时聚焦根元素，禁用时不聚焦（对齐原版 `simulateLabelClick` 默认实现）。落点不是根元素或需附带副作用的组件传 `activate` 覆盖：Dropdown 聚焦 handle、ToggleButton 经内部锚点聚焦、ToggleSwitch 额外翻转值、CheckboxMultiselect 聚焦首个可用选项。返回值另含内部 `rootRef`，供组件自身读取（如 Dropdown 把它作为浮层忽略目标）。
  - **选项组容器**（RadioSelect / CheckboxMultiselect）经 `useFieldGroupLabelLink` 屏蔽通道 A 后再向选项下发——组内多个 input 认领同一字段 id 会产生重复 id 且 label 误切首个选项（原版组容器 `getInputId()` 为 null，只走通道 B）。
  - 新增字段组件按形态二选一接入，**勿在 FieldLayout 里反射子组件**。

### 4.3 纯函数工具（`src/utils.ts`）

- **`findRelativeSelectableItem`**：相对定位可选值的纯函数，Select / TabSelect / RadioSelect 与菜单导航共用；`offset` 为相对步数（±1 步进、±10 翻页），`filter` 供前缀跳转，`wrap=false` 时越界**停在端点**（原版「跑完列表返回沿途最后有效项」的钳制，菜单导航与翻页用）、缺省环绕（直选型选项组用）。改端点 / 环绕 / 无选中起步等边界规则只改这一处。边界说明：先移动再过滤的双段实现下，`filter` 与 `wrap=false` 组合的「沿途最后有效项」不含移动途中项（原版单循环包含），当前无此组合的消费点，新增消费点时须先对齐该语义。
- **`advancePrefixSearch`**：按键前缀跳转的匹配算法，`Select` 的 keydown 通道与 `useMenuPopup` 的 document keypress 通道共用；缓冲状态与超时由 `usePrefixSearchBuffer` 管理（§4.2）。规则按原版：逐字符累积、命中首个以缓冲开头者、连打同一字符在同类项内循环、当前项不匹配时向后找、无匹配返回 `undefined` 且不清缓冲。
- **选项集工具**：`getSelectableValues`（可选值序列，内部判定为 `isSelectableOption`）、`resolveSelectableValue`（非法受控值回退首个可选值）、`resolveOptionDisabled`（选项未声明 disabled 时继承组级 disabled）。需要可选值序列的选择族组件一律经 `useSelectableValues` 取值（见 §4.2），不要再写一遍 `filter(…).map(…)`、自建 `Set` 或 `=== void 0 ?` 继承表达式（CheckboxMultiselect 等不派生可选值序列的组件只用 `resolveOptionDisabled`）。
- **DOM 与浮层工具**：
  - `getFocusableElements` / `getFirstFocusable`：可聚焦元素判定（共用内部选择器常量 + 运行期「可见 + 未禁用」兜底：优先 `checkVisibility({ visibilityProperty: true })`，旧浏览器回退 rects 非空 + 祖先 visibility 遍历），全库统一口径。Dialog 焦点陷阱、Popup 的 Tab 边界与布局自动聚焦共用，改判定只改这一处。
  - `ElementOrRef` / `resolveElement`：浮层锚点与「忽略目标」的入参形态（ref 或真实元素）及统一解析。
  - `OFFSCREEN_POSITION` / `VIEWPORT_SPACING`：浮层未定位时的哨兵坐标与视口留白缺省值（后者缺省 0，对齐原版 `OO.ui.getViewportSpacing`；站点可经 `viewportSpacing` 配置收紧），MenuSelect / Popup / PopupToolGroup 共用，勿再写 `-9999` / 留白数值字面量。
  - `getVisibleBounds`：滚动容器 / 视口的可视区边界（viewport-relative；元素容器扣滚动条沟槽、视口含沟槽口径，对齐原版 `getDimensions.scrollbar`），`useAnchoredPanelLayout` 与 Popup 的裁剪 / 钳高 / 滚出判定共用，勿再各写视口分支与沟槽扣除。
  - `getElementDir`：元素有效文本方向（读 computed direction），浮层方向解析与 TagItem / TagMultiselect 的 RTL 判定共用。
  - `withTemporaryClasses`：临时增删类后可靠恢复（MessageDialog 测量、Toolbar 窄栏自然宽度测量用）。
- **`sanitizeUrl`**：URL 协议白名单净化（对齐原版 `OO.ui.isSafeUrl` 的白名单与 `./` 前缀处理），供调用方处理不可信来源的 `href`/`action`；组件层不自动改写 URL，见 DEVIATIONS「舍弃」的 isSafeUrl 条。
- **`ChangeHandler`**：`(value, event?) => void` 的值回调契约（第二参数仅输入类组件提供）。
- **通用工具取自 `es-toolkit`**：`clamp`（数值钳制）、`omit`（剥离仅供父级布局使用的选项元数据，避免落成 DOM 未知属性）、`debounce` 等不要手写。

### 4.4 域内共享模块与单消费者实现

- **`toolbars/Tool/index.tsx`**：工具栏域的共享模块（对齐原版 `OO.ui.Tool`），承载 `ToolView` / 工具浮层的渲染与 `ToolProps` / `ToolPopupProps` 契约、`getToolNameClassName`、`isGroupAutoDisabled`（全部工具禁用时组自动禁用，空组同样判禁用）、`useToolGroupPressed` 与 `getToolHoverHandlers`（工具组按压流：四个 hover / focus 事件委托在组容器上，**只清除按压视觉**、按压流本身继续，见 §3.2）。新增工具形态走这些通道，不要在工具组里再写一遍按压流。
- **窄栏（narrow）配置分两层**：`Tool.narrowConfig`（`displayBothIconAndLabel` / `label` / `icon`）与 `PopupToolGroup.narrowConfig`（`invisibleLabel` / `label` / `icon`），以各自**已定义**字段替换宽栏值。原版 `Tool.narrowConfig.title` 换的是工具可见文本，本工程可见文本已收为 `Tool.label`（`title` 恒为 tooltip），故对应字段为 `label`。原版经 `onToolbarResize` 在进入窄栏时替换、退出时用宽栏快照还原；React 版按 `ToolbarNarrowContext` 声明式重算即可，无需快照回滚。另有「浮层内的窄栏祖先」问题：浮层 portal 至 body 会丢失工具栏的 `oo-ui-toolbar-narrow` 祖先，须自备载体（工具组面板用载体 div、弹出工具浮层把该类落在浮层根），承载位置见 DEVIATIONS 等效替代节。
- **`toolbars/Toolbar/context.ts`**：`ToolbarPositionProvider` / `ToolbarNarrowProvider` + `useToolbarPosition` / `useToolbarNarrow`，工具栏位置与窄栏态向工具组及 portal 面板的下发通道（对齐原版工具组经 `this.toolbar` 读宿主状态）。
- **`widgets/ButtonGroup/context.ts`**：`ButtonGroupDisabledProvider` / `useButtonGroupDisabled`，组级禁用下发通道（替代对 children 的 cloneElement 注入，见 §3.5）。
- **context 定义独立成文件**：`toolbars/Toolbar/context.ts` 与 `widgets/ButtonGroup/context.ts` 都把 context 单独成文件，以断开「提供方组件 ↔ 消费方组件」的模块环。勿在组件模块内定义又要跨组件消费的 context。
- **`widgets/Popup/popupLayout.ts`**：Popup 定位的纯函数模块（翻转判定 / 方位与对齐 → 页面坐标 / 箭头腾挪 / 容器边界钳制 / 就近滚动容器探测），可独立单测；浮层定位逻辑的改动优先改这里，不要在组件内联计算。裁剪与滚出判定的可视区边界不走本模块，统一用 `getVisibleBounds`。
- **`widgets/TagMultiselect/`**：`useInlineInputWidth`（inline 输入框宽度自适应，硬编码该组件的 content / group / input DOM 契约，故与组件同目录）、`useDraggableKeys`（拖拽预览顺序状态机，只吃「有序 key 序列 + 屏障项判定」，与标签无关，其它可拖拽组可直接复用）、`useTagMenu`（该组件的菜单组合）。
- **`dialogs/scrollLock.ts`**：弹窗滚动锁与 iOS 触摸滚动兜底的模块级登记表（本工程每个 Dialog 自带 manager，没有原版 `WindowManager` 的全局事件栈），按打开周期登记，消费 `{ full, ready }`；类名表 `SCROLL_LOCK_CLASSES` 由 `theme-contract.node.test.ts` 核对。详见 DEVIATIONS 等效替代节。
- **`dialogs/isolation.ts`**：弹窗内容隔离的模块级登记表，与 `scrollLock.ts` 同形（登记、按当前全表重算），两者都由 `Dialog` 按打开周期消费。要点：只保留最后登记（最上层）弹窗到 body 的路径可见；`aria-hidden` 与 `inert` 各自独立判定；撤销 `aria-hidden` 时还原被覆盖的原值（该属性由 React 渲染）。与原版 `WindowManager.toggleIsolation` 的机制差异（无 portal 根豁免名单、按登记表整体重算而非一次性快照）见 DEVIATIONS 等效替代节。

### 4.5 可见文本键与选项类型命名（跨组件契约）

- **叶子数据项的可见文本用 `label`**：声明式数组项（`IndexLayoutTabProps` / `BookletLayoutOptionProps` / `ProcessDialogActionProps` / `ToolProps` / `TagOptionProps`）的可见文本一律走 `label`，不用 `title`。`title` 恒为 tooltip（对齐 `TitledElement`）——`Tool` 曾让 `title` 兼作可见文本，已拆分。**例外（自洽保留）**：Select 族选项（`OptionData` 及各 `*OptionProps`）用 `children` 承载文本，取「选项即其内容」的语义；`Index`/`Booklet` 的项因即面板/页配置本体，其 `children` 是面板正文、`label` 才是页签文本，两轴并存不可混。
- **浮层主体在 `children` 被占用时统一用 `popupContent`**：`PopupButton` / `FieldsetLayout` / `Tool`（`ToolPopupProps`）同款。独立 `Popup` 的主体仍走 `children`（未被占用）。
- **可见文本字段收 `ReactNode`**：库内取向是标签接受非字符串节点（见 DEVIATIONS 增强节），`TagOptionProps.label` 亦然。需要纯文本的场合（`TagMultiselect` 菜单前缀过滤键、选中/编辑标签时回填输入框）经并行的 `labelText?: string` 承载——对齐原版 `getMatchText` 的「`label` 是字符串就用它、富内容取渲染文本」，React 无法从未挂载的 `ReactNode` 取纯文本，故富内容形态须显式给 `labelText`（缺省回退 `String(value)`）。显示轴/纯文本轴的解析见 {@link tagDisplayLabel} / {@link tagMatchText}。
- **选项数组项类型按「组件名 + `OptionProps`」对外导出**：正式名可以是中间件的 props（如 `RadioOptionProps`），但对外须提供组件命名的别名（`RadioSelectOptionProps` 等），使消费者能按名标注 `options`。别名在各组件 `index.tsx` 内 `export type X = 中间件Props` 后随组件一并从 `src/index.ts` 导出。

## 5 全局能力映射（OOUIProvider ↔ OO.ui 全局命名空间）

原版 OOUI 的可覆写模块级全局（`OO.ui.msg`、`OO.ui.isMobile`、`OO.ui.getViewportSpacing`、`OO.ui.getTeleportTarget` 等）在 React 语境下统一收敛到 `src/config.tsx` 的 `OOUIProvider`（context）。新增全局能力时**扩展 `OOUIConfig` 并配套 use hook**，不要再造模块级可变全局：

| 原版全局 | 本工程对应 | 说明 |
| --- | --- | --- |
| `OO.ui.msg.messages` / `OO.ui.msg` | `messages` 配置 + `useMessage`；`msg` / `registerMessages` 供命令式 API | 命令式 API 由 `OOUIProvider` 的 in-tree 宿主渲染，自动继承 Provider 的 `messages`（见 §5.1）；无 Provider 场景走模块级覆盖表（`registerMessages`） |
| `OO.ui.getTeleportTarget` / `$overlay` | `getPortalContainer` 配置 + `useFloatPortal` | 浮层 portal 容器（宿主配置 → 弹窗子树管理器根 → body 三级回落，见 §4.2） |
| `OO.ui.isMobile()`（恒 `false` 的桩） | `isMobile` 配置 + `useIsMobile()` | 消费点 6 处：TabSelect 选中项居中滚动、IndexLayout 与 BookletLayout 各自的 autoFocus 抑制、ProcessDialog 的 `oo-ui-isMobile` 类、ProcessDialog.fitLabel 不居中、DropdownInput 的 `oo-ui-isMobile` 类。完整清单见 DEVIATIONS 增强节 |
| `OO.ui.getViewportSpacing()`（缺省 0） | `viewportSpacing` 配置 + `useViewportSpacing()` | 缺省各边 0（与原版一致）；站点可显式配置以避开固定头栏一类悬浮元素 |
| `Element` 的 `dir` 配置 | `dir` 配置 + `useDir()`；组件自身的 `dir` prop 优先于该配置 | 浮层 portal 至 body 后不继承内容区方向，按锚点元素 computed direction 解析（对齐 `Element.static.getDir`），可被 `dir` 配置覆盖；`dir` prop 为组件级覆盖（对齐原版 Element `config.dir`，Popup 自身解析；菜单/工具栏面板由控件根继承后经锚点读取）；Popup 的 before/after 与 align 为逻辑方位，RTL 下物理侧翻转（对齐原版 FloatableElement 按 direction 取 start/end） |
| `jquery.accessKeyLabel` 的 `getAccessKeyLabel`（MediaWiki 侧的组合键文案） | `getAccessKeyLabel` 配置 + `useAccessKeyLabel()` | title 的键位后缀由宿主解析（`resolveTitle` 的 `accessKeyLabel` 入参）；未配置或解析返回 `undefined` 时回落原键值（`title [k]`，后者为有意取舍），返回空串时不加后缀（对齐原版 falsy 分支） |
| `OO.ui.deferMsg` / `OO.ui.resolveMsg` | `deferMsg` / `resolveMsg`（`i18n.ts`） | 值为函数的消息在调用时才取值 |

不映射的宿主环境全局（`bind` / `infuse` / `warnDeprecation` / `getUserLanguages` / `isSafeUrl` / `EventSequencer` 等）见 DEVIATIONS 舍弃节。

### 5.1 命令式弹窗的渲染环境

命令式弹窗（`confirm` / `alert` / `prompt`）是独立函数，从任意位置 import 调用即可。它们经模块级队列（`src/dialogs/imperative.tsx` 的 `enqueueDialog`）交给 `OOUIProvider` 在自己配置子树内渲染的宿主 `ImperativeDialogHost`。**宿主挂在应用 React 树之内**，弹窗节点因此自动继承宿主的全部配置与 context（文案 / `isMobile` / `dir`，以及应用自有的状态管理、路由、i18n 等 Provider，只要 `OOUIProvider` 挂在它们之下）——无需任何手动注入。这与「静态方法挂在树外、再手动把 Provider 注入回来」的老路子（如 antd 静态 `Modal.confirm` + `holderRender`）相反，走的是 react-hot-toast / antd `App` 那类「holder 挂树内、context 自然流入」的路线。

- **每个 `OOUIProvider` 都渲染一个宿主**并登记到队列注册表（`registerHost`，在 layout 阶段登记——同一提交内 layout effect 全部先于 passive effect，故同提交挂载的组件在 `useEffect` 里调用命令式 API 时宿主已登记）。选主机取**最外层**（最小深度，同深取先登记者，见 `primaryToken`）：命令式调用无位置信息，以应用根部的配置渲染最可预期。非主机的宿主渲染空。
- 弹窗子树内浮层的 portal、内容隔离、层叠均照常——弹窗 DOM 仍由各自的 `WindowManager` portal 至 `document.body`，与宿主在 React 树里的挂载位置无关。
- **未包 `OOUIProvider` 时**队列懒挂一个 body 兜底宿主（`ensureFallbackHost`，深度哨兵 `FALLBACK_DEPTH`，恒被任一真实 Provider 的宿主压过），按各配置项缺省值渲染（英文文案等）；队列清空后卸载兜底宿主。此无 Provider 场景下文案经模块级 `registerMessages` 覆盖。
- 想让某处的弹窗用与最外层不同的配置：改用声明式的 `MessageDialog` 自行控制（命令式 API 恒走最外层，不提供逐点覆盖）。

弹窗恒 portal 至 `document.body`：`WindowManager` 的 portal 目标不经 `getPortalContainer` 解析——弹窗是浮层容器的**提供方**而非消费方，让弹窗去读该配置会形成自指（宿主把弹窗容器指回弹窗）。但弹窗**内部**的浮层反过来消费同一个管理器根作为 portal 宿主（`PortalHostProvider` 下发 `WindowManager` 的根元素），故它们落在弹窗的同一 DOM 子树内——这是内容隔离与层叠正确的前提，详见 §4.2 的 `useFloatPortal` 条与 DEVIATIONS 的「弹窗内容隔离」条。

## 6 浏览器自动化验证

工具选择：优先用当前工具链里能直接驱动浏览器的方式（IDE 内置的浏览器工具最省事）；没有则检查 `agent-browser`、`playwright` 是否可用；都没有时不要凭源码臆测交互结果，直接告知用户需要可用的浏览器工具。

无论用哪套工具，验证时按以下策略：

- 对照页必须**等原版脚本注入完成**后再断言：读 `useOriginalWidgets` 返回的 `status`（值变为「原版已就绪」）或等页面上出现 `AriaProbe` 的读数，不要只等固定时长。
- 行为断言以 **DOM 类名与 aria 属性**为准（`aria-selected` / `aria-activedescendant` / `oo-ui-widget-disabled` 等），与原版侧逐项比对，而非只看渲染结果。
- **浮层选择器必须分侧限定**：React 侧浮层 portal 到 `body`，原版侧挂在控件自身子树内；全局查询会先命中**另一侧已隐藏但仍留在 DOM 里**的浮层（隐藏是加 `oo-ui-element-hidden` 类而非移除节点），导致点错元素或「被其它元素遮挡」的误报。按 `aria-owns` 定位（`findOwnedMenu`）比按「浮层在哪一侧」筛选更精确。
- **逐步断言**：先读基线，再单步交互，再读增量。聚焦类操作本身可能顺带触发一次选中（语义随工具 / 浏览器而异），把多步操作塞进一次断言会让事件计数对不上。
- 视觉一致性用截图肉眼核对；出现疑似配色差异时用计算样式（`getComputedStyle`）复核，避免被截图缩放与抗锯齿误导。
- 验收结束后关闭浏览器会话，并复原环境（停掉自己启动的 dev server、清理临时文件）。

## 7 验收清单

- [ ] `pnpm lint`、`pnpm typecheck` 零错误，`pnpm test` 通过（node/browser 双组按**文件名约定**分组：`*.node.test.ts` 落 node 组、含主题 CSS 契约守卫，其余落 browser 组；新增只跑 node 的契约测试按此命名即可，无需登记清单）
- [ ] 对照页并排：肉眼对比动画观感、焦点行为、键盘全流程
- [ ] 原版有而 React 版缺的行为：要么补齐，要么记入 DEVIATIONS.md
- [ ] 差异条目已按 `dev-docs/DEVIATIONS.md`「双层文档契约」回填元数据与文档落点，`pnpm test:node` 的 docs-contract 用例通过
- [ ] a11y 属性（aria-*、role）与原版 DOM 一致，落点与原版 `$tabIndexed` / `$titled` 相同
- [ ] 新增 / 变更的渲染契约断言已注明原版出处（类名 + dist 文件:行号），不是由 `-u` 反推
- [ ] 非受控 + 受控两种用法都验证
- [ ] 跨组件重复逻辑已收敛到 §4 的共享层，没有按组件手抄同类交互
