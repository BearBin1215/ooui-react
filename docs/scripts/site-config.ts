// 文档站有两个部署目标：Cloudflare Pages 是正式站，GitHub Pages 是备份镜像。
// Rspress 配置与构建后的 sitemap/robots 脚本共用这里的取值：Cloudflare 项目侧设
// DOCS_BASE=/ 与 DOCS_SITE_ORIGIN=<pages.dev 域>，GitHub Pages 侧用下面的默认值。

/** 站点部署的根路径：GitHub Pages 挂在仓库子路径下，Cloudflare Pages 是根域 */
export const BASE: string = process.env.DOCS_BASE ?? "/ooui-react/";

/** 当前部署自身的站点源 */
export const SITE_ORIGIN: string =
  process.env.DOCS_SITE_ORIGIN ?? "https://bearbin1215.github.io";

/** 唯一对外正式域：canonical 与 sitemap 一律指向它 */
export const CANONICAL_ORIGIN: string =
  process.env.DOCS_CANONICAL_ORIGIN ?? "https://ooui-react.pages.dev";

/** 备份镜像构建：GitHub Pages 工作流设 DOCS_MIRROR=1，产物带 noindex */
export const IS_MIRROR: boolean = process.env.DOCS_MIRROR === "1";

/** 站点以无后缀 URL（cleanUrls）为规范形式 */
export const CLEAN_URLS = true;

/** 默认语言（zh）之外的语言树挂在 /en 下 */
export const EN_PREFIX = "/en";

/** 去掉路由路径末尾的 index.html 或 .html 后缀 */
function stripHtmlSuffix(routePath: string): string {
  return routePath.replace(/index\.html$/, "").replace(/\.html$/, "");
}

function removeTrailingSlash(p: string): string {
  return p.endsWith("/") ? p.slice(0, -1) : p;
}

/** 路由的规范地址（canonical 与 sitemap 的 loc 都用它） */
export function canonicalHref(routePath: string): string {
  return `${CANONICAL_ORIGIN}${stripHtmlSuffix(routePath)}`;
}

/** 默认语言（zh）树上同一页的规范地址，用作 hreflang 的 x-default */
export function defaultLocaleHref(routePath: string): string {
  const stripped = routePath.replace(/^\/en(?=\/|$)/, "");
  return canonicalHref(stripped === "" ? "/" : stripped);
}

/** 当前部署自身的绝对地址（robots.txt 的 Sitemap 指向它） */
export function siteHref(routePath: string): string {
  const p = stripHtmlSuffix(routePath);
  return `${SITE_ORIGIN}${removeTrailingSlash(BASE)}${p.startsWith("/") ? p : `/${p}`}`;
}
