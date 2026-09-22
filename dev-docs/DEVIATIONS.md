# 与原版差异记录

与原版 oojs-ui 的差异记录。每条记一处差异，写法统一为：原版怎么做、本工程怎么做、为什么。

按性质分四节：

- **舍弃**：有意不做。原版的行为对本工程没有使用场景，或者本工程有意换一种做法；也包括明知与原版有差异、但有意接受而不修的缺口（此类条目须在正文点明「有意接受」）。
- **增强**：有意多做。原版没有、本工程主动加上的能力，也包括修正原版缺陷。
- **等效替代**：能力两边都有，只是实现形态、落点或通道不同，效果等价，不需要补做。
- **暂未实现**：原版有、本工程也认可其价值，但当前没做（含只做了简化版）。这一节最终应当清空。

四个标签的边界：能力一样作数、只是形态不同归「等效替代」；能力不作数归「舍弃」；有缺口的条目按立场分流——**认可其价值、打算补的**归「暂未实现」，**明知有差异但有意接受、决定不修的**归「舍弃」。勿把「暂未实现」当成收纳一切差异的筐：它只收「打算做而没做」的，最终应当清空。另：增强条目自身引入的缺口（原版无对应物）记在该增强条目内，不另迁「暂未实现」。

## 双层文档契约

本台账是差异的**唯一全量清单**，消费方文档（`docs/zh`、`docs/en`）只承载其中消费方可感知的子集。两层分工：

- **台账（本文件）**：面向维护者。立场分类、论证、原版出处（`dist` 文件名:行号）、待验证状态，可引用内部路径与代价权衡。
- **文档站**：面向使用方。只写「现象 + 迁移动作」，不写论证与出处；一个差异的展开叙述在消费方侧只出现一次（速查表 / 映射表的索引行不算出现）。跨组件与模型级差异收进 OOUI 对照页（`guide/ooui`），单组件差异收进组件页。

每条末尾的元数据行是两层的同步锚点，格式固定（全角间隔号）：

```
> id：<dev- 开头的 kebab 标识> ｜ 组件：<受影响组件，可多个> ｜ 文档：<docs/zh 相对路由，多个用「；」分隔>
```

「文档」字段只有两种取值：

- 路由（可多个）：对应文档页必须存在携带同 id 的 `{/* deviations: <id> */}` 标记（MDX 注释），中英两侧都要有；标记可附着在提示块、正文段落或表格行附近，不要求独立成块。
- `无需（<理由>）`：理由限三种——**纯内部实现** ｜ **对调用方不可见** ｜ **已对齐项留档**。

`src/docs-contract.node.test.ts` 校验以上契约（id 唯一、路由中英两侧存在、标记与路由双向对齐、中英标记集合一致、差异容器只用 warning/note）。

新增或修改条目的操作序列：写条目 → 判定消费方可感知性（标准：能否构造出「使用者会遇到不同结果」的具体场景）→ 可感知则在对应文档页写差异内容并加标记 → 回填元数据行 → 跑 `pnpm test:node`。条目正文的状态沿用行内关键词惯例（「待真机核对」「待读屏器实测」「有意接受」），不另设状态字段。

与 `dev-docs/comparison-guide.md` §4 的边界：§4 答「用什么共享实现、契约是什么」（面向改代码的人），本台账答「与原版形态差在哪、为何等价」（面向决策留档）；§4 提差异只给条级指针不复述理由，本台账提 hook 只给 §4 指针不写用法。

### 舍弃

- **TabOption 不支持 `href` 链接**。原版这个能力只有 PHP 端在用，本工程暂无需求。
  > id：dev-taboption-href ｜ 组件：TabSelect ｜ 文档：components/tab-select/index.mdx
- **`OO.ui.HtmlSnippet` 不映射**。原版用这个包装类把字符串标记为「原样输出、不转义」。React 的 `ReactNode` 本身就能表达 HTML 片段，不需要包装层。
  > id：dev-htmlsnippet ｜ 组件：全局 ｜ 文档：guide/ooui.mdx
- **`OO.ui.Theme` 不映射为运行时对象**。原版的主题 JS 类提供 `getElementClasses` 等钩子。本工程把类名生成收敛到 `src/mixins.ts` 的各贡献器（每个对应原版一个 Element mixin），主题样式仍由站点 CSS 提供，不设可替换的主题实例。代价是类名贡献只按 wikimediaui 语义硬编码，apex 等第三方主题下少数状态类会多出（已知偏差，见「等效替代」的选项着色条）。
  > id：dev-theme-runtime ｜ 组件：全局 ｜ 文档：guide/ooui.mdx
- **prompt 的 `textInput.value` 只作为初始值**。弹窗存活期间无法从外部修改输入值，输入内容由 prompt 内部维护。这与原版语义一致：原版 `TextInputWidget` 的 `value` 配置同样只在构造时生效。
  > id：dev-prompt-textinput-value ｜ 组件：prompt ｜ 文档：components/imperative-dialogs/index.mdx
- **工具栏不再经 `ToolFactory` 注册工具**。改为 ToolGroup 的声明式 `tools` props，工具激活态由调用方受控。原版对应的是 `tool.setActive` 加 toolbar 的 `updateState` 事件。
  > id：dev-tool-factory ｜ 组件：Toolbar、ToolGroup ｜ 文档：components/toolbar/index.mdx
- **内嵌工具组（`ToolProps.group`）的工具位不输出图标与标签类**。原版这两个类确实加在工具根元素上（构造期的 `IconElement.setIcon`/`Tool.setIcon`），但主题里依赖它们的规则全部以 `.oo-ui-tool-link` 为后代选择器，而这个链接已被 `ToolGroupTool` 移除（`this.$link.remove()`），类没有生效规则。本工程干脆不输出。
  > id：dev-toolgroup-tool-classes ｜ 组件：Toolbar ｜ 文档：无需（纯内部实现）
- **工具栏与工具组无事件面**。原版 `Toolbar` 与 `ToolGroup` 都有事件（`updateState`/`active`/`disable` 等）。其中 `PopupTool.onPopupToggle` 与 `ToolGroupTool` 会经工具组的 `active` 事件冒泡到 `Toolbar.active`，MediaWiki 侧常用它保持工具栏可见。本工程的工具激活态与弹出工具浮层开合已改为受控 props 与回调（`active`/`onSelect`、`popup.open`/`onOpenChange`）；工具组面板的开合同样是受控 props 与回调（`open`/`defaultOpen`/`onOpenChange`）。迁移要点：原版监听 `Toolbar.active` 的等价物是调用方重渲染整条 `tools` 数组（激活态由 `active` 声明）。
  > id：dev-toolbar-events ｜ 组件：Toolbar、ToolGroup ｜ 文档：components/toolbar/index.mdx
- **不提供 `ActionSet.static.specialFlags` 的子类扩展点**。原版允许子类改写这个静态属性来扩充「特殊动作」标志（缺省 `safe`/`primary`，命中者被安置到头部的 safe/primary 位）。本工程没有类继承，`ProcessDialog` 的特殊标志固定为 `safe`/`primary`，调用方经 `flags` 声明这两个即可。
  > id：dev-special-flags ｜ 组件：ProcessDialog ｜ 文档：components/process-dialog/index.mdx
- **原版 `OO.ui` 命名空间中宿主环境性质的全局工具不映射**。具体是：
  - `bind`（jQuery proxy）
  - `infuse`（PHP 服务端渲染水合）
  - `warnDeprecation`
  - `getUserLanguages`/`getLocalValue`（MediaWiki 多语言回退）
  - `generateElementId`（React `useId` 已覆盖）

  `debounce`/`throttle` 也不进导出面，组件内部直接用 es-toolkit。
  > id：dev-oo-ui-globals ｜ 组件：全局 ｜ 文档：guide/ooui.mdx
- **`isSafeUrl` 不映射，`href`/`action` 不做安全 URL 净化（已披露的接受风险，非「无人使用」）**。原版 `OO.ui.isSafeUrl` 按协议白名单（`http`/`https`/`mailto`/`tel` 等）加 `/`、`./`、`?`、`#` 前缀判定，两个消费点 `ButtonWidget.setHref` 与 `FormLayout` 构造对判定为不安全的 URL 加 `./` 前缀，把 `javascript:` 一类协议中和成相对路径。本工程 `Button` 的 `href` 与 `FormLayout` 的 `action` 都直传、不改写 URL。这样做的依据是**生态惯例**：React 对 `javascript:` 只有开发期告警、Vue 官方安全指南要求「在后端、入库前净化」，而 Codex（OOUI 的官方继任者）在组件层根本不提供 URL 能力（`Button` 无 href，链接样式由 CSS mixin 承担）；组件层净化的例外是框架地基（Angular `DomSanitizer`）与不可信内容渲染器（react-markdown/DOMPurify）。**但要如实定性：这是移除了原版的一层纵深防御，而非纯粹的能力舍弃**——React 运行期不拦截 `javascript:`/`<form action="javascript:">`，故该能力是**可达的 XSS 汇聚点**，安全责任显式转交给调用方与后端：来源不可信的 `href`/`action` 必须自行校验（见各组件的 props 注释与文档站 Button / FormLayout 页的安全提示）。这与 `TabOption` 的 `href` 无关，后者的 `href` 能力本身已舍弃。本工程另导出**显式净化工具** `sanitizeUrl`（协议白名单 + `./` 前缀，对齐原版 `OO.ui.isSafeUrl` 与其两个消费点的处理），调用方需要组件层净化时可直接用它；组件仍不自动改写 URL。
  > id：dev-safe-url ｜ 组件：Button、FormLayout ｜ 文档：components/button/index.mdx；components/form-layout/index.mdx
- **FieldLayout 不做 `align='inline'` 的降级校验**。原版在字段根元素不是 `span` 时把 `align='inline'` 自动降级为 `'top'`（`isFieldInline()` 探测字段根元素的 tagName）。本工程没有字段元素类型探测通道，故不实现这层防御性降级：调用方传了不合适的 `inline` 就照原样渲染。注意 `fieldInline` 只是 `ActionFieldLayout` 的 prop，`FieldLayout` 自身不读它。（`FieldLayout` 字段包装元素恒为 `<span>` 的形态差异见「等效替代」的同因条。）
  > id：dev-fieldlayout-inline ｜ 组件：FieldLayout ｜ 文档：components/field-layout/index.mdx
- **选项族 `flags` 只在带图标槽位的选项形态上开放**。原版 `OptionWidget` 混入 `FlaggedElement`，选项可经 `flags` 输出 `oo-ui-flaggedElement-*` 并影响图标变体（progressive/destructive/error/warning/success）。本工程在 MenuOption / OutlineOption / MenuSectionOption（经 `OptionFlaggedElement`）与 ButtonOption 上开放 `flags`（→ `oo-ui-image-*` 变体，见「等效替代」的选项变体条）；纯标签选项（TabOption / RadioOption / CheckboxMultioption）没有图标槽位、无着色对象，不开放。
  > id：dev-option-flags-scope ｜ 组件：选项族 ｜ 文档：guide/options.mdx
- **未实现 `PopupTagMultiselectWidget`**。原版该类构造期就 `warnDeprecation`（建议改用 `MenuTagMultiselectWidget`），本工程不提供。
  > id：dev-popup-tag-multiselect ｜ 组件：TagMultiselect ｜ 文档：guide/ooui.mdx
- **`SelectFileInputWidget` 的拖放不保留老浏览器的 API 形态回退**。原版 `onDragEnterOrOver` 取 `dt.items || dt.files`（`dist/oojs-ui.js:14713`）、`onDrop` 取 `dt.files || []`、判定 `types` 时取 `OO.getProp(dt, 'types') || []`，都是为「`DataTransfer.items`/`types` 缺失的旧 Safari」留的防御。本工程的拖放能力本身已由 `CAN_SET_FILES` 门控（`new DataTransfer()` 可用，Safari 14.1+），该起点上 `items` 与 `types` 一定存在，故直接取用、不回退。这不是放宽支持面：不可构造 `DataTransfer` 时本组件整条拖放路径不挂载，回退分支原本也走不到。
  > id：dev-selectfile-dnd-fallback ｜ 组件：SelectFileInputWidget ｜ 文档：无需（对调用方不可见）
- **TagMultiselect 不开放替换内部输入控件**。原版 `config.input`/`config.inputWidget` 可以替换内部输入控件；本工程内置输入框，对齐其余组件不暴露内部输入控件的做法。
  > id：dev-tagmultiselect-input ｜ 组件：TagMultiselect ｜ 文档：components/tag-multiselect/index.mdx
- **独立 `Label` 不做 `input` 关联（原版 `LabelWidget` 的 `config.input`）**。原版该配置做两件事：输入框有 id 时把 `for` 指向它（原生点击聚焦），无 id 时点击触发 `simulateLabelClick`。本工程只保留等价能力的一半且不给专用通道——有 id 的形态由 `htmlFor` 承担（`Label` 的 rest 直通 `<label>`），无 id 的形态需「持 input 引用并在点击时聚焦」，那会把命令式耦合搬进 React；字段关联语义统一由 FieldLayout 承担（自带 `for` + 点击激活双通道）。根元素标签名已对齐原版 `static.tagName='label'`（渲染 `<label>`；内嵌标签场景原版缺省也是 span，由 LabelBase 承担）。
  > id：dev-label-input ｜ 组件：Label ｜ 文档：components/label/index.mdx
