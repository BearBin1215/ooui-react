<div  align="center"><img src="https://bearbin1215.github.io/ooui-react/logo.svg" width="180" alt="ooui-react logo"></div>

<h1 align="center">ooui-react</h1>
<p align="center"><a href="https://github.com/wikimedia/oojs-ui">OOUI</a> 组件库的 <a href="https://react.dev/">React</a> 实现。</p>
<p align="center">
  <a href="https://www.npmjs.com/package/ooui-react" target="_blank" rel="noopener noreferrer"><img src="https://img.shields.io/npm/v/ooui-react?style=flat-square" alt="npm" /></a>
  <a href="https://react.dev" target="_blank" rel="noopener noreferrer"><img src="https://img.shields.io/badge/React-18+-61DAFB?style=flat-square&logo=react&logoColor=black" alt="React" /></a>
  <a href="https://www.typescriptlang.org" target="_blank" rel="noopener noreferrer"><img src="https://img.shields.io/badge/TypeScript-6-3178C6?style=flat-square&logo=typescript&logoColor=white" alt="TypeScript" /></a>
  <a href="https://bearbin1215.github.io/ooui-react/" target="_blank" rel="noopener noreferrer"><img src="https://img.shields.io/badge/Docs-在线文档-blue?style=flat-square" alt="在线文档" /></a>
  <a href="https://github.com/BearBin1215/ooui-react/blob/main/LICENSE" target="_blank"><img src="https://img.shields.io/github/license/BearBin1215/ooui-react?style=flat-square" alt="License"></a>
</p>
<p align="center">简体中文 | <a href="https://github.com/BearBin1215/ooui-react/blob/main/README.en.md">English</a></p>

## 特性

- **不自带样式**：输出的 DOM 结构、类名、属性与原版一致，样式由调用方从 OOUI 引入，适配 MediaWiki 站点。
- **行为与原版一致**：键盘、焦点、a11y 与边界值逐项对照原版验证，交互语义一致。
- **类型支持**：完全使用 TypeScript 开发，类型定义完整。
- **兼容 Preact**：有效减小产物体积。
- **Tree Shaking**：支持按需引入。

## 使用

```bash
npm install ooui-react
```

```tsx
import { Button } from "ooui-react";

<Button onClick={() => console.log("clicked")}>按钮</Button>
```

样式引入、MediaWiki 站点使用等详见[组件文档](https://bearbin1215.github.io/ooui-react/guide/usage.html)。

## 参与完善

欢迎各路人士参与本组件库的完善，贡献指南见[CONTRIBUTING.md](https://github.com/BearBin1215/ooui-react/blob/main/CONTRIBUTING.md)

## 开源协议

[MIT](https://github.com/BearBin1215/ooui-react/blob/main/LICENSE) © [BearBin](https://github.com/BearBin1215)

## 致谢

本项目是 [OOUI](https://github.com/wikimedia/oojs-ui) 的 React 实现，其 API 设计、CSS 类名与行为契约部分衍生自 OOUI。OOUI 基于 [MIT 许可证](https://github.com/wikimedia/oojs-ui/blob/master/LICENSE-MIT)授权，Copyright 2011-2025 OOUI Team and other contributors。
