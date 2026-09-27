<p align="center"><img src="https://bearbin1215.github.io/ooui-react/logo.svg" width="180" alt="ooui-react logo"></p>

<h1 align="center">ooui-react</h1>
<p align="center">A <a href="https://react.dev/">React</a> implementation of the <a href="https://github.com/wikimedia/oojs-ui">OOUI</a> component library.</p>
<p align="center">
  <a href="https://www.npmjs.com/package/ooui-react" target="_blank" rel="noopener noreferrer"><img src="https://img.shields.io/npm/v/ooui-react?style=flat-square" alt="npm" /></a>
  <a href="https://react.dev" target="_blank" rel="noopener noreferrer"><img src="https://img.shields.io/badge/React-18+-61DAFB?style=flat-square&logo=react&logoColor=black" alt="React" /></a>
  <a href="https://www.typescriptlang.org" target="_blank" rel="noopener noreferrer"><img src="https://img.shields.io/badge/TypeScript-6-3178C6?style=flat-square&logo=typescript&logoColor=white" alt="TypeScript" /></a>
  <a href="https://bearbin1215.github.io/ooui-react/" target="_blank" rel="noopener noreferrer"><img src="https://img.shields.io/badge/Docs-Online-blue?style=flat-square" alt="Documentation" /></a>
  <a href="https://github.com/BearBin1215/ooui-react/blob/main/LICENSE" target="_blank"><img src="https://img.shields.io/github/license/BearBin1215/ooui-react?style=flat-square" alt="License"></a>
</p>
<p align="center"><a href="https://github.com/BearBin1215/ooui-react/blob/main/README.md">简体中文</a> | English</p>

A React implementation of the [OOUI](https://github.com/wikimedia/oojs-ui) component library. Rewritten from scratch, with no runtime dependency on oojs-ui.

## Features

- **No bundled styles**: Output DOM structure, class names, and attributes match the original; styles are supplied by the consumer from OOUI, fitting MediaWiki sites.
- **Behavior consistent with the original**: Keyboard, focus, a11y, and edge cases are verified item by item against the original, so interaction semantics stay consistent.
- **TypeScript support**: Written entirely in TypeScript with complete type definitions.
- **Preact compatible**: Effectively reduces bundle size.
- **Tree shaking**: Supports on-demand imports.

## Usage

```bash
npm install ooui-react
```

```tsx
import { Button } from "ooui-react";

<Button onClick={() => console.log("clicked")}>Click me</Button>
```

For style imports, MediaWiki integration, and more, see the [Usage guide](https://bearbin1215.github.io/ooui-react/en/guide/usage.html).

## Contributing

Contributions from everyone are welcome. See [CONTRIBUTING.md](https://github.com/BearBin1215/ooui-react/blob/main/CONTRIBUTING.md) for the contribution guide.

## License

[MIT](https://github.com/BearBin1215/ooui-react/blob/main/LICENSE) © [BearBin](https://github.com/BearBin1215)