- **多行输入框不提供 `allowLinebreaks` 配置与 `enter` 事件**。原版 `MultilineTextInputWidget` 可经该配置（缺省 `true`）退化成「假装单行」形态：阻止 Enter 换行、`cleanUpValue` 把换行替换为空格，并把 Ctrl/Cmd+Enter 改作 `enter` 事件（`dist/oojs-ui.js:12325-12457`）。本工程恒等价于 `allowLinebreaks=true`（Enter 插入换行），不提供该配置与事件通道——这是原版的历史包袱：禁止换行由调用方清洗输入值即可，`enter` 在 `prompt` 场景已由单行输入框承担。对照页 `multiline-compare` 的「换行与Enter」区块可见差异。与 `allowInteger`/`isInteger`（见「等效替代」条）的处置差异在保留成本：那两个只是别名 prop 加一行覆盖 `step`，本配置则要新增 `enter` 事件通道与 `cleanUpValue` 行为分支。
  > id：dev-allow-linebreaks ｜ 组件：MultilineTextInput ｜ 文档：components/multiline-text-input/index.mdx
- **弹出工具置于 List/Menu 组内不提供支持（本工程侧是已知缺陷，不是干净 no-op）**。选中工具会先收起组面板，浮层锚点随面板 `display:none` 归零：原版侧浮层不显示（`hideWhenOutOfView` 判定），本工程侧浮层**仍会渲染、只是定位到视口左上角**。即本工程的能力是「半可用 + 错位」，而非「两边都不作数」，故按**有意接受的已知缺陷**记（无测试守护此路径；按边界规则属「有意接受的缺口」，留在「舍弃」节而非「暂未实现」）；要修需让锚点在面板收起后仍可测量（如收起时延后卸载、或以工具所在工具栏为锚点）。
  > id：dev-popup-tool-in-list ｜ 组件：Toolbar ｜ 文档：components/toolbar/index.mdx
- **ComboBoxInput 的 `readOnly` 同时关闭展开通道（行为收窄）**。原版 `setReadOnly` 经 `updateControlsDisabled` 把下拉按钮与菜单本体一并禁用，但 `onEdit` 不查 readOnly——点击输入框仍能把菜单展开出来（菜单项全部禁用、不可选）。本工程三条展开通道（方向键、下拉按钮、点击输入框）均受 `controlsDisabled` 把关，readOnly 下不再展开。原版「readOnly 可展开一个全禁用的菜单」没有实际使用场景，本工程按「readOnly 即完全只读」收窄；输入变更在 readOnly 下天然不产生，与原版一致。
  > id：dev-combobox-readonly ｜ 组件：ComboBoxInput ｜ 文档：components/combo-box-input/index.mdx
- **Message 的关闭按钮只回调 `onClose`，不自行隐藏（迁移陷阱）**。原版点击关闭按钮即 `toggle(false)` 内置隐藏；本工程组件不持显隐状态，`onClose` 只报出点击意图，显隐交由调用方的条件渲染/卸载。**漏接 `onClose`、或回调里没把消息卸载/隐藏，点击后消息就点不掉**（与原版的默认行为不同，对照页 `message-compare` 的「error close」行演示该差异）。这是声明式受控（MUI 式 `onClose` 回调）的取舍：补「内部自持显隐」的非受控形态会引入第二套显隐通道，故不做。`onClose` 是「点击关闭按钮」的回调，不是浮层打开态，不适用 `open`/`defaultOpen`/`onOpenChange` 约定。
  > id：dev-message-onclose ｜ 组件：Message ｜ 文档：components/message/index.mdx
- **`ListToolGroup` 的 More/Fewer 图标方向不随工具栏 `position` 反转**。原版按 `inverted = toolbar.position === 'bottom'` 在两个图标名之间做方向选择：`this.expanded === inverted ? 'expand' : 'collapse'`（`oojs-ui-toolbars.js:2734-2736`；`inverted` 只用于选图标，与反色/配色无关）；本工程恒按 `expanded ? 'collapse' : 'expand'`（`toolbars/ListToolGroup/index.tsx`），故工具栏置于底部时箭头方向与原版相反。属可用性小差异（功能不受影响）。
  > id：dev-listtoolgroup-icons ｜ 组件：Toolbar ｜ 文档：components/toolbar/index.mdx
- **NumberInput 的非正 step 校验：原版抛错，本工程只告警**。原版 `setStep` 对 `step`/`buttonStep`/`pageStep` 中任一 `<= 0` 直接抛错（`dist/oojs-ui.js:13952-13967`，构造期经 `:13886` 调用），调用方错传即整个组件创建失败。本工程收为开发期告警一次、按给定值照常渲染——React 下不会因为某个 step prop 在打字中途变成 `0`/负值而让子树抛错；代价是原版那层「早失败」的校验不再有（见 `NumberInput/index.tsx` 的构造期告警）。
  > id：dev-numberinput-step ｜ 组件：NumberInput ｜ 文档：components/number-input/index.mdx

### 增强

> 本节混含两类，采纳前须区分：**净收益**（修原版「同一状态两种表现」或静默失效的缺陷，有唯一正确答案，如反色一致性、clipboard、NaN 钳制）与**有代价的取舍**（改了默认行为或引入组件间分叉，条目内已点破，如 `isMobile` 激活死分支、Popup 滚动重判、布局自动补选）。后者不是免费的改进，翻案时优先看条目内的代价说明；识别方法是条目正文已点破代价（检索「取舍」「代价」即可定位，如 `isMobile` 激活死分支、Popup 滚动重判、布局自动补选）。
>
> 移动端支持是**跨节的一个整体里程碑**：本节的 `isMobile`（接通了原版恒不可达的移动端分支）与 iOS 触摸滚动兜底（原「暂未实现」，现已实现）应一并推进——当前状态是「移动端分支已接通、兜底机制已实现，尚缺 iOS 真机核对」，真机确认前勿在移动端上线时零散依赖 `isMobile` 为真。

- **`isMobile` 由恒 `false` 的桩映射为可配置项**。原版 `OO.ui.isMobile` 的默认实现恒返回 `false`（源码注释就写着「由实现方决定」），dist 里也没有任何组件把它覆盖成真值，所以原版所有移动端分支在纯 OOUI 环境下都不可达。本工程把它映射为 `OOUIProvider.isMobile`（`useIsMobile`），配置为真后这些分支就生效。目前已实现六处：`TabSelect` 里 `TabOption` 选中后居中滚动（含 `oo-ui-tabSelectWidget-mobile` 类）、`IndexLayout` 与 `BookletLayout` 的 autoFocus 抑制、`ProcessDialog` 的 `oo-ui-isMobile` 类、`ProcessDialog.fitLabel` 的「移动端不居中」、`DropdownInput` 的 `oo-ui-isMobile` 类。
  > id：dev-is-mobile ｜ 组件：全局 ｜ 文档：guide/configuration.mdx
- **`resolveTitle` 的兜底随 props 重渲染重算**。原版 TitledElement 的「invisibleLabel → title」兜底只在构造期求值（后续 `setLabel`/`setInvisibleLabel` 不重算 title），本工程每次渲染按当前 props 计算，`label`/`invisibleLabel` 后续变化会联动 title。原版窄栏切换（如 `onToolbarResize` 只改写 invisibleLabel/label）后 title 滞留构造期值正是这层冻结的缺陷（见下方 PopupToolGroup 的窄栏兜底条——同一类修正），本工程按声明式统一重算。这是声明式求值时机的固有差异，兜底能力本身两侧一致。
  > id：dev-resolve-title-rerender ｜ 组件：全局（TitledElement 系） ｜ 文档：guide/basics.mdx
- **`aria-required` 是原版 DOM 之外的附加属性（覆盖 TextInput 继承线）**。原版 `RequiredElement` 只写原生 `required`；本工程对 TextInput 继承线的组件（TextInput/MultilineTextInput/NumberInput/ComboBoxInput 等落点在原生 input 的形态）同时输出 `aria-required`（对原生 input 冗余但无害，不改变 AT 播报）。**落点必须是承载语义的元素**：`DropdownInput` 的外层 `<div>` 没有适用 role，`aria-required` 对它无效，故不在那里输出，必填语义由内层原生 `<select required>` 承载；Checkbox/Radio/SelectFile 等非文本形态也不输出——`aria-required` 原本就主要为文本输入设计，非「全组件统一策略」。
  > id：dev-aria-required ｜ 组件：TextInput、MultilineTextInput、NumberInput、ComboBoxInput ｜ 文档：components/text-input/index.mdx
- **`RadioSelectInput` 采纳 `options[].disabled`**。原版 `RadioSelectInputWidget.setOptionsData` 构造 `RadioOptionWidget` 时只转发 `data` 与 `label`，`opt.disabled` 被静默丢弃。同一份选项配置下，`CheckboxMultiselectInputWidget`（显式转发 `disabled`）与 `DropdownInputWidget`（`opt.disabled !== undefined` 即 `setDisabled`）都会禁用该项，只有 Radio 型渲染为可用项。本工程按声明采纳 `disabled`，与另两个 Input 包装组件的口径一致。
  > id：dev-radioselectinput-disabled ｜ 组件：RadioSelectInput ｜ 文档：components/radio-select-input/index.mdx
- **TabSelect 修掉了原版拖拽的一个缺陷**。原版的 `selecting` 在丢失 mouseup 后（例如按住鼠标拖出窗口再松开）会残留，下次点击空白处就会误提交旧选项。本工程在 mousedown 时重置拖拽状态，并监听 `pointercancel` 清理。（按住拖动跨选项选择原版已实现，未改动。）
  > id：dev-tabselect-drag-fix ｜ 组件：TabSelect ｜ 文档：components/tab-select/index.mdx
- **工具栏面板支持按 Escape 收起**。原版只能靠鼠标或键盘在面板外松开时收起，没有 Escape 键。
  > id：dev-toolbar-panel-escape ｜ 组件：Toolbar ｜ 文档：components/toolbar/index.mdx
- **弹出工具（`ToolProps.popup`）的 `onSelect` 仍会触发**。原版 `PopupTool.onSelect` 被 `popup.toggle()` 占用，调用方拿不到选中通知。本工程按压流照常回调 `onSelect`，浮层开合由工具自身的点击与按键驱动，显隐变化另经 `popup.onOpenChange` 通知。
  > id：dev-popup-tool-onselect ｜ 组件：Toolbar ｜ 文档：components/toolbar/index.mdx
- **弹出工具的 `autoFlip` 可配置**。原版构造期无条件 `setAutoFlip(false)`，`config.popup.autoFlip` 传了也不生效。本工程默认同样是 `false`（对齐原版），但允许调用方显式打开翻转。
  > id：dev-popup-tool-autoflip ｜ 组件：Toolbar ｜ 文档：components/toolbar/index.mdx
- **布局族在激活项被移除时自动补选（StackLayout / IndexLayout / BookletLayout）**。非受控直接生效，受控则由父组件决定是否采纳；补选来自三者共用的 `useLayoutSelection`。原版三个布局的口径各不相同，**本条只对 BookletLayout 构成刻意改变**（StackLayout 与 IndexLayout 的补选本就与原版一致，本条对它们是补齐对齐）：
  - 基类 `StackLayout.removeItems` **补选**：取「下一个未被移除项，末项被移除时取新末项」，列表空才 `unsetCurrentItem`（`dist/oojs-ui.js:16266-16289`）。
  - `IndexLayout.removeTabPanels` **补选**：`SelectWidget.removeItems` 先取消被移除项的选中（`dist/oojs-ui.js:8247-8259`），随后 `selectFirstSelectableTabPanel()` 选**首个可选**（`:17650-17663`、`:17758-17764`）。
  - `BookletLayout.removePages` 只清 `currentPageName`（`:17108-17123`，注释「We might loose the selection here, but what to select instead is business logic.」）；stack 侧仍会补选，但补选结果不写回 `currentPageName`（`:16739-16746` 的 set 处理只做聚焦），outline 与 stack 就此失步——这是原版自身的缺陷。本工程把 outline 与 stack 收敛到同一 `effectiveValue`，BookletLayout 侧反而比原版一致。
  - **失效回退已按各自对应的原版实现对齐**（`resolveLayoutSelection` 的 `fallback`）：IndexLayout 取**首个非禁用**页签（`firstSelectable`，对齐 `selectFirstSelectableTabPanel` 的 `findFirstSelectableItem`）；BookletLayout 取**下一个未被移除项→新末项**（`nextThenLast`，对齐 `StackLayout.removeItems`）——因 Booklet 的显示由 stack 驱动，原版 stack 侧的补选才是用户所见。原版没有的两种情形按「首个可选」处理：从未给出激活值、以及值从未出现在选项列表中（如初始即非法）。**注意后者对 StackLayout 原版有对应物**：原版 `StackLayout.setItem` 遇未知项会 `unsetCurrentItem()` 全部隐藏，受控模型下本工程按家族统一口径取首个可选（比全隐藏更可用）。全禁用（无可选项）时不选中，对应原版「选中项为空」。
  > id：dev-layout-autoselect ｜ 组件：StackLayout、IndexLayout、BookletLayout ｜ 文档：guide/controlled.mdx
- **ProgressBar 把 `progress` 钳制在 0–100**，非有限值（NaN 等）按不定进度处理。原版 `setProgress` 不钳制，NaN 会直接输出 `width: NaN%` 和 `aria-valuenow="NaN"`。
  > id：dev-progressbar-clamp ｜ 组件：ProgressBar ｜ 文档：components/progress-bar/index.mdx
