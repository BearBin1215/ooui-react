# 贡献指南

欢迎各路认识参与本组件库的完善，也欢迎提出建议。

## 环境准备

- Node.js >= 22.18.0
- pnpm 11（版本见 `package.json` 的 `packageManager` 字段）

## 项目结构

```
ooui-react/
├─ src/                     # 组件库源码（发布物）
│  ├─ widgets/              # 控件（Button/Dropdown/NumberInput…）
│  ├─ layouts/              # 布局（PanelLayout/BookletLayout…）
│  ├─ dialogs/              # 弹窗（Dialog/MessageDialog/WindowManager）
│  ├─ toolbars/             # 工具栏（Toolbar/各ToolGroup/Tool）
│  ├─ locales/              # 语言包（en为内建英文默认基线，始终参与产物）
│  ├─ testing/              # 测试共享工具（仅测试引用，不进导出面与产物）
│  ├─ hooks/                # 共享hook，按能力域拆分
│  ├─ Element.ts            # 元素mixin的契约类型（仅类型，无渲染组件）
│  ├─ mixins.ts             # 对齐OO.ui.mixin的纯函数层（类名贡献/元素级状态解析）
│  ├─ utils.ts              # 共享工具（选择集/DOM工具/常量/ChangeHandler）
│  ├─ i18n.ts               # 消息契约（消息键/值类型、msg系列）
│  ├─ config.tsx            # OOUIProvider与全局配置hook
│  └─ index.ts              # 导出面
├─ playground/              # 本地演示工程
├─ dev-docs/                     # 开发文档（对照指南、差异记录、待办等；不进产物）
├─ docs/                    # 文档站工程（Rspress）
│  ├─ zh/                   # 中文文档（默认）
│  └─ en/                   # 英文文档
├─ vite.config.ts           # 开发服务器配置（root指向playground，ooui-react别名指向src）
├─ vitest.config.ts         # 测试配置
├─ vitest.browser-setup.ts  # browser测试组全局设置
├─ tsdown.config.ts         # 组件库构建配置（产物到dist）
└─ pnpm-workspace.yaml      # workspace成员声明（根包与docs）
```

## 常用命令

```bash
pnpm install    # 安装依赖
pnpm dev        # 启动 playground 对照工程
pnpm docs:dev   # 启动文档站开发服务器
pnpm docs:build # 构建文档站产物（输出到 docs/build）
pnpm build      # 构建组件库产物（tsdown → dist）
pnpm test       # 单元测试（分 node / browser 两组）
pnpm typecheck  # 类型检查
pnpm lint       # oxlint 静态检查
pnpm format     # oxfmt 格式化
```

## 注释和文档

docs/ 目录为本工程的文档工程，基于 Rspress 构建，托管到 GitHub Pages。

消费方可见的 jsdoc 注释包括组件概述、参数定义等，组件概述对应文档页面序言、参数定义对应文档页面的 API 章节。这部分内容需要对应，保持中英双语。

文档编写原则如下：

- **面向消费端**：除了特定面向开发者的页面或章节，不过度描述实现细节和原理。
- **写明差异（双层契约）**：与原版的差异全量记入 `dev-docs/DEVIATIONS.md`（维护者台账）。文档站只承载消费方可感知的子集，只写「现象 + 迁移动作」。
  - 单组件差异写进组件页，跨组件差异写进 OOUI 对照页，一个差异的展开叙述在消费方侧只出现一次。
  - 文档侧差异内容行尾加 `{/* deviations: <id> */}` 标记，与台账元数据经 `src/docs-contract.node.test.ts` 双向校验。
- **中英双语**：同步修改两种语言。
- **组件序言**：以一两句功能定位与适用场景为度，变体多的组件可列举变体与关键差异（参考 Dialog 页），非显而易见的使用前提与契约可保留。不写实现原理、不复述 API。

## 测试

测试文件与源码同目录，如 `src/widgets/Button/index.test.tsx`。

按文件名分组：

- `*.node.test.ts` → node 组
- 其余 `*.test.tsx` → browser 组

绝大多数测试都属于 browser 组。只有当测试需要「每个用例都拿到一份全新的模块副本」，或要「替换掉 `document` 这类浏览器全局对象」时，才改用 `.node.test.ts` 命名。

通过 `pnpm test:node` 或 `pnpm test:browser` 跑单组测试。

`src/testing` 提供复用工具工具函数，封装取根元素、模拟点击 / 按键等常用操作。

## 发布

本地 `pnpm release` 选择版本会携带 `v*` tag 推送到远程，触发 GitHub Actions 构建，通过 OIDC 发布到 npm。

tag 流程仅用于稳定版本；预发布版本会顶掉 `latest`，需本地手动发布并显式指定 dist-tag（如 `npm publish --tag rc`）。
