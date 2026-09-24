import path from "node:path";
import { defineConfig } from "@rspress/core";
import { pluginPreview } from "@rspress/plugin-preview";

/** 萌娘百科图标 */
const moegirlIcon = `<svg xmlns="http://www.w3.org/2000/svg" width="100%" viewBox="0 0 493.99 487.48"><path fill="currentColor" d="M326.13,164q-10.69,0-16.72-6a19.64,19.64,0,0,1-6-14.4,33.38,33.38,0,0,1,.93-7.66q.93-3.94,2.79-10.22t3.25-10.91H190.52c.62,3.09,1.47,6.66,2.55,10.68s1.93,7,2.56,8.82a34.87,34.87,0,0,1,1.86,9.29q0,9.75-6.51,14.86a23.06,23.06,0,0,1-14.63,5.11,18.64,18.64,0,0,1-13.7-5.57,22,22,0,0,1-5.1-8.83c-.32-.3-.78-1.69-1.4-4.18s-1.7-6.65-3.25-12.54-3.1-11.76-4.64-17.64H47.94a19.6,19.6,0,0,1-14.39-6,19.64,19.64,0,0,1-6-14.4,19.44,19.44,0,0,1,6-14.63A20,20,0,0,1,47.94,74h89.64q-1.4-6-2.33-9.29a23.48,23.48,0,0,1-.93-6.5,22.51,22.51,0,0,1,6.51-15.79,18.05,18.05,0,0,1,12.54-5.11q9.75,0,15.79,6a26.93,26.93,0,0,1,5.1,9.28q1.86,5.58,3.26,11.15T179.84,74H320.56c.61-3.72,1.39-7.35,2.32-10.92s1.54-6,1.86-7.2q.92-10.2,8.36-14.86a18.55,18.55,0,0,1,11.14-3.71,22.27,22.27,0,0,1,4.18.46,18.61,18.61,0,0,1,13.47,8.83,20.42,20.42,0,0,1,3.25,11.14v4.18L362.35,74h89.17a19.8,19.8,0,0,1,20,20,20.2,20.2,0,0,1-6,14.86,19.13,19.13,0,0,1-13.94,6H352.14q-6,25.55-9.76,34.83a20.74,20.74,0,0,1-5.57,10.22A14.48,14.48,0,0,1,326.13,164ZM47.25,361.66q-8.14-30-8.13-69.2T47,224q8.37-30.64,29.49-47.6t57.82-16.95q41.34,0,61.77,16t26.71,46q6.27,30,6.27,70.36t-7.9,70.13q-7.9,30.64-29,47.6t-57.82,16.95q-36.69,0-58-17.65Q55.38,391.61,47.25,361.66Zm33.2-52.72Q82.31,347,93,366.3t41.33,19.27q24.15,0,35.07-10.91t14.86-32.05q3.94-21.12,3.95-52.47t-2.79-52.72q-2.79-19.5-13.47-28.56t-37.62-9.05q-20.89,0-31.81,8.35T87,232.08a165.23,165.23,0,0,0-6,36h62.69a20.43,20.43,0,0,1,0,40.86Zm187.63,69.2q-1.4,31.59-1.4,49t.93,22.52a28.85,28.85,0,0,1,.47,5.58,18.76,18.76,0,0,1-5.81,13.7,19.87,19.87,0,0,1-14.63,5.8q-8.82,0-14.39-5.57a19.7,19.7,0,0,1-5.11-8.36q-2.34-7.9-2.33-30.65T227,377.45q1.16-30,3.48-62.47,3.24-54.8,9.29-112.39,1.84-21.36,3.71-27.4a22.7,22.7,0,0,1,8.36-12.31q6-4.41,12.08-4.41a15,15,0,0,1,5.57.93q10.21-3.24,43.19-3.25,47.83,0,76.63,8.82,30.18,9.3,43.66,33.67t13.47,68.51q0,36.23-7.44,102.17-3.25,29.25-7.66,53.87t-9.52,38.55a16.43,16.43,0,0,1-8.36,10,25.22,25.22,0,0,1-11.15,3,18.16,18.16,0,0,1-13.93-6,20.5,20.5,0,0,1-5.57-14.39c0-3.41.3-5.73.93-7q5.56-14.4,12.54-65.48,5.57-43.2,8.82-87.78,1.4-19,1.39-29.72,0-29.27-8.82-43.19t-28.33-19Q349.82,197,316.84,197a288.69,288.69,0,0,0-35.29,1.86l-5.11,53.4H360.5a19.84,19.84,0,0,1,20,20,19.66,19.66,0,0,1-6,14.4,19.13,19.13,0,0,1-13.93,6H273.19a101.65,101.65,0,0,1-.93,10.22q-.48,8.35-1.86,34.36h99.85a20.44,20.44,0,0,1,0,40.87Z"/></svg>`;

const root = import.meta.dirname;

/** 站点部署 base（dev 经 rsbuild server.base 同样带此前缀，public 资源路径两态一致） */
const base = "/ooui-react/";