- **直选族（ButtonSelect / TabSelect）的 `aria-activedescendant` 在初始选中时即输出**。原版 `SelectWidget.selectItem` 只在选中项变化时写入该属性，所以带初始选中值的控件首帧没有这个属性。本工程按声明式状态始终输出选中项 id（取值与选项 id 同经 `useDirectSelect`）。
  > id：dev-directselect-activedescendant ｜ 组件：ButtonSelect、TabSelect ｜ 文档：guide/options.mdx
- **直选族（ButtonSelect / TabSelect）点击选项后把焦点收进组根**。原版 `SelectWidget.onMouseDown` 恒返回 false（preventDefault），点击后焦点留在原处（实测确认落在 body），方向键不响应——只有先 Tab 聚焦进组才可用键盘，属原版的键盘可达性缺陷（也不符合 ARIA APG「点击页签/选项后焦点应落入组」的推荐）。本工程在指针按下（左键、非禁用组）时聚焦组根，方向键随即生效；不产生可见焦点环（鼠标交互后 `:focus-visible` 不命中）。**取舍**：点击行为与原版不同（原版点击后焦点不动），需要严格逐帧对齐原版 DOM 焦点流的场景（目前未发现）须注意。`Select` 不在此列：其列表根按原版有意不进 Tab 序（键盘由触发元素经 `focusOwnerRef` 驱动），无此问题。
  > id：dev-directselect-focus ｜ 组件：ButtonSelect、TabSelect ｜ 文档：guide/options.mdx
- **CopyTextLayout 的复制优先走 `navigator.clipboard`**，不可用或被权限拒绝时回落到原版用的 `document.execCommand('copy')`。原版只用后者，该 API 已废弃，在非安全上下文或部分浏览器中会静默失败，且无从感知。
  > id：dev-copy-clipboard ｜ 组件：CopyTextLayout ｜ 文档：components/copy-text-layout/index.mdx
- **HiddenInputWidget 的 `disabled` 落到原生属性上**。原版经 `Widget.setDisabled` 只切换 `oo-ui-widget-*` 类并移除 `aria-disabled`，被「禁用」的隐藏输入仍会随表单提交。本工程按标准 `disabled` 语义让它退出提交。
  > id：dev-hidden-input-disabled ｜ 组件：HiddenInputWidget ｜ 文档：components/hidden-input-widget/index.mdx
- **ButtonOption 的选中态图标与指示器一律反色**。原版 `ButtonOptionWidget` 构造期 `setSelected` 会 `setActive(true)`，但随后 `ButtonElement` 构造函数把 `this.active` 复位为 `false`，于是「初始选中」的按钮不反色、「用户点选后」的按钮才反色，同一状态两种表现（实测确认）。本工程按主题规则统一输出：带边框按钮在激活或禁用时反色。
  > id：dev-buttonoption-invert ｜ 组件：ButtonOption ｜ 文档：components/button-select/index.mdx
- **Button 系列不输出 `oo-ui-buttonElement-size-medium`**。原版 `ButtonElement.setSize` 缺省会写入尺寸类（`medium`），而该类在 wikimediaui 与 apex 两个主题的 CSS 里都没有定义、不产生样式。本工程的 Button/ButtonInput/ButtonOption 一律不输出。
  > id：dev-button-size-medium ｜ 组件：Button ｜ 文档：无需（对调用方不可见）
- **固定标签不可拖拽，且非固定标签不得被拖到固定标签之前**。原版虽然在 `TagItemWidget` 上实现了 `fixed`（不渲染关闭按钮、不可移除与编辑），但标签多选族没有开放这个配置的入口（`MenuTagMultiselectWidget.createTagItemWidget` 不传 `fixed`），所以实际不可达，标签恒可拖可移除。本工程在 `TagOptionProps` 上开放 `fixed`，并让拖拽的目标下标钳制在固定区之后，固定项的顺序不受拖拽影响。
  > id：dev-tag-fixed ｜ 组件：TagMultiselect、MenuTagMultiselect ｜ 文档：guide/options.mdx
- **ButtonMenuSelectWidget 键盘展开同样输出按压态**。原版键盘展开时 `oo-ui-buttonElement-pressed` 会被随后的 keyup 复位流清掉（鼠标展开则有按压态，同一状态两种表现）。本工程按声明式状态输出：按压类恒随打开态。`aria-owns` 不在此列：四个菜单触发组件（Dropdown/ComboBoxInput/ButtonMenuSelectWidget/TagMultiselect）统一为「展开时声明所拥有的菜单」，对齐原版 `MenuSelectWidget.onToggle` 的写/移除稳态——与原版的差异仅剩初始收起帧（原版 ComboBoxInput/ButtonMenuSelectWidget 构造期写入、首次关闭前存在；TagMultiselect 的原版同样经 onToggle 写/移除，无初始帧差异）。
  > id：dev-bmsw-pressed ｜ 组件：ButtonMenuSelectWidget ｜ 文档：components/button-menu-select/index.mdx
- **ButtonMenuSelectWidget 用键盘手势标记跳过 Button 的 keypress 激活通道**。Button 的 `handleKeyPress` 对 Enter/空格模拟 click（对齐原版 `ButtonElement.onKeyPress`），故同一次按键可能既走 keydown 分支、又经 keypress 的模拟 click 再次开合。本工程用手势标记（keyup 复位）跳过后者。**原「Chrome 仍会派发 keypress」的断言已被实测推翻**：Chromium 下 keydown 调 `preventDefault` 后 keypress **不**派发（实测：不 preventDefault 时 `keypress=1`，preventDefault 后 `keypress=0`，Enter 与可打印字符同），故对已消费的 Enter/空格而言该标记是跨浏览器防御（并非承重）。它真正承重的场景是**前缀缓冲活跃时的空格**：那里刻意不 `preventDefault`（否则空格进不了前缀缓冲），必须靠标记挡掉模拟 click，否则打字会开合菜单（Dropdown 的 handle 不是 Button、无该通道，故只需守卫不需标记）。
  > id：dev-bmsw-gesture-guard ｜ 组件：ButtonMenuSelectWidget ｜ 文档：components/button-menu-select/index.mdx
- **ButtonMenuSelectWidget 与 Dropdown 展开后空格可选定**。原版展开态按空格不被菜单消费（`MenuSelectWidget.onDocumentKeyDown` 没有 SPACE 分支），keypress 照发，经 `ButtonElement.onKeyPress` 的 click 模拟只关闭菜单。本工程空格与 Enter 同分支，直接选定高亮项（与按钮空格激活的 ARIA 惯例一致，Dropdown 同）。两个组件都带**前缀缓冲守卫**：前缀缓冲活跃时空格属于 type-to-search、不做开合（对齐原版 `DropdownWidget.onKeyDown` SPACE 分支的 `keyPressBuffer === ''` 守卫）——BMSW 同样启用前缀跳转，守卫必须一并施加，否则空格会中断多词选项的搜索；且该分支不能 `preventDefault`（会连 keypress 一起抑制，空格就进不了缓冲），改由手势标记挡掉 Button 的模拟 click（见上条）。
  > id：dev-menu-space-select ｜ 组件：Dropdown、ButtonMenuSelectWidget ｜ 文档：components/dropdown/index.mdx；components/button-menu-select/index.mdx
- **PopupToolGroup 的 title 按窄栏生效值兜底**。原版 TitledElement 的「invisibleLabel → title」兜底只在构造期求值，而窄栏切换（`onToolbarResize` 只改写 invisibleLabel、label、icon）不会重算 title，所以构造期没有 title 兜底（title 为空）且窄栏才引入 invisibleLabel 时，原版窄栏把手下没有 tooltip（若构造期即为 invisibleLabel，则兜底已在构造期写入 title，窄栏下仍有 tooltip）。本工程按窄栏生效的 `invisibleLabel`/`label` 计算，窄栏下仍有 tooltip。未设置 invisibleLabel 时两侧一致。
  > id：dev-popuptoolgroup-title ｜ 组件：Toolbar ｜ 文档：components/toolbar/index.mdx
- **ButtonGroup 的组禁用下发给组内按钮**。原版 `ButtonGroupWidget` 没有覆写 `setDisabled`，只给组根切换 `oo-ui-widget-disabled`/`-enabled`，组内按钮仍是 enabled（图标与指示器也因此不反色）。本工程经 Context 把组禁用与按钮自身 disabled 取或，组内按钮输出 disabled 态，按压与点击都被拦截，对齐本工程「组禁用即各项禁用」的一贯口径。对照页 `button-checkbox-compare` 的 ButtonGroup 区块可见两侧差异。
  > id：dev-buttongroup-disabled ｜ 组件：ButtonGroup ｜ 文档：components/button-group/index.mdx
- **SelectFileInputWidget 的初始文件集可用 `value`/`defaultValue` 声明**。原版构造期传 `value` 会被丢弃：那时 `$input` 还没置 `type=file`，`setValue` 写回 `input.files` 无效，而构造末尾又用 `$input.files` 覆盖了 `currentFiles`（实测 `new SelectFileInputWidget({value:[file]})` 之后 `currentFiles` 与 `input.files` 都是空、`oo-ui-selectFileInputWidget-empty` 未摘除），原版只能构造后再调 `setValue`。本工程按受控惯例直接生效，并把文件集写回 DOM 的 `input.files`（经 `DataTransfer`），表单提交正常。
  > id：dev-selectfile-value ｜ 组件：SelectFileInputWidget ｜ 文档：components/select-file-input-widget/index.mdx
- **多行输入框 autosize 的重测时机含盒模型与宽度变化兜底**。原版 `adjustSize` 由 change 事件、元素挂载与 `updatePosition` 驱动，标签宽度变化、字体加载、窗口缩放后都不重算，高度滞留到下一次输入。本工程在值或行数变化时同步重测之外，再用 ResizeObserver 观察输入框尺寸兜底重测，首帧测量早于标签让位内边距生效的问题也因此消除。
  > id：dev-autosize-remeasure ｜ 组件：MultilineTextInput ｜ 文档：components/multiline-text-input/index.mdx
- **垂直滚动条让位按输入元素自身方向判定，方向分叉时整体撤回**。原版 `adjustSize` 的 scrollWidth 分支读的是**根元素**的 `css('direction')`，而 `dir` 配置经 `InputWidget.setDir` 只落在 `$input` 上，于是 LTR 页面显式 `dir='rtl'` 时原版让位到 `right`，但 RTL 输入框的垂直滚动条实际在左侧。本工程读输入元素自身的有效方向判定让位侧，**但落侧实际恒等于根方向侧**：指示器/标签由主题 CSS 按样式表方向以物理 `left/right` 锚定，输入方向与根方向分叉（正是这条要处理的场景）时，内联偏移落在对侧会把绝对定位元素两端钉住而**拉伸而非平移**（对照页「LTR 页面 + `dir='rtl'` 输入」实测复现：标签宽 38.7px 撑到 503px、文本挤成竖列，原版同场景无此变形），故**分叉时撤回让位**（`useScrollbarOffset` 接 `rootRef`；连同并入同侧内边距的滚动条宽度一并撤回，`Input/props.ts` 亦限定只有 `labelPosition === 'after'` 才并入）。此时物理滚动条与指示器/标签本就分居两侧、无遮挡，撤回即退回正确稳态。净收益因此是「消除原版的拉伸变形」，**不是**「让位侧跟随输入方向」——后者在其唯一适用场景里以撤回兑现，勿按字面理解。
  > id：dev-scrollbar-offset ｜ 组件：TextInput 系 ｜ 文档：components/multiline-text-input/index.mdx
- **Popup 在滚动引起裁剪变化时会重新判定翻转方向**。原版滚动时只重定位、不重判翻转方向（`FloatableElement` 的滚动处理器就是 `position`，`isAutoFlipped` 只在 `PopupWidget.toggle` 内改写；`MenuSelectWidget.toggle` 的注释亦明确「滚动引起裁剪变化时不再翻转」），方向冻结到下次打开。本工程在滚动时经 `resolvePopupPosition` 重新判定，裁剪条件变化后会换向。**这是取舍而非净收益**：原版明确拒绝该行为（「滚动后裁剪变化就换向，会很烦人」），代价是滚动过程中浮层可能跳动；换来的是容器尺寸/布局变化后方向仍然正确。若后续觉得跳动更碍事，可改为只对容器尺寸变化重判（纯滚动沿用打开时定下的方向）。本条只描述 Popup：兄弟浮层 **MenuSelect 的开合期翻转已对齐原版**（`useAnchoredPanelLayout.flip`，按两侧可用高改选方向，见下条），它同样在滚动时不重判——差异只剩 Popup 的滚动重判。
  > id：dev-popup-scroll-reflip ｜ 组件：Popup ｜ 文档：components/popup/index.mdx
