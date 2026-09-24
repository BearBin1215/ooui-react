// 将已安装的 oojs-ui dist 中两份主题 CSS 及其 url() 引用的图标图片拷贝到 docs/public/ooui/，
// 供文档站运行时经单一 <link> 切换示例主题（见 rspress.config.ts 与 theme/ThemeSwitcher.tsx）。
// 资源随依赖版本生成，不入库（根 .gitignore 的 docs/public/ooui/）。经 package.json scripts
// 以 node 原生类型剥离直接运行（默认开启于 Node 22.18+/23.6+），故语法须保持可擦除——
// 不用 enum/带运行时的 namespace/参数属性（见 nodejs.org/api/typescript.html）。
import {
  cpSync,
  existsSync,
  mkdirSync,
  readFileSync,
  rmSync,
  statSync,
  writeFileSync,
} from "node:fs";
import path from "node:path";
import { createRequire } from "node:module";

/** 支持切换的原版主题，与 theme/ThemeSwitcher.tsx 一致 */
const THEMES = ["wikimediaui", "apex"] as const;

const require = createRequire(import.meta.url);
const docsRoot = path.resolve(import.meta.dirname, "..");
const distDir = path.dirname(require.resolve("oojs-ui/dist/oojs-ui-wikimediaui.css"));
const outDir = path.join(docsRoot, "public", "ooui");

const cssPaths = THEMES.map((theme) => path.join(distDir, `oojs-ui-${theme}.css`));

// 以两份源 CSS 的路径+修改时间+大小为指纹：依赖升级后指纹变化才全量重建，日常 dev/build 秒过
const fingerprint = cssPaths
  .map((file) => `${file}:${statSync(file).mtimeMs}:${statSync(file).size}`)
  .join("\n");
const stampFile = path.join(outDir, ".stamp");
if (existsSync(stampFile) && readFileSync(stampFile, "utf8") === fingerprint) {
  process.exit(0);
}

rmSync(outDir, { recursive: true, force: true });
mkdirSync(outDir, { recursive: true });

// 主题 CSS 内的图标为相对引用（如 themes/wikimediaui/images/icons/x.svg，相对 dist 根；
// apex 主题 CSS 亦复用 wikimediaui 图标目录）。按两份 CSS 的引用并集裁剪拷贝，
// 避免整库 images（含未用图标组）进文档站产物
const urlPattern = /url\(\s*(['"]?)([^'")]+)\1\s*\)/g;
let imageCount = 0;
for (const theme of THEMES) {
  const cssPath = path.join(distDir, `oojs-ui-${theme}.css`);
  // 与源文件逐字节一致：图标相对引用按「public 根 = dist 根的镜像」原样生效
  writeFileSync(path.join(outDir, path.basename(cssPath)), readFileSync(cssPath));
  for (const [, , ref] of readFileSync(cssPath, "utf8").matchAll(urlPattern)) {
    if (ref.startsWith("data:")) {
      continue;
    }
    const source = path.resolve(distDir, ref);
    if (!source.startsWith(distDir + path.sep)) {
      throw new Error(`oojs-ui dist 外的资源引用: ${ref}`);
    }
    const target = path.join(outDir, path.relative(distDir, source));
    if (!existsSync(target)) {
      mkdirSync(path.dirname(target), { recursive: true });
      cpSync(source, target);
      imageCount += 1;
    }
  }
}

writeFileSync(stampFile, fingerprint);
console.log(
  `[copy-ooui-assets] 已更新 docs/public/ooui（${THEMES.length} 份主题 CSS + ${imageCount} 个图片文件）`,
);
