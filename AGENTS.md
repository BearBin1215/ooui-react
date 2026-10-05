# AGENTS.md

## 项目性质

以 React 重新实现[OOUI（oojs-ui）](https://www.mediawiki.org/wiki/OOUI)，计划产出组件库ooui-react。使用TypeScript开发，调用方直接使用oojs-ui的样式，本工程无组件样式。

项目结构、常用命令见[CONTRIBUTING.md](./CONTRIBUTING.md)。

## 行为准则

- **不乱判断，拒绝猜测性编码**：
  - 遇到原版实现和 React 最佳实践冲突的地方，提出方案让用户选择。
  - 遇到原版存在的缺陷，提出处理方案，让用户决定是否处理、如何处理。
  - 如果原版实现有更优方案，分析优劣、告知用户。
- **不遵循最小修改原则，积极重构**：
  - 修改模块时将其作为一个整体进行修改，不要只纯粹打补丁。
  - 涉及多模块变更时，综合考虑全局，不要为了少修改而拒绝更优方案。
- **多权衡，多质疑**：
  - 除非要求明确，否则不将现有实现视为绝对正确，发现更优方案时让用户决定。
  - 不死守文档，实践中发现错误时修改，告知用户。

## 核心约定

- **不自带 CSS**：依赖原版 OOUI 样式，组件只负责输出与原版 CSS 契约一致的 DOM 结构、类名（`oo-ui-*`）和 aria 属性。改类名前须核对原版对应 mixin/主题选择器。
- **对照开发**：所有有交互的组件都要与本地安装的原版 OOUI 在playground中做行为对照，确保交互语义（键盘、焦点、a11y、边界值）一致。原版未压缩源码在 `node_modules/.pnpm/oojs-ui@<版本>/node_modules/oojs-ui/dist/oojs-ui.js`。
  - 对照开发流程见 `dev-docs/comparison-guide.md`
- **体积敏感**：本组件库多数使用场景较为重视产物体积，实现成本高、价值过低的功能应和用户确认是否实现。

## 代码规范

### TS

- 公共导出面（`src/index.ts`）只含消费者直接使用的组件与类型，组件与类型合并为一条 `export`，类型经内联 `type` 标记。对齐原版类层级的中间件（`Widget`、各种`Option`等）不导出，仅供组件内部经相对路径引用。
- 声明式而非命令式：原版命令式 setter/事件（`setValue`/`setDisabled`/`setPage`…）在本工程统一收为受控 props（`value`/`defaultValue`/`onChange` 等）。原版的可变全局配置收敛到 `OOUIProvider`。
- 跨组件重复逻辑一律收敛，**不得按组件手抄**同类交互（按键前缀跳转、相对导航、按压态、浮层关闭、菜单开合、选项过滤等原版共享基类方法在本工程都有对应共享 hook/纯函数）。收敛层的锚点目录：
  - **`src/hooks/`**——跨组件共享 hook（barrel `src/hooks/index.ts` 按能力域组织）。
  - **`src/utils.ts`**——纯函数工具（相对定位、前缀匹配、选项集、可聚焦元素等）；`clamp`/`omit`/`debounce` 等通用工具取自 `es-toolkit`，不要手写。
  - **`src/mixins.ts`**——对齐 `OO.ui.mixin` 的类名贡献 / 元素级状态解析纯函数层。

  各 hook/纯函数的逐一职责与契约见 `dev-docs/comparison-guide.md`「共享抽象」节，新增或改动组件前先查是否已有对应实现。

### 命名

- 公开组件名对齐原版类名并去除 `Widget` 后缀（`ButtonWidget`→`Button`）；去后缀后名字不成立的保留原样，现有四例：`SearchWidget`、`HiddenInputWidget`、`SelectFileInputWidget`、`ButtonMenuSelectWidget`。
- Props 类型名 = 组件名 + `Props`；选项类型名 = 所属组件名 + `OptionProps`（如 `DropdownOptionProps`、`TagOptionProps`），组件间复用允许类型别名，以组件自身命名为正式名。
- 浮层类组件的开合通道统一为 `open` / `defaultOpen` / `onOpenChange`，不要另造 `onClose`（仅关闭语义）/`onOpen`/`onToggle`（`Message.onClose` 是「点击关闭按钮」回调，非浮层打开态，不在此列）。**例外**：Dialog 家族为受控only。
- 组件的内部组合通道（如 `indicatorOverride`/`widgetNames`/`focusOwnerRef`）以 `XxxInternalProps` 内部类型承载，经相对路径引用，不进公开导出面。

### 注释

- 工具函数要有对应的jsdoc注释：顶部放功能概述，复杂逻辑需要行间注释。
- 会反复多次使用的变量，通用组件、组件参数、接口的每个属性都应有对应的jsdoc注释。
- 更改实现后不要注释说明曾经是什么样、如何取舍，只说明最新代码，除非要提醒开发者不要使用废弃方案。
- 修复问题不要修一行注释一行，与前后文作为整体，参考上述约定写注释。
- 如果需要引用原版 oojs-ui 的实现，写明出处（类名 + `dist` 文件名:行号），出处在同一函数内只写一次；断言的靶心规则见 `dev-docs/comparison-guide.md`「渲染契约的靶心」节。
- 面向消费方的 jsdoc 注释（组件顶部的概述，组件参数定义）写英文、中文双语，与文档保持一致：
  - 英文在前、中文在后，各占一段。
  - 组件顶部概述对应文档序言，参数注释对应文档 API 章节。
  - 概述尾部附带 `@see` 指向文档链接。

### 文档

见[CONTRIBUTING.md](./CONTRIBUTING.md)。

## 代码审查和修复

- 需要审查变量、接口、参数命名是否对齐原版或符合React最佳实践。
- 全量代码审查时，应当额外检查是否有实现理念、接口设计互相矛盾的代码。