- **CheckboxMultioption 的根元素用 `role='checkbox'` 加 `aria-checked`**，内层是原生 checkbox。原版 `CheckboxMultioptionWidget` 继承 `MultioptionWidget`（不在 `OptionWidget` 线上），根元素没有任何 role，选中态只由 `oo-ui-multioptionWidget-selected` 类表达（`role='option'` 是 `OptionWidget` 线经 `SelectWidget` 的 `listbox` 承载的）。本工程在根上显式声明 checkbox 语义，与内层原生 checkbox 重复，但便于 AT 直接读到状态。**待读屏器实测**：根不可聚焦（`tabIndex=-1`），浏览模式下可能重复播报两个 checkbox；若实测确认重复且无收益，可回退为对齐原版（不设 role）。**注意此处与独立 `CheckboxInput` 是两种立场**：后者根是 `<span>`、无 role，完全依赖内层原生 input 承载 checkbox 语义（它没有 multioption 那样的「外层包裹」需求）。实测结论若成立，multioption 才是异类，统一时应以 `CheckboxInput` 的立场为准。
  > id：dev-multioption-role ｜ 组件：CheckboxMultiselect ｜ 文档：components/checkbox-multiselect/index.mdx
- **工具栏面板铺满容器时仍保留纵向钳高**。原版 `PopupToolGroup.setActive` 的填充分支先 `toggleClipping(false)`（横向与纵向裁剪一并撤掉）再写 `width`/`min-width`，面板高度不再受可视区约束；本工程只把宽度铺满容器，纵向仍按可用空间钳高并内部滚动（工具始终可达）。
  > id：dev-panel-maxheight ｜ 组件：Toolbar ｜ 文档：components/toolbar/index.mdx
- **工具栏窄栏判定的内容宽度基准会随内容集变化重置**。原版的 `narrowThreshold` 只在构造期置 `null`（`dist/oojs-ui.js:20969`），`getNarrowThreshold` 惰性计算一次后**永久缓存**（`:21123-21129`），此后工具组增减仍沿用首次测量值；本工程在内容集变化（`actions`/`position`/`className` 变化触发 effect 重跑）时重置基准重测，能感知工具组增减。其余口径对齐原版：只在宽栏态测量（测量期临时摘掉 `oo-ui-toolbar-narrow` 取自然宽度，避免以被压缩的宽度为基准而误判），窄栏态复用缓存（窄栏下 `narrowConfig` 已替换把手/工具文本，以窄栏内容为基准重测会无法退出窄栏）。
  > id：dev-narrow-threshold-reset ｜ 组件：Toolbar ｜ 文档：components/toolbar/index.mdx
- **命令式弹窗（`confirm`/`alert`/`prompt`）不做单窗口队列，重复调用层叠显示**。原版三个 API 共用全局单例 `WindowManager`，而该管理器是单窗口的：已有窗口打开时 `openWindow` 直接以 `Cannot open window: another window is open` 拒绝（`dist/oojs-ui.js:24952-24962`），`OO.ui.confirm` 等返回的 promise 随之永不兑现，第二层调用静默失效。本工程每个弹窗独立挂载（`src/dialogs/statics.tsx`），重复调用会层叠、逐个可交互——ESC 与焦点陷阱绑在弹窗自身，多层层叠时天然只有顶层响应。
  > id：dev-imperative-no-queue ｜ 组件：confirm、alert、prompt ｜ 文档：components/imperative-dialogs/index.mdx
- **命令式弹窗经 in-tree 宿主渲染，自动继承 `OOUIProvider` 及其祖先的 context**（本工程特有机制）。原版这三个 API 由全局单例 `WindowManager` 承担，与其余组件同处 `OO.ui` 命名空间，天然共享 `OO.ui` 的全局配置。本工程 `confirm`/`alert`/`prompt` 是独立函数，经模块级队列（`src/dialogs/imperative.tsx`）交给 `OOUIProvider` 在自己配置子树内渲染的宿主 `ImperativeDialogHost`：宿主挂在 React 树内，弹窗因此继承宿主的全部配置与 context（文案/`isMobile`/`dir`，及应用自有的状态、路由等 Provider），无需任何手动注入。嵌套多个 Provider 时恒由**最外层**宿主渲染（命令式调用无位置信息，映射到应用根部最可预期）；未包 `OOUIProvider` 时懒挂 `document.body`、按缺省值渲染（英文文案等），此场景下文案经模块级 `registerMessages` 覆盖。另有一条：弹窗恒 portal 至 `document.body`（由各自的 `WindowManager` 承担），`WindowManager` 的 portal 目标不经 `getPortalContainer` 解析——弹窗是浮层容器的提供方而非消费方，让弹窗读该配置会形成自指。详见 dev-docs/comparison-guide.md「命令式弹窗的渲染环境」。
  > id：dev-imperative-host ｜ 组件：confirm、alert、prompt ｜ 文档：guide/configuration.mdx；components/imperative-dialogs/index.mdx
- **标签接受非字符串 ReactNode（`0` 等按有标签处理，布尔除外）**。原版 `LabelElement.setLabel` 只认非空字符串与 `HtmlSnippet`（数字、布尔一律归为无标签，`dist/oojs-ui.js:2994-2996`）。本工程的 `hasLabel` 只排除 `null`/`undefined`/`''` 与布尔：布尔在 JSX 里不渲染任何内容，若判为有标签就会输出 `oo-ui-labelElement` 类加一个空标签元素（类声称有标签、实际无内容），故按无标签处理；数字 `0` 等可渲染节点按有标签处理，与「标签让位内边距」的判定同口径。这是把标签能力**放宽**到 ReactNode，属行为差异（偏增强），不是舍弃。
  > id：dev-label-reactnode ｜ 组件：全局（LabelElement 系） ｜ 文档：guide/basics.mdx
- **`inputPosition='none'` 的标签多选菜单可用鼠标展开（已超出原版）**。原版该形态没有任何路径调用 `menu.toggle(true)`（document 键盘监听只在菜单可见时绑定 `dist/oojs-ui.js:8935-8938`，`20233-20252` 的两个开启点都依赖输入框），对照页 `tag-multiselect-compare` 实测（wikimediaui）：原版点击标签菜单保持隐藏、焦点陷阱上按 ↑/↓ 与 Enter 均无效果；本工程点击标签即展开菜单并高亮被点项。**剩余缺口**是「展开后无键盘导航」（焦点不在菜单、菜单根不输出 `tabindex`），属本条的延续而非「原版有而本工程没做」，故不入「暂未实现」；要补需连同读屏器实测再开。
  > id：dev-menu-open-no-input ｜ 组件：MenuTagMultiselect ｜ 文档：components/menu-tag-multiselect/index.mdx
- **`MenuToolGroup` 无激活工具时把手回落到 `label` prop**。原版无激活工具时 `setLabel(labelTexts.join(', ') || ' ')` 回落到**字面量空格**（`oojs-ui-toolbars.js:2911`），把手空白；本工程回落到组件的 `label` prop，缺省同样渲染为空。空格占位在原版是「无工具可提示」的兜底，`label` 更稳（有激活工具提示需求时可直接配置）。
  > id：dev-menutoolgroup-label ｜ 组件：Toolbar ｜ 文档：components/toolbar/index.mdx
- **键盘通道前置 IME 合成守卫**。原版没有这层防御：合成期的确认 Enter 与选词方向键会驱动菜单开合、高亮移动、标签提交。本工程统一经 `utils` 的 `isComposingKeyEvent` 判定（`isComposing` 或 `keyCode === 229`——后者是 Windows 等环境合成期的通行上报方式），覆盖六个组件的 `onKeyDown`（Dropdown / ComboBoxInput / ButtonMenuSelectWidget / Select / SearchWidget / TagMultiselect）、`useMenuPopup` 的前缀跳转与 `prompt` 输入框（`dialogs/statics.tsx`）。`NumberInput` 是 `<input type="number">`、浏览器不对其运行 IME，故未加。**代价**：只有 ButtonMenuSelectWidget 有用例，其余各处的合成期行为无测试守护；Safari「`compositionend` 先于确认键 keydown、此时 `isComposing` 已为 false」的形态未覆盖（需自持合成状态，属启发式，待真机数据）。
  > id：dev-ime-guard ｜ 组件：Dropdown、ComboBoxInput、ButtonMenuSelectWidget、Select、SearchWidget、TagMultiselect ｜ 文档：guide/options.mdx
- **标签多选菜单的打开帧快照按「与快照比较」实现，首次编辑后不再回退全量**。原版 `MenuSelectWidget` 在打开时把 `previouslySelectedValue` 取为输入框当前值，并在**首次 keypress 时置 `null`**（`dist/oojs-ui.js:8770-8779`），此后 `showAll` 恒假；本工程按「当前输入 === 打开帧快照」比较，故把输入改回打开帧的值时又判为全量。目标行为（打开帧恒全量）两侧一致，回退分支本工程更宽松，属声明式派生过滤的取舍。原版过滤另有 100ms 防抖（`onInputEditHandler`，`:8539`），本工程逐键同步——最终状态一致，仅输入过程中的中间帧不同。
  > id：dev-open-frame-snapshot ｜ 组件：TagMultiselect ｜ 文档：无需（纯内部实现）
- **内建 26 个语种的语言包与 `ooui-react/locales/*` 子路径导出**。原版 npm 包虽附 `dist/i18n/*.json`（227 语种），但 JS 库运行时不加载它们——`OO.ui.msg` 缺省实现只内嵌构建期生成的英文表，官方文档要求宿主自行取 JSON 覆写 `OO.ui.msg`（MediaWiki 经 ResourceLoader 注入）。本工程把这层转译提前进库，语言集按**开源社区活跃度**（开发者规模与开源本地化社区活跃度）取前列语种，再与原版 `dist/i18n` 的既有译文取交集——**译文一律取自原版对应语种 JSON，不自行翻译**：`en` 为内建默认基线（始终参与产物，不经 Provider 的 `messages` 通道），另 25 个为可选语言包（`ar`/`bn`/`cs`/`de`/`es`/`fa`/`fr`/`he`/`hi`/`id`/`it`/`ja`/`ko`/`nl`/`pl`/`pt-br`/`ru`/`sv`/`th`/`tr`/`uk`/`vi`/`yue-hant`/`zh-hans`/`zh-hant`），宿主按需从子路径引入，互不牵连产物。上游本身缺译的键（`es`/`vi`/`id`/`hi`/`th`/`cs`/`sv`/`yue-hant` 的 `ooui-dialog-process-back`）由英文默认逐键兜底，故语言包类型为 Partial。`registerMessages`/`deferMsg`/`resolveMsg` 与声明式 `useMessage` 对应原版 `OO.ui.msg`/`deferMsg`/`resolveMsg` 的通道。
  > id：dev-locales ｜ 组件：全局 ｜ 文档：guide/configuration.mdx
- **受控值非法时一次性回写父级**（`useControlledValueNotify`，`src/hooks/value.ts`）。原版 `DropdownInputWidget`/`RadioSelectInputWidget` 的 `setValue` 对非法值回退到首个可选值并写回组件值；受控模式下该写回只能经回调交还父级，本工程据此在生效值与受控值不一致时经 `onChange` 回写一次（同一非法值只回写一次，父级未采纳不重派，受控值回到合法时解除闩锁），`useLayoutSelection` 共用同一守卫。
  > id：dev-controlled-writeback ｜ 组件：DropdownInput、RadioSelectInput、布局族 ｜ 文档：guide/controlled.mdx
- **`ProcessDialog` 的 `mode` 声明式初始过滤**。原版 `ActionSet.setMode` 之前会混显全部动作（首次 `setMode` 才过滤）；本工程传入 `mode` 即从首帧按 `actions[].modes` 过滤，未传时与两侧同混显。
  > id：dev-processdialog-mode ｜ 组件：ProcessDialog ｜ 文档：components/process-dialog/index.mdx
- **`getFocusableElements` 额外排除 `content-visibility:hidden` 子树**。原版 `OO.ui.isFocusableElement`（`oojs-ui.js:80-98`）的可见性兜底是「`$.expr.pseudos.visible`（rects 非空）且自身与祖先无 `visibility:hidden`」；`content-visibility:hidden` 的子元素 rects 仍非空（实测），故原版会把其中的元素判为可聚焦，但该形态下 `focus()` 静默失败、Tab 也不进入（实测），取到的是落空目标——Dialog 焦点陷阱、Popup 的 Tab 边界与布局自动聚焦都可能踩到。本工程在该兜底之上改用原生 `checkVisibility({visibilityProperty:true})`（同时覆盖 `display:none`/`content-visibility:hidden`/自身与祖先 `visibility:hidden`），把这类落空目标一并排除；不支持 `checkVisibility` 的旧浏览器回退到与原版等价的「rects 非空 + 祖先 visibility 遍历」——Firefox<106、Safari<17.4 同样无 `content-visibility`，形态本就不出现，仅 Chrome/Edge 85–104 支持后者而不支持前者，该窗口内即原版行为。支持面：Chrome/Edge 105+、Firefox 106+、Safari 17.4+（Baseline 2024-03）。候选集（CSS 选择器）另有既有差异：较原版 `findFocusable` 的候选集多含 `iframe`、不含 `object` 与 `area[href]`。
  > id：dev-focusable-content-visibility ｜ 组件：Dialog、Popup、布局族 ｜ 文档：无需（对调用方不可见）
- **`TagMultiselect` 键入添加的标签同步菜单选中态**。原版经输入框键入添加的标签不同步菜单选项的选中态（菜单里该项仍呈未选中），对该项的后续操作自相矛盾——点击会移除标签、菜单选中态却错乱。本工程菜单选中态恒由当前标签集派生（`selectedValues={currentValue}`），键入与经菜单添加的标签在菜单中呈现一致的选中态，切换语义随之自洽。代价仅是与原版的菜单选中显示不同，而原版的显示本身是失步缺陷（即上述矛盾）。
  > id：dev-tag-typed-menu-selected ｜ 组件：TagMultiselect、MenuTagMultiselect ｜ 文档：components/menu-tag-multiselect/index.mdx