/**
 * 示例主题样式表（public/ooui/，由 scripts/copy-ooui-assets.ts 从已装 oojs-ui 拷贝）的
 * 首帧预置脚本：按 localStorage 持久化值（theme/ThemeSwitcher.tsx 写入）在 head 解析期
 * 创建渲染阻塞的 <link>，apex 用户的首次绘制即为目标主题、无闪烁。经 builderConfig
 * 的 html.tags 注入（append: false 前置于站点 CSS）而非 config.head——后者仅 SSG 生效，
 * dev 下不会输出；前置于站点 CSS 亦保证 global.css 对 OOUI 类名的覆盖（弹窗 z-index
 * 抬升等）按源码序压过主题规则
 */
const applyDemoThemeScript = `(function(){var t;try{t=localStorage.getItem("ooui-docs-theme")}catch(e){}if("apex"!==t&&"wikimediaui"!==t)t="wikimediaui";var l=document.createElement("link");l.rel="stylesheet";l.dataset.oouiTheme=t;l.href="${base}ooui/oojs-ui-"+t+".css";document.currentScript.after(l)})();`;

export default defineConfig({
  root,
  outDir: path.join(root, "build"),
  base: "/ooui-react/",
  title: "ooui-react",
  description: "OOUI 的 React 实现",
  // 语言列表。默认语言由下方 lang 指定（zh），其路由不带语言前缀；其余语言的路由在
  // /<lang> 下（en → /en/…），对应文档放在 docs/<lang>/（见 https://rspress.rs/guide/basic/i18n）
  locales: [
    {
      lang: "zh",
      label: "简体中文",
      title: "ooui-react",
      description: "OOUI 的 React 实现",
    },
    {
      lang: "en",
      label: "English",
      title: "ooui-react",
      description: "A React implementation of OOUI",
    },
  ],
  lang: "zh",
  llms: true,
  // 预览组件在首帧渲染期即访问 document（菜单/浮层经 portal 出控件子树、弹窗与
  // 工具栏用 ResizeObserver 测量），无法被 SSG 静态渲染，让这些路由回退 CSR，
  // 其余页面照常预渲染
  ssg: {
    experimentalExcludeRoutePaths: [
      // 首页（zh 根路由与 en 前缀路由）：快速体验示例含 Dropdown
      /^\/(en)?\/?$/,
      /\/components\/(dropdown|dropdown-input|dialog|process-dialog|toolbar|popup|popup-button|combo-box-input|menu-tag-multiselect|button-menu-select|fieldset-layout)\/?$/,
    ],
  },
  markdown: {
    link: {
      // 构建时校验站内死链（目录迁移后防断链）
      checkDeadLinks: true,
    },
  },
  icon: "/logo.svg",
  logo: "/logo.svg",
  logoText: "ooui-react",
  globalStyles: path.join(root, "styles/global.css"),
  themeConfig: {
    // 页面标题由各页正文 h1 提供（首页为 hero.name），无需兜底标题
    fallbackHeadingTitle: false,
    // OOUI 主题仅提供浅色样式，组件预览在暗色下无法适配，锁定浅色模式
    darkMode: false,
    // 页脚「编辑此页」入口：base 指向 docs 源码目录（主题按页面相对路径拼接）；
    // 文案取 locale 默认值（editLinkText）。lastUpdated 取 git 提交时间，CI 的
    // checkout 须 fetch-depth: 0（见 .github/workflows/docs.yml），本地无碍
    editLink: {
      docRepoBaseUrl: "https://github.com/BearBin1215/ooui-react/tree/main/docs",
    },
    lastUpdated: true,
    socialLinks: [
      {
        icon: "github",
        mode: "link",
        content: "https://github.com/BearBin1215/ooui-react",
      },
      {
        icon: "npm",
        mode: "link",
        content: "https://www.npmjs.com/package/ooui-react",
      },
      {
        icon: { svg: moegirlIcon },
        mode: "link",
        content: "https://mzh.moegirl.org.cn/User:BearBin",
      },
    ],
  },
  route: {
    // demos/ 是首页示例的真实源文件（DemoCard 经 file= 代码块与模块导入引用），
    // 不是路由页面（tsx 会被收进路由并触发 SSG 而失败）；theme/ 与 scripts/ 同理——
    // 主题扩展与 node 脚本（.ts 会被收进路由，.mjs 则不会）
    exclude: [
      "**/rspress.config.ts",
      "**/build/**",
      "**/theme/**",
      "**/demos/**",
      "**/scripts/**",
    ],
  },
  plugins: [pluginPreview()],
  builderConfig: {
    html: {
      tags: [
        { tag: "script", children: applyDemoThemeScript, head: true, append: false },
      ],
    },
    resolve: {
      alias: {
        // ooui-react/locales 必须单列且排在 ooui-react 之前：字符串别名按前缀匹配
        // 会吞掉子路径，缺了它预览里引语言包会被解析成 <src>/index.ts/locales/*（同
        // vite.config.ts 的坑，见 comparison-guide §2.1）
        "ooui-react/locales": path.join(root, "../src/locales"),
        "ooui-react": path.join(root, "../src/index.ts"),
      },
    },
  },
});