### 等效替代

能力两边都有，只是实现形态、落点或通道不同，效果等价，不需要补做。这一节也兼作已对齐项的对应关系留档。

- **Popup 箭头的两处几何量运行时实测，wikimediaui 常量兜底**。原版两处都随主题自适应：占位量（原版 CSS `margin-{top,bottom,left,right}: 9px` 落在弹层根的 `anchored-{edge}` 类上，`oojs-ui-wikimediaui.css:1214-1233`）与箭头盒（`this.$anchor[0]['scroll'+sizeProp]`，`dist/oojs-ui.js:6584`，箭头盒自身 0×0、尺寸全来自伪元素边框溢出）。本工程在定位计算中实测：占位量取弹层根四边 computed margin 的最大者（每个 `anchored-{edge}` 类只给一边置值，且边类由上一轮定位结果渲染、翻转时 DOM 里仍是旧边，故不能按当前边读；取最大可同时回避这两点），箭头盒按当前轴读锚点元素的 `scrollWidth/scrollHeight`（仅在主题 CSS 生效——锚点盒被收为 0×0——时可信）；读不到时（anchored 类未挂的首帧、无主题样式的测试环境）按 wikimediaui 常量（9px/11px）兜底，类挂上后 ResizeObserver 的首轮回调触发重算即取到主题实测值。apex（6px/8px）由此自动生效，换第三方主题无需复测常量。已核对对齐的部分：`align` 五个取值的映射（`resolveAlign`）与带箭头/无箭头两种稳态、锚点腾挪的判定与方向，均与原版逐行一致——对照实测（wikimediaui 主题、锚点宽 80/160、`force-left`/`force-right`）两侧落点逐像素相同。**实测口径的残余风险**：①弹层根若被多边同时设 margin（第三方主题，或调用方经 `className` 传入 `margin-*`），最大值会与生效边不符——原版只受 CSS 盒模型自动生效的那一边影响；②「读到 0」与「类未挂」不可区分，均回落到 wikimediaui 常量，apex 首帧因此短暂按 9px 定位（类挂上后的一次重算即纠正）。
  > id：dev-popup-arrow-geometry ｜ 组件：Popup ｜ 文档：无需（纯内部实现）
- **`TabIndexedElement` 的 `setTabIndex(null)` 语义保留**。原版 `updateTabIndex` 对 `null` 移除整个 `tabindex` 与 `aria-disabled`（`oojs-ui.js:2127-2140`）——元素彻底不可聚焦（连 `.focus()` 编程聚焦、CSS `[tabindex]` 命中都不成立），与 `-1`（可编程聚焦、不入 Tab 序）是两种语义。本工程 `resolveTabIndex` 收 `number | null`：`null` 返回 `undefined` 即省略属性（disabled 不覆盖），其余与原版一致（disabled 覆盖显式值、缺省 0）。落点与原版 `$tabIndexed` 一致（Button 到锚点、输入类到 `input`、Dropdown 到 handle、ToggleSwitch/RadioSelect/TabSelect 到根）；`aria-disabled` 写在该元素上。细节差异：原版 `null` 时 `aria-disabled` 一并移除，本工程 `aria-disabled` 由各组件按 `disabled` 独立输出、不随 `tabIndex` 联动——`tabIndex=null` 且组件禁用时本工程仍输出 `aria-disabled`（语义正确，仅落点解耦）。`Select` 系列表根的「缺省不输出 tabindex」经此通道表达（见下条）。
  > id：dev-tabindex-null ｜ 组件：全局（TabIndexedElement 系） ｜ 文档：guide/basics.mdx
- **`Select` 列表根缺省不输出 `tabindex`**。原版 `SelectWidget` 非 `TabIndexedElement`，根无 `tabindex`、既不进 Tab 序也不可聚焦，`simulateLabelClick` 为空操作。本工程对齐此缺省：独立 `Select` 根不写 `tabindex`（经上条 `resolveTabIndex` 的 `null` 通道表达缺省——目标即「彻底不可聚焦」），键盘改选一律由 Dropdown/MenuSelect 等触发元素经 `focusOwnerRef` 驱动。内部组合（`MenuSelect` 等）同样不输出——原版 `MenuSelectWidget` 只混入 `ClippableElement`/`FloatableElement`（`dist/oojs-ui.js:8563-8564`）、根无 `tabindex`，且本工程没有任何编程聚焦菜单根的地方；需要编程聚焦的调用方经 `rest` 显式传值（显式传值时按 TabIndexedElement 语义解析，disabled 覆盖）。落点、`aria-activedescendant` 写回等其余行为与原版一致。**例外**：`OutlineSelect` 的原版类在 `SelectWidget` 之上额外混入 `TabIndexedElement`（根 `tabindex=0`、可聚焦），故本工程为其补回 `tabIndex` 缺省 0，不随本条收窄。
  > id：dev-select-tabindex ｜ 组件：Select ｜ 文档：components/select/index.mdx
- **MenuSelect 的上下翻转按预计算的两侧可用高判定**，原版是先定位再用 `isClippedVertically()` 测量（`MenuSelectWidget.toggle` 的 `flippedPositions` 分支，`dist/oojs-ui.js:8940-8957`）。判定时机不同（同下方 Popup / 工具栏面板两条的处理），翻转结果目标一致；两侧都放不下时取空间更大的一侧，对应原版比较钳后高度的分支。两侧可用高与钳高同源、同扣原版 `clip()` 的 7px buffer（`oojs-ui.js:5840`），与 `isClipped*` 的判定基准一致。滚动引起的变化不重判，与原版「seems like it would be annoying」的取舍一致。
  > id：dev-menuselect-flip ｜ 组件：MenuSelect ｜ 文档：无需（纯内部实现）
- **选项的高亮滚动只在就近可滚动容器内进行，不触达 window**。原版 `SelectWidget.scrollItemIntoView` 经 `OO.ui.Element.static.scrollIntoView`（`oojs-ui.js:7642`、`:1347`）计算就近可滚动容器的最小位移并只滚该容器；本工程 `scrollOptionIntoView`（`src/utils.ts`）同口径，但**就近容器落到文档根（`documentElement`）时不滚动**。起因是本工程菜单收起时面板停到屏外哨兵位（`OFFSCREEN_POSITION = -9999`），而 `Select` 的高亮 layout effect 在收起瞬间仍可能触发（`screenReaderMode` 期菜单保持渲染、`currentHighlighted` 变化即滚）——原生 `Element.scrollIntoView({block:'nearest'})` 会递归滚动含 window 在内的每层祖先，于是把整页拽到顶部（左侧下拉选完项跳顶的实测根因）。原版无此问题是靠两点：`toggle(false)` 走 `togglePositioning(false)` 清空内联定位（`oojs-ui.js:5259`），收起菜单仍留在锚点附近，文档级位移约等于 0；且其滚动本就是「只滚就近容器的计算位移」而非原生递归。本工程收起统一停到屏外，故在「就近容器为文档根」时收敛为不滚。**代价（取舍）**：独立 `Select` 若唯一可滚动祖先是页面本身，键盘导航到视口外的选项不再滚动页面跟随——但菜单场景永不需要滚页面（放得下的菜单选项恒可见、放不下的菜单自身即溢出滚动容器），故对库内浮层用法无损。
  > id：dev-select-scroll-into-view ｜ 组件：Select ｜ 文档：无需（纯内部实现）
- **ActionFieldLayout 用 `fieldInline` prop 声明输入区包装元素**（默认 `div`）。原版靠字段控件根元素的 tagName 自动判断 span 与 div，React 无法探测子组件的元素类型。
  > id：dev-fieldinline ｜ 组件：ActionFieldLayout ｜ 文档：components/action-field-layout/index.mdx
- **Popup 的自动翻转判定改按预计算的两侧空间比较**，原版是先定位再测量。判定时机不同，翻转结果目标一致。翻转空间与容器钳制同源（锚点就近滚动容器的可视边界，视口分支取 `clientWidth/Height` 并计入 viewportSpacing），并按原版 `clip()` 口径扣 7px buffer——原版翻转判定走 `isClipped*`，其可视矩形即此口径（`oojs-ui.js:5803-5844`）。
  > id：dev-popup-flip-precompute ｜ 组件：Popup ｜ 文档：无需（纯内部实现）
- **工具栏面板的对齐侧与「铺满容器」按预计算的可用空间判定**。原版 `PopupToolGroup.setActive` 逐个位置试渲染、用 `isClippedHorizontally()` 判定后再试下一个（先定位再测量），本工程按锚点两侧的可用宽（`resolvePanelSideSpaces`，以容器可视边界收口）与面板自然宽度一次选侧、必要时铺满容器。判定时机不同，落位目标一致。两处口径对齐原版的 `clip()` 判定基准：①可用宽扣 7px buffer；②居中侧按原版的**单侧口径**——原版 center 步骤以 `left` 定位（`computePosition().right` 为空），`getHorizontalAnchorEdge()` 恒落 `'left'`，`clip()` 向右扩展矩形后只检查右侧余量（`oojs-ui.js:5857-5861`），等价于 `2×(右余量) ≥ 面板宽`；锚点偏一侧时两侧余量不等，若按对称的「两侧取小者」口径会误判为放不下而跳到铺满（原版停在居中）。居中面板左缘越出容器左界时按原版把可用宽退化为整段可视跨距（`resolvePanelSideSpaces` 收面板宽，见其 JSDoc）。**未对齐的残余**：阈值口径——本工程以面板 `offsetWidth`（含边框）比较，原版比较 `clip()` 内的 `scrollWidth`（内边距盒）并叠加 `ceil`，边界上有 2px 量级差。
  > id：dev-panel-align-precompute ｜ 组件：Toolbar ｜ 文档：无需（纯内部实现）
- **菜单类与工具栏类浮层经 portal 定位**。原版 `FloatableElement` 基于 offsetParent 相对定位并计入 RTL 方向，工具组面板与弹出工具浮层原版挂在 `toolbar.$popups` 上。本工程一律用页面坐标定位，RTL 起始边对齐已对齐。portal 容器按「宿主 `OOUIProvider.getPortalContainer` → 弹窗子树内的该弹窗管理器根 → `document.body`」回落（后两级见「弹窗内容隔离」条），故 `$overlay` 配置已由 `getPortalContainer` 承接、弹窗内的浮层也回到了原版「浮层位于拥有它的窗口子树内」的形态，均不再是差异。**per-widget 粒度未恢复**：原版 `$overlay` 是每个浮层各自的配置（同一页面里不同浮层可指定不同 overlay），本工程的 `getPortalContainer` 是全局单通道，只能按宿主规则整体回落，无法为单个浮层指定不同的 portal 容器——有该需求的调用方须自行拆分 Provider 子树。
  > id：dev-float-portal ｜ 组件：全局（浮层族） ｜ 文档：guide/configuration.mdx
- **`Tool` 的可见文本从 `title` 剥离为 `label`**。原版 `Tool.updateTitle` 让 `title` 配置一键两职：既写入 `.oo-ui-tool-title` 槽作可见标题、又充当 tooltip。本工程按叶子数据项统一文本键（见 comparison-guide§4.5）拆为 `label`（可见文本，对齐 `ProcessDialog.actions` 等数据项）与 `title`（恒为 tooltip，对齐 `TitledElement`）；`narrowConfig` 的可见文本字段随之为 `label`（迁移时原 `narrowConfig.title` 的值应改传 `label`，`title` 现恒为 tooltip 通道），`MenuToolGroup` 把手合成与 `ListToolGroup` 的 More/Fewer 项均取 `label`。能力一致，只是承载从「一键兼两职」拆为两键。
  > id：dev-tool-label-title ｜ 组件：Toolbar ｜ 文档：components/toolbar/index.mdx
- **`ToolGroupTool` 的内嵌工具组以 React 元素给出**（`ToolProps.group`，如 `<ListToolGroup/>`），原版经 `groupConfig` 加 `ToolGroupToolFactory` 创建 list 组。工具组再嵌工具组的递归由组件树承担，不需要工厂注册；内嵌组的开合由它自己的把手承担（原版 `ToolGroupTool.onSelect` 因 `$link.remove()` 后 `findTargetTool` 只认 `.oo-ui-tool-link` 而不可达，等价）。工具位因此不再有链接，`title`/`icon`/`active`/`onSelect` 对 `group` 工具不生效（原版 `$link.remove()` 同样使前三者无效），只保留 `disabled`（同步为工具位的禁用态）。**外层组禁用在该工具位上的落点**：与常规工具一致落在工具位本身（渲染禁用外观），且按原版不下发给内嵌组——内嵌组内部的工具禁用由其自身数据决定，两条禁用通道互不串扰。
  > id：dev-toolgroup-tool-element ｜ 组件：Toolbar ｜ 文档：components/toolbar/index.mdx
- **ProcessDialog 用 `onAction` 异步回调编排动作**。替代原版 `getActionProcess` 的 `OO.ui.Process` 多步 `.next()` 链。两侧都只能靠步骤内部抛错提前结束——原版 `OO.ui.Process` 只有 `execute`/`createStep`/`first`/`next`，没有外部中止通道，本工程的单异步函数同样如此。差异只在编排形态（命令式 Process 链 vs 回调）。
  > id：dev-onaction ｜ 组件：ProcessDialog ｜ 文档：components/process-dialog/index.mdx
- **`OO.ui.ActionWidget`/`OO.ui.ActionSet`/`OO.ui.Error` 的能力内联在 `ProcessDialog`**。原版这三个类只服务 Dialog 体系：`ActionWidget` 是带 `action`/`modes` 的按钮，`ActionSet` 管 special 与 others 的分类以及 `setMode`/`setAbilities`，`OO.ui.Error` 描述可恢复性、警告与消息。本工程不提供独立类，改由 `ProcessDialog` 的 `actions` 数组承接：`ProcessDialogActionProps` 对应 `ActionWidget` 的 `action`/`label`/`flags`/`modes`/`disabled`/`pending`/`title`（渲染为 `Button` 加 `oo-ui-actionWidget` 类，`pending` 即其 PendingElement 能力），`visibleActions`/`safeAction`/`primaryAction`/`otherActions` 对应 `organize`/`setMode`，`disabledAction` 只承接 `setAbilities` 的单项禁用形态（原版 `setAbilities` 是按 action 名批量开关 abilities 的整体通道，本工程逐项 `disabled` 承接其在本体系中的实际用法），错误收为错误对象类型由错误面板渲染。
  > id：dev-actionset-inline ｜ 组件：ProcessDialog ｜ 文档：components/process-dialog/index.mdx
- **`OO.ui.OutlineControlsWidget` 的能力内联在 `BookletLayout`**。原版该类自述「目前只被 BookletLayout 使用」。本工程把三个移动按钮与 items 槽位内联在 outline 面板内，`oo-ui-outlineControlsWidget`/`-items`/`-movers` 三层类名与按钮禁用规则（原版 `onOutlineChange`）均已对齐，`outlineControlsExtra` 对应原版 GroupElement 的 `$group`。原版构造该控件时不传 `abilities`（BookletLayout 恒为 move 与 remove 全开），所以本工程不另设这个整体开关，按钮可用性按各选项自身的 `movable`/`removable` 逐项判定。
  > id：dev-outlinecontrols-inline ｜ 组件：BookletLayout ｜ 文档：components/booklet-layout/index.mdx
- **MenuSelect 无可见项时整个面板隐藏**（`oo-ui-menuSelectWidget-invisible`，主题规则 `display:none`，`oojs-ui-wikimediaui.css:1827`）。对齐原版 `updateItemVisibility` 的 `anyVisible` 判定——消费方（如 `MenuTagMultiselect`）按输入过滤后可能一个选项都不剩，原版此时不留一个空框。**判据不同**：原版逐项判定可见性（含分组标题与隐藏项），本工程按 `options.length === 0` —— 消费方传入的选项集即待渲染项、不含隐藏项，两种判据在当前调用方下等价；若将来有「选项存在但需隐藏」的形态须改判据。
  > id：dev-menuselect-invisible ｜ 组件：MenuSelect ｜ 文档：无需（纯内部实现）
- **SearchWidget 的结果列表不输出 `tabindex`**，与原版该元素一致（同上方 `Select` 条目的独立 `Select` 口径：原版 `SelectWidget` 根非 `TabIndexedElement`。本组件也没有任何编程聚焦列表的地方，故同样经 `resolveTabIndex` 的 `null` 通道表达缺省）。焦点归属已对齐：`aria-activedescendant` 经 `Select` 的 `focusOwnerRef`（对齐原版 `results.setFocusOwner(query.$input)`）落在查询框上，列表根不输出该属性；点击结果两侧都不改变焦点。
  > id：dev-searchwidget-tabindex ｜ 组件：SearchWidget ｜ 文档：无需（已对齐项留档）
- **菜单的键盘通道落在触发元素，而非原版的 document 监听**。原版 `SelectWidget`/`MenuSelectWidget` 在菜单展开期把 keydown 与 keypress 绑在 document（keypress 为**捕获**阶段，且对命中可打印字符无条件 `preventDefault` + `stopPropagation`，`dist/oojs-ui.js:7717-7718`）；`DropdownWidget` 还把绑定期提前到**聚焦期**（`onFocus` 里 `menu.toggleScreenReaderMode(true)`），于是收起态的方向键/Home/End/翻页与前缀跳转按 `SelectWidget` 的 `isVisible()` 为假分支直接改选（该模式内同时 `highlightItem`，故 `aria-activedescendant` 在隐藏菜单期照常写回触发元素）。本工程导航键由触发元素自身的 `onKeyDown` 处理（`useMenuPopup.consumeNavigationKey`），接管窗口由 `screenReaderMode` 入参决定、Dropdown 以聚焦态驱动，`MenuSelect` 的 `aria-activedescendant` 管理期同步扩展；菜单根不输出 `tabindex`（对齐原版根无 `tabindex`，见上条）、选项不可聚焦，焦点恒由触发器持有（`aria-activedescendant` 模式），不存在「焦点在菜单里」的时机。前缀跳转则确实绑在 document `keypress`（窗口同为展开期或聚焦期），但为**冒泡**阶段：命中可打印字符后 `preventDefault`（对齐原版命中后的无条件阻止默认，`:7716-7719`——空格不再滚动页面、不产生默认的文本插入动作）。原版绑在 document 的**捕获**相位并加 `stopPropagation`，该事件整个被拦在目标元素之前；本工程有意走冒泡（局部化更贴 React），故不照搬——**代价**是目标元素与祖先的 keypress 监听者仍会收到该事件；反向的可靠性也差一档：宿主若在触发元素或祖先上对 keypress 调 `stopPropagation`，本工程的前缀跳转会被废掉（原版捕获相位不受影响）。document 捕获相位**有意不走**：捕获是为了在输入框文本插入前抢先消费，本工程有输入框的组件原版即不启用该通道，无输入框组件的触发元素上没有可阻的原生插入行为，局部化更贴 React。**附加防御（原版无，属增强）**：各键盘分支与 keypress 前置 `isComposing` 守卫——IME 合成期的确认 Enter、选词方向键不再驱动开合/选定/导航。**BMSW 与 Dropdown 的收起态键盘语义本就不同、且各自照抄原版**：BMSW 未启用 screenReaderMode，收起态 ↑/↓ 不消费（交回默认滚动），仅 Enter/空格展开（原版 `ButtonWidget` 无方向键处理）；Dropdown 按原版 `DropdownWidget.onFocus` 在聚焦期以 screenReaderMode 直接改选。落点与阶段不同，键位效果一致。
  > id：dev-menu-key-on-trigger ｜ 组件：菜单触发族 ｜ 文档：无需（纯内部实现）
- **Dialog 焦点陷阱的已对齐部分**。Tab 闭环（focusTrap 类、focus 重定向、content `tabIndex=-1`）；`role='dialog'` 挂在 `.oo-ui-window` 根；关闭 teardown 后归还打开前的焦点（对应原版 `WindowManager.$returnFocusTo`）。带标题的 `ProcessDialog` 与 `MessageDialog` 已用 `aria-labelledby` 关联标题（对应原版 `Dialog.initialize` 的 `title.getElementId()`）。注意焦点集合口径：可聚焦元素经 `getFocusableElements` 判定——CSS 选择器之外补了原版 `findFocusable` 的「可见 + 未禁用」运行期兜底，并额外排除原版会放行的 `content-visibility:hidden` 子树（见「增强」的 `getFocusableElements` 条）。
  > id：dev-dialog-focus-trap ｜ 组件：Dialog ｜ 文档：无需（已对齐项留档）
- **Dialog 的滚动锁经 scrollLock 模块登记实现**。原版 `WindowManager.toggleGlobalEvents` 在 body data 上维护 `windowManagerGlobalEvents` 栈，并给 body 与 html 加 `oo-ui-windowManager-modal-active`（body `overflow: hidden`、html 非满屏 `scrollbar-gutter: stable`，类规则由主题 CSS 承接）。本工程每个 Dialog 自带 manager，没有共享容器承载这个栈，改为模块级登记表（`src/dialogs/scrollLock.ts`）按打开周期计数（`open || active`，对应原版 openWindow 上锁、teardown 完成解锁）。`modal-active-fullscreen` 变体取 Dialog 的 `full` 实态，与原版 `getSize() === 'full'` 等价，原版 `getSize()` 同样含窄屏视口判定（视口宽不足档位宽即返回 `'full'`）。另：原版该栈解锁走无条件的 `stack.pop()`（`dist/oojs-ui.js:25353`），多个管理器并存时关闭非最上层者会弹错条目——此后 `stack.some((w) => w.getSize() === 'full')` 与 `stackDepth` 判定都跟着失真；本工程按句柄登记，无乱序弹栈问题。
  > id：dev-scroll-lock ｜ 组件：Dialog ｜ 文档：无需（纯内部实现）
- **iOS 触摸滚动兜底（原版 `togglePreventIosScrolling`）照搬机制、收宽判定与范围**。原版（`dist/oojs-ui.js:25287-25315`）在 iOS 上给 body 与 html 一并加 `oo-ui-windowManager-ios-modal-ready`（主题规则 `height:100%;overflow:hidden`，两主题同款：把 overflow 直接落到 html、并收掉文档滚动高度——iOS Safari 不把 body 的 overflow 传播到视口，只加 `modal-active` 时背景仍能触摸滚动），并在**加类前**记住根滚动位置、**摘类后**还原（顺序不可颠倒：类生效期间文档高度被收掉，`scrollTop` 会被钳到 0、写不进去）。本工程同一套机制落在 `dialogs/scrollLock.ts`，三处替换/收宽：①触发判定由 UA 正则 `/ipad|iphone|ipod/i` 改为 `navigator.maxTouchPoints > 0`——原正则漏掉 iPadOS「请求桌面网站」的 `Macintosh` UA，而 iPad 恰是该缺陷的主要目标设备；桌面触摸屏设备因此也会命中，但命中后的行为只是「满屏弹窗期间锁住背景滚动、关闭时还原原位」，正是模态该做的。②施加范围由「只让最外层那个 manager 做事（`stackDepth !== 1` 直接返回，故**先开非满屏、后开满屏**时不加类——非满屏在外层挡住了后开的满屏弹窗）」改为「登记表内存在满屏且 ready 的弹窗」，该叠加场景同样锁住（此时背景由那个满屏弹窗完整遮住，收掉高度不可见）。③`getRootScrollableElement` 那份为 Chrome ≤60 写的特性探测（试探 `body.scrollTop`）由标准等价物 `document.scrollingElement` 承接。**时序两侧一致**：均在 ready 之后施加（此前 `oo-ui-window-active` 整体 `opacity: 0`，背景仍完全可见，提前收掉高度会让用户看到页面跳动）、关闭动作一开始就摘类；非满屏一律不加（非满屏时背景露在弹窗四周，跳动可见）也与原版一致。**验证缺口**：CI 与本地均无 iOS 设备，类落点/时序/位置还原由 `dialogs/scrollLock.node.test.ts` 与 Dialog 的用例锁定，但「该类在真机上确实拦住 iOS 的触摸滚动」须真机核对。
  > id：dev-ios-scroll ｜ 组件：Dialog ｜ 文档：无需（纯内部实现）
- **`Dialog` 恒受控：`open` 必填、不提供 `defaultOpen`（无非受控形态）**。原版经 `WindowManager.openWindow`/`closeWindow` 命令式开合，本工程收为受控 `open` prop，关闭意图经 `onEscape` 报出。与其余浮层的 `open`/`defaultOpen`/`onOpenChange` 三件套不同，弹窗生命周期通常由业务流程（提交/校验/多步动作）驱动，「自持开合态」的非受控形态无实际使用场景，故只保留受控通道。`Message.onClose` 是「点击关闭按钮」回调、非浮层开合态，不适用该约定。
  > id：dev-dialog-controlled ｜ 组件：Dialog 家族 ｜ 文档：guide/controlled.mdx
- **裸 `Dialog` 无内置标题**。调用方自行渲染标题并以 `aria-labelledby` 关联（`MessageDialog` 与 `ProcessDialog` 的内置标题已含该关联）。原版基类 `Dialog.initialize` 仍会建一个空的内部 title 槽位并自动挂上 `aria-labelledby`，本工程裸 `Dialog` 既无该槽位也不自动关联，标题 id 由调用方传入——**漏传即得无名 `role="dialog"`**（原版子类会自动关联，迁移时容易漏），用裸 `Dialog` 时务必自行建立该关联。
  > id：dev-dialog-aria-labelledby ｜ 组件：Dialog ｜ 文档：components/dialog/index.mdx
- **弹窗内容隔离（原版 `WindowManager.toggleIsolation`）的豁免名单被「浮层进管理器根」取代**。原版给管理器根路径以外的兄弟节点加 `aria-hidden` + `inert`，并排除 `getTeleportTarget()` 与 `getDefaultOverlay()`（`dist/oojs-ui.js:25377-25434`）——这两个容器在 MediaWiki 里与管理器根**平级**、承载弹窗内的浮层，不排除就会被一并 inert。本工程缺省的浮层 portal 目标就是 `document.body`（`$overlay` 缺省回落到控件自身 `$element` 的语义在 portal 化后丢失了），浮层与管理器根同层，那份豁免照搬不成立。改法是把弹窗子树内的浮层 portal 到该弹窗的 WindowManager 根（`hooks/portal.ts` 的 `PortalHostProvider`，`WindowManager` 用静止无裁剪的自身根元素承接）：浮层成为管理器根的**子节点**，逐个标记兄弟的逻辑天然碰不到它，无需任何登记表或属性豁免。管理器根在两个主题里都没有任何自身规则（只有 `.oo-ui-windowManager-modal > .oo-ui-dialog` 这类子选择器），故页面坐标绝对定位不受影响；该前提由 `theme-contract.node.test.ts` 的弹窗层值守卫与浮层portal用例共同看住。宿主自行配置 `getPortalContainer` 时恒优先，此时弹窗内浮层也改走该容器——**代价**是它不再随所属弹窗一起被隔离与层叠，责任交回宿主（见 `config.tsx` 的 `getPortalContainer` 注释）。该替代成立的前提是**弹窗子树内的浮层一律经 `hooks/portal.ts` 的 `useFloatPortal` 取容器**：绕开它直接 portal 到 body 的浮层会被隔离标记一并 inert，等价于原版未做 `$overlay` 豁免。
  > id：dev-isolation-portal ｜ 组件：Dialog ｜ 文档：components/dialog/index.mdx
- **内容隔离按登记表整体重算，且只保留最上层弹窗可见**。原版在一次 `toggleIsolation(true)` 里做一次性快照（`$ariaHidden`/`$inert` 两个集合），`false` 时只撤销自己那批。本工程改为与滚动锁同形的登记表（`dialogs/isolation.ts`）：每次登记/注销都按当前全部管理器差量重建，可见路径只取**DOM 顺序最后**（即叠放视觉最上层——portal 按挂载顺序追加，多个弹窗的层叠由管理器根在 body 中的先后决定，见「弹窗子树内浮层层值」条）那一个管理器的路径，其余（含下层弹窗的管理器根）一并标记。两处收益：叠加时下层弹窗（原版会被标记）与后关闭者（原版会把先开者的标记一并清掉且不恢复）在本工程都收敛正确——上层关闭后下层自动恢复可见；「关闭后重开」的弹窗在登记表排到末位而 DOM 位置未变，按 DOM 顺序判层使隔离判定与叠放视觉始终一致。`aria-hidden` 的被覆盖原值在标记开始时快照一次、跨重建持久（重建期「还原→重标」的反复快照会把 React 在标记期间改写的值当原值回写），节点退出标记集时才还原并移除；已在标记中的节点不重写，值被外部（React）改写时仅重申标记。
  > id：dev-isolation-registry ｜ 组件：Dialog ｜ 文档：components/dialog/index.mdx
- **弹窗子树内的浮层写入与弹窗同层的内联 `z-index`**。原版浮层落在窗口子树内，其 `z-index` 只在窗口内部比较（`.oo-ui-popupWidget` 的主题值仅 1）；本工程浮层 portal 到管理器根后是弹窗的**兄弟节点**，与 `.oo-ui-dialog` 的层值直接比较，`.oo-ui-popupWidget` 的 1 会被压到弹窗之下（`.oo-ui-menuSelectWidget` 与工具浮层是 4，靠“同层 + DOM 靠后”才压得住）。故弹窗子树内的浮层经 `hooks/portal.ts` 的 `DIALOG_FLOAT_Z_INDEX` 写入与主题中 `.oo-ui-windowManager-modal > .oo-ui-dialog` 相同的层值 4：相等 + portal 恒追加在弹窗之后即在其上，多个弹窗叠加时仍由管理器在 body 中的先后决定谁在上（层值更大反而会让下层弹窗的浮层盖住上层弹窗）。非弹窗内的浮层不写该值，层级交回主题 CSS；该层值与主题的一致性由 `theme-contract.node.test.ts` 守卫。
  > id：dev-dialog-float-zindex ｜ 组件：Dialog ｜ 文档：无需（纯内部实现）
- **工具栏窄栏类在浮层内的承接位置**。原版把 `oo-ui-toolbar-narrow` 加在工具栏根与 `$popups` 容器上（工具组面板与弹出工具浮层都在其中，主题的窄栏规则绝大部分为后代选择器）。本工程浮层 portal 至 body 后失去了这个祖先，工具组面板经一层窄栏载体 div 承接，弹出工具浮层则把该类落在浮层根上。承载元素不同，但「浮层内容存在含窄栏类的祖先」这一前提两侧一致（对照以祖先判定为断言）。另有一条同元素复合规则 `.oo-ui-toolbar-narrow.oo-ui-toolbar-popups { white-space: normal }` 未被承接——本工程载体不带 `oo-ui-toolbar-popups` 类，影响面限于该容器的 `white-space`，对纵向堆叠的面板无碍。
  > id：dev-narrow-in-float ｜ 组件：Toolbar ｜ 文档：无需（纯内部实现）
- **SelectFileInputWidget 的选择按钮根元素是 `<span>` 而非原版的 `<label>`**。原版把按钮根换成 `<label>`，借原生关联内含 file input。本工程沿用 Button 一律 `<span>`（内层 `<a class="oo-ui-buttonElement-button">`）的约定，点击开选择器由主题 CSS 的 file input 覆盖层承担；实测按钮中心的最上层元素两侧同为 `input[type=file]`，行为一致。差异后果有限：按钮失去与 file input 的原生 label 关联（原版同样被覆盖层拦截点击，可用性取决于主题 CSS 覆盖层，两侧一致），a11y 上少一条隐式关联（file input 自带原生语义，影响低）。
  > id：dev-selectfile-button-span ｜ 组件：SelectFileInputWidget ｜ 文档：无需（纯内部实现）
- **ButtonInput 的 `title` 落在真实 `button`/`input` 上**。原版 `ButtonInputWidget` 经 `InputWidget` 继承 `TitledElement`（`$titled` 即 `$input`，`dist/oojs-ui.js:10026-10028/10357`），title 落点、invisibleLabel 兜底与 accessKey 键位后缀原版均已具备。本工程把 `title` 接入 `resolveTitle`，落点相同（invisibleLabel 时以标签兜底、accessKey 附加键位后缀）——这是对齐而非增强，行为上与原版一致。
  > id：dev-buttoninput-title ｜ 组件：ButtonInput ｜ 文档：无需（已对齐项留档）
- **Dropdown 的 `title` 落在根元素**，原版 `DropdownWidget` 的 `$titled` 是内部的 `$label`。tooltip 位于控件子树内、可视结果一致，只是 DOM 落点不同。其余混入 TitledElement 的组件已按原版落点接入（见 comparison-guide.md「共享抽象」的 `resolveTitle` 条目）。
  > id：dev-dropdown-title ｜ 组件：Dropdown ｜ 文档：无需（已对齐项留档）
- **快捷键文案经宿主配置解析**（TitledElement + AccessKeyedElement 的通用能力，非工具栏专属）。原版 `formatTitleWithAccessKey` 优先取 `jquery.accessKeyLabel` 的 `getAccessKeyLabel`（MediaWiki 侧显示「Alt+Shift+k」一类本地化组合键）。本工程由宿主经 `OOUIProvider.getAccessKeyLabel` 提供等价解析（组件经 `useAccessKeyLabel` 读取）：未配置时按原版回落分支输出原键值（`title [k]`），解析器返回空串时按原版不加键位后缀；解析器返回 `undefined` 时本工程视为「解析无结果」同样回落原键值——原版此时不加后缀，此处为有意取舍（宿主解析不出修饰键文案时显示原键值比无后缀更可用）。
  > id：dev-accesskey-label ｜ 组件：全局 ｜ 文档：guide/configuration.mdx
- **Message 的 `notice` 类型不输出 `oo-ui-image-notice`**。原版按类型给图标加 `oo-ui-image-{type}`，本工程经 `imageVariantClasses` 只输出主题里存在的 image 变体位（notice 不在其中）。两个主题的 CSS 都没有该类规则，视觉等价。
  > id：dev-notice-image ｜ 组件：Message ｜ 文档：无需（对调用方不可见）
- **NumberInput 的 `allowInteger`/`isInteger` 一并收，等价于强制 `step=1`**。原版二者都是已废弃的兼容配置（`isInteger` 是 `allowInteger` 的别名），置位时覆盖显式 `step`。本工程同样支持这两个写法，置位时开发期告警一次提示迁移（原版静默采纳）。这里没有按 React 惯例另设现代命名（如 `integerOnly`）：它们是原版 API 的历史包袱，仅在此保留以维持迁移路径。
  > id：dev-allow-integer ｜ 组件：NumberInput ｜ 文档：components/number-input/index.mdx
- **标签让位的内边距取值口径不同**。本工程经 `useLabelPadding` 取标签元素的 `offsetWidth`（取整）再加 2px 间距写入 input 的内边距；原版 `positionLabel` 用标签的精确宽度与自身间距（实测标签内容宽约 135.7px 时，原版写 137.7px、本工程写 140px，差值 1–3px）。视觉等效。内边距落在 input 上、由 labelPosition 决定落在哪一侧，这一契约两侧一致。垂直滚动条出现时把滚动条宽度计入 after 标签同侧内边距的补偿（原版 `positionLabel` 的 `+ scrollWidth` 分支）已对齐。方向取侧是可更新的单一来源：根方向与滚动条宽度同批测量（`useScrollbarOffset`）并把结果交给 `useInputProps`，标签让位取侧与滚动条让位撤回判定取同一份方向、在同一测量周期同步更新——原版每次调 `positionLabel` 都重读方向，本工程以测量周期近似其求值时机。**该重读以测量为触发源**：方向翻转本身不触发测量，纯翻转（无尺寸/滚动条变化）不会重读，须伴随一次测量才生效（页面方向在会话内稳定，对照页切换方向时经 remount 重挂）。
  > id：dev-label-padding ｜ 组件：TextInput 系 ｜ 文档：无需（对调用方不可见）
- **Popup 的容器边界钳制已对齐，仅容器探测口径有细节差异**。钳制的取轴（above/below 沿水平轴、before/after 沿垂直轴）、`containerPadding` 内缩、钳制位移计入箭头偏移反算均与原版 `computePosition` 一致；视口分支取 `documentElement.clientWidth/Height`（不含滚动条）并计入 viewportSpacing（对齐原版 `oojs-ui.js:6602-6610` 的 container 钳制分支）。差异只在就近滚动容器的探测：原版 `getClosestScrollableContainer` 只认 `auto`/`scroll`、可按轴查询、父元素为 `<body>` 且可滚时返回 root scrollable element、未命中回落 root scrollable element；本工程 `findScrollableContainer` 同样只认 `auto`/`scroll`（曾一度多认 `overlay`，该值非标准且已废弃——Blink 归一化为 `auto`、Firefox 从未支持，computed 值不返回该字面量，故已移除，不再作为「兼容位」保留）、恒查两轴、未命中回落 `document.documentElement`。另有一处有意取舍：原版从**弹层自身**回溯容器，本工程浮层 portal 出控件子树（落到 `document.body` 或弹窗的管理器根），从浮层自身回溯只会得到视口、丢掉弹窗 body 这类局部滚动容器，故改从**锚点**回溯。
  > id：dev-popup-container-probe ｜ 组件：Popup ｜ 文档：无需（纯内部实现）
- **MessageDialog 的竖向动作布局经 React 状态切换**。判定条件（先按横向量 `scrollWidth > clientWidth`）、类名与 body 底部让位值（foot 实测高）与原版 `fitActions` 一致；形态差异是本工程经 ResizeObserver + ready 兜底触发（原版在 `setDimensions` 里命令式 toggle 并延时 300ms 重跑），且首帧即带 `-actions-horizontal` 类（原版首次 `fitActions` 前容器无布局类；该帧处于 ready 之前——`oo-ui-window-active` 施加前窗口整体不可见，故不可观察）。让位通道开在 `Dialog` 的 `bodyFitFoot` 上，因原版 `ProcessDialog.setDimensions` 也写同一句。原版另有 `getBodyHeight` 覆写（临改 overflow 后用 `text.outerHeight(true)` 量高）配合这轮测量，本工程由 `Dialog.measureContentHeight`（frame 钳 0 后取 head/body/foot 的 `scrollHeight`）等效承担。
  > id：dev-messagedialog-vertical ｜ 组件：MessageDialog ｜ 文档：无需（纯内部实现）
- **工具快捷键文案经 `ToolProps.accelerator` 给出**。原版由宿主覆写 `Toolbar.getToolAccelerator(name)`（`dist/oojs-ui-toolbars.js`），`Tool.updateTitle` 把标题与加速键按各组 `titleTooltips`/`accelTooltips`（Bar 组两者皆 true）拼进 tooltip、并把加速键写入 `$accel` 槽位；本工程把加速键作为工具的声明式字段，同样写入 `oo-ui-tool-accel` 槽位、同样按「Bar 组拼 tooltip、其余组不拼」处理。取值通道不同，DOM 与 tooltip 结果一致。**移动端不做隐藏**：原版 `Tool` 构造期有 `if (!OO.ui.isMobile()) { this.$link.append(this.$accel); }` 的移动端分支（`dist/oojs-ui.js:21397-21401`），但上一句 `.append(..., this.$accel)`（`:21392-21395`）已无条件把该槽位挂进链接，jQuery 对已在位节点是移动而非新增，**该分支在原版自身即不生效**——故本工程无条件渲染快捷键文案与原版的**实际行为**一致，不是漏记的移动端差异。
  > id：dev-tool-accelerator ｜ 组件：Toolbar ｜ 文档：components/toolbar/index.mdx
- **选项族选中/按压态的图标着色由组件按状态输出变体类**。原版 wikimediaui 主题在 `getElementClasses` 里对非禁用的选中或按压 MenuOptionWidget/OutlineOptionWidget 加 `oo-ui-image-progressive`，经 `Theme.updateElementClasses` 落在 `$icon`/`$indicator` 上；本工程由 `getOptionIconClasses` 算出该类、经 `DecoratedOption` 的 `variantClasses` 透传给 ButtonSlots（同样落 icon 与 indicator）。条件与落点一致，差异只在求值时机（声明式类名 vs 主题 JS 钩子）。**该规则是 wikimediaui 专属**：apex 主题的原版不输出该状态变体（本工程两主题共用同一贡献器，apex 下会多出 progressive 着色，属已知偏差，换第三方主题同此）。ButtonOption 仍走按钮的「激活或禁用反色」规则（ButtonOptionWidget 继承 OptionWidget、不落上述 progressive 状态分支），MenuSectionOption 只按 `flags` 着色。
  > id：dev-option-variant-classes ｜ 组件：选项族 ｜ 文档：无需（纯内部实现）
- **选项 `flags` 的变体落点按选项形态分两类**。原版主题对 `hasFlag()` 命中的选项写 `oo-ui-image-{progressive,destructive,error,warning,success,invert}`（对 `$icon`/`$indicator`），同时 FlaggedElement 会给根元素加 `oo-ui-flaggedElement-*`。**非按钮选项**（MenuOption/OutlineOption/MenuSectionOption）：两主题都没有选项作用域的 `oo-ui-flaggedElement-*` 规则、`-invert` 变体类更是不存在，故本工程只输出有主题规则的 image 变体，不输出根类（同 Button 不再输出 `oo-ui-buttonElement-size-medium` 的处理）；禁用项整组不输出（对齐主题只在 `!isDisabled()` 分支写变体）。**ButtonOption 例外**：其根是 `oo-ui-buttonElement-framed` 形态，wikimediaui 主题的**按钮作用域** flagged 规则按根类命中（`.oo-ui-buttonElement-framed.oo-ui-flaggedElement-progressive > .oo-ui-buttonElement-button`，`oojs-ui-wikimediaui.css:349`）给按钮底色/边框，故 `flags` 同时交给 `buttonElementClasses` 输出 `oo-ui-flaggedElement-*` 根类（对齐原版 FlaggedElement 的根类行为，不受禁用门控）与图标变体。
  > id：dev-option-flag-variants ｜ 组件：选项族 ｜ 文档：无需（纯内部实现）
- **TagMultiselect 的合法性经回调报出而非 `getValue` 过滤**。原版 `getValue()` 返回合法子集（命令式读取）。本工程的受控 `value` 是标签集合本身（`allowDisplayInvalidTags` 开启时含非法项），非法子集改经 `onInvalidTagsChange` 派生报出，以免「用过滤结果回写 value 会丢非法标签」；需要「只取合法子集」时使用导出的纯函数 `pickValidTags`（与组件内部合法性判定同一套规则）。与原版 `valid` 事件/`getValue` 的其余口径差异：①派发时机对齐原版 `toggleValid` 的变化守卫（内容变化才派发、首个渲染不派发、父级未采纳不重派）；②widget 级非法（输入框有未提交文本）不经该回调报出——原版同样只把「标签合法性」放进 `valid` 事件，widget 级非法由根元素的 invalid 标志类表达，两版一致；③`allowDisplayInvalidTags` 只把关组件自身的添加路径（输入提交/菜单选定/粘贴），受控传入的非法值照常渲染——这是受控契约的必然（组件不裁剪调用方数据），原版的 `createItemWidget` 阶段拦截只覆盖命令式 `addTag`，受控形态无对应物。
  > id：dev-tag-valid-callback ｜ 组件：TagMultiselect ｜ 文档：components/tag-multiselect/index.mdx
- **标签的显示内容与过滤/回填文本拆为 `label` + `labelText`**。原版 `label` 单键承载富内容（`jQuery|string|HtmlSnippet`），过滤与匹配经 `OptionWidget.getMatchText`（`typeof label === 'string' ? label : this.$label.text()`）从渲染结果取纯文本——富标签与前缀过滤天然并存。本工程 `TagOptionProps.label` 收 `ReactNode`（对齐富内容），但 React 无法从未挂载的 `ReactNode` 取纯文本，故把纯文本轴另开为 `labelText?: string`，供菜单前缀过滤键与「选中/编辑标签时回填输入框」两处使用；`label` 为字符串时缺省即取，富内容时须显式给 `labelText`——未给时该选项**不参与前缀过滤**（按 `String(value)` 过滤会把「苹果」筛成「3」，属错误行为）并开发期告警一次，回填输入框仍以 `String(value)` 兜底（见 comparison-guide§4.5、`tagMatchText`）。能力两侧一致，只是原版的「一键 + 运行期取渲染文本」在声明式下拆成「显示键 + 纯文本键」。
  > id：dev-tag-label-labeltext ｜ 组件：TagMultiselect ｜ 文档：guide/options.mdx
- **标签的身份与负载拆为 `value` + `data`**。原版把二者合一：`{data,label}` 的 `data` 既是标签身份、又可为任意对象，`getValue()` 直接回传 data 数组。本工程为守住受控数组的可序列化/可比对性，把身份收窄为标量 `value`（`onChange`/拖拽/非法值判定都按它比较），另在 `TagOptionProps.data?: unknown` 上开放任意负载随行——它不参与受控值与相等判定、本组件不消费，`onChange` 仍回传标量 `value`，调用方按 `value` 在自己的 `options` 数组里反查取回对象。能力（为标签关联对象）经这一拆一补等价恢复，只是形态从「data 即值」变为「value 定身份、data 携带负载」。
  > id：dev-tag-value-data ｜ 组件：TagMultiselect ｜ 文档：guide/options.mdx；components/tag-multiselect/index.mdx
- **标签多选的菜单焦点归属按原版落到 `$tabIndexed` 对应元素**。原版 `TagMultiselectWidget` 建菜单时传 `widget: this`，`MenuSelectWidget` 据此 `setFocusOwner(this.$tabIndexed)`——有输入框即输入框、`inputPosition='none'` 即焦点陷阱；本工程经 `Select.focusOwnerRef` 落到同一元素（与 Dropdown/ComboBoxInput 同通道）。ARIA 角色与原版一致地**不做声明**：原版只在 DropdownWidget/ComboBoxInputWidget/LookupElement 三处声明 `role='combobox'`，标签多选的输入框是隐式 `textbox`（菜单仍是 `role=listbox` + `aria-multiselectable`）。`aria-activedescendant` 在 `textbox` 上合法，但不如标准 combobox 模式（配 `aria-expanded`/`aria-controls`）完整——这是原版取舍，若要更标准应作为「增强」另行评估。**`aria-owns` 已对齐**：焦点归属元素在菜单展开期写 `aria-owns` 指向菜单 id、收起移除（对齐原版 `MenuSelectWidget.onToggle` 的写/移除稳态，与 Dropdown/ComboBoxInput/ButtonMenuSelectWidget 同口径；菜单 portal 至 body、非 DOM 后代，须显式关联）。菜单展开时会自动高亮首个可选项（`allowArbitrary` 时不自动高亮），落点与原版一致：原版开启时 `updateItemVisibility` 的 `showAll` 分支显示全部选项，随后 `highlightOnFilter` 分支因无高亮项取首个可选项（本工程对应「刚打开」时机置首个可选值）；选定后输入清空时高亮保留在已选定的那一项（原版条件为「当前无高亮的可选项才改写」，两版一致）。
  > id：dev-tag-menu-focus ｜ 组件：TagMultiselect ｜ 文档：无需（纯内部实现）
- **标签让位的内边距落侧按根元素方向**。原版 `positionLabel` 以根元素的 computed direction 决定物理落侧（before 到行首、after 到行尾，故 RTL 与 LTR 相反）；本工程同样把该方向经 `rootRef` 传入 `useInputProps`（读**组件根元素**，不是输入元素自身的 `dir`），标签让位与「滚动条宽度并入 after 同侧」共用同一方向来源。而「滚动条让位偏移侧」（见「增强」节）按**输入元素自身**方向判定，且仅当其与本条的根方向一致时才施加让位——方向分叉时撤回偏移，故二者不会把浮动元素同时推向不同侧（分叉下无滚条补偿，属正确稳态）。求值时机上，原版每次调 `positionLabel`（元素 attach、`updatePosition`、滚动条分支）都重读方向；本工程方向为可更新的单一来源（测量方测得后交给消费方，消费方不自读，见「标签让位的内边距取值口径」条），运行时方向切换须伴随一次测量（尺寸/滚动条变化）才被重读，让位/撤回判定届时同步更新。
  > id：dev-label-padding-side ｜ 组件：TextInput 系 ｜ 文档：无需（纯内部实现）
- **`RadioSelectInput` 的隐藏 input 带 `readOnly` 标记**。原版 `$input` 以 `oo-ui-element-hidden` 类隐藏、值经命令式 `setValue` 写入，无只读属性；本工程 input 的值是受控 `value` 且无 `onChange` 通道（改动只经内层 RadioSelect 发生），React 开发期会以「受控字段无 onChange」告警，故标注 `readOnly` 屏蔽。readonly 字段照常参与表单提交（禁用不参与，已由 `disabled` 承接），元素本身被类裁剪不可交互，无行为差异。
  > id：dev-radioselectinput-readonly ｜ 组件：RadioSelectInput ｜ 文档：无需（对调用方不可见）
- **`ButtonInput` 的 `useInputTag` 形态 input 带 `readOnly` 标记**。原版 `ButtonInputWidget.getInputElement` 创建的 input 无 readonly（`oojs-ui.js:10378-10381`，其值由 `setValue` 命令式写入）；本工程受控 input 无独立的 `onChange` 提交通道，标注 `readOnly` 屏蔽 React 的「受控字段无 onChange」告警。readonly 字段照常参与表单提交（对齐原版 button 形态的提交行为），标签 `<a>` 遮盖了 input 的交互面，无行为差异。
  > id：dev-buttoninput-readonly ｜ 组件：ButtonInput ｜ 文档：无需（对调用方不可见）
- **`FieldLayout` 的字段包装元素恒为 `<span>`**。原版 `FieldLayout` 按字段的 inline 探测取元素：`this.$field = this.isFieldInline() ? $('<span>') : $('<div>')`（`oojs-ui.js:12982`），本工程无子组件元素类型探测通道，恒渲染 `<span>`。主题 CSS 对 `.oo-ui-fieldLayout-field` 归一 display，span 与 div 的布局结果一致，无视觉后果；原版的 `div` 只在「字段控件自带块级盒」的边角场景下与 span 有文档级语义差异。（同因的 `align='inline'` 降级校验舍弃见「舍弃」节。）
  > id：dev-fieldlayout-span ｜ 组件：FieldLayout ｜ 文档：无需（对调用方不可见）
- **Select 系选项的选中态统一用基类 `OptionProps.selected`**，Radio 与 Checkbox 型选项在内层原生控件上再映射为 `checked`。原版各 OptionWidget 均经 `setSelected` 维护选中态、内层原生控件同步其状态（无 `setChecked` 这类 API）；本工程认为选中语义相同，不对外暴露多种命名。
  > id：dev-option-selected ｜ 组件：选项族 ｜ 文档：无需（已对齐项留档）
- **布局组件的受控 API 统一为 `value`/`defaultValue`/`onChange`**（`StackLayout`、`IndexLayout`、`BookletLayout`）。原版经 `setItem`/`setPage`/`setTabPanel` 等 setter 命令式切换。三者的失效补选均经共用的 `useLayoutSelection`（回退策略分别对齐各自对应的原版实现，见「增强」的布局补选条）。
  > id：dev-layout-controlled-api ｜ 组件：StackLayout、IndexLayout、BookletLayout ｜ 文档：guide/controlled.mdx
- **浮层的「外点关闭 / Escape 关闭」统一收在 `useDismissablePopover`**。原版这些监听散在各浮层类（`MenuSelectWidget`/`PopupWidget` 等的 document mousedown/click 与 keydown；`PopupToolGroup` 只有外点、无 Escape），本工程收敛为一个 hook：`dismissOnClick` 两档分别对应菜单类与弹层类，Escape 在捕获阶段处理并 `stopPropagation`（嵌套浮层只关最内层）。其中工具栏面板的 Escape 收起是原版没有的，单列在「增强」节。
  > id：dev-dismiss-hook ｜ 组件：浮层族 ｜ 文档：无需（纯内部实现）
- **`BookletLayout` 的 `onMoveOption`/`onRemoveOption` 承接原版的 move / remove 事件**。原版经 `editable` 控件的 `move`/`remove` 事件通知宿主改数据，本工程改为回调（`direction` 为 -1/1），options 由调用方更新。
  > id：dev-booklet-move-remove ｜ 组件：BookletLayout ｜ 文档：components/booklet-layout/index.mdx
- **`FieldLayout` 的字段 accessKey 登记经 `useFieldAccessKey`**。原版 `FieldLayout` 覆写 `formatTitleWithAccessKey` 委托字段控件、把字段键位后缀并入 label 的 tooltip；本工程由字段控件经 `registerAccessKey` 登记，label 侧同样拼出 `Title [k]`。
  > id：dev-field-accesskey ｜ 组件：FieldLayout ｜ 文档：无需（已对齐项留档）

### 暂未实现

原版有、本工程也认可其价值，但当前没做（含只做了简化版）。**当前为空**。
