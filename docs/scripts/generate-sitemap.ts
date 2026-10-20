// 构建后生成 sitemap.xml 与 robots.txt。
// 条目扫描 build/ 下实际产出的 .html 文件：路由会随内容与主题变化，扫描产物比维护路由表可靠；
// 地址取无后缀的规范形式，与 canonical 一致。镜像站不生成这两个文件，靠页内 noindex 退索引。
import { readdirSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { canonicalHref, EN_PREFIX, IS_MIRROR, siteHref } from "./site-config.ts";

const docsRoot: string = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const buildDir: string = path.join(docsRoot, "build");

/** 语言树：默认语言无前缀，其余挂在各自前缀下；顺序决定 alternate 的排列 */
const LOCALES: readonly { lang: string; prefix: string }[] = [
  { lang: "zh", prefix: "" },
  { lang: "en", prefix: EN_PREFIX },
];
const DEFAULT_LANG = "zh";

const isLocalized = (route: string, prefix: string): boolean =>
  prefix !== "" && (route === prefix || route.startsWith(`${prefix}/`));

/** 路由所属的语言树 */
const langOf = (route: string): string =>
  LOCALES.find(({ prefix }) => isLocalized(route, prefix))?.lang ?? DEFAULT_LANG;

/** 去掉语言前缀后的路由，作为同页各语言版本的分组键 */
const pairingKey = (route: string): string => {
  const prefix = LOCALES.find((l) => isLocalized(route, l.prefix))?.prefix;
  if (!prefix) {
    return route;
  }
  return route.slice(prefix.length) || "/index.html";
};

/** build/ 下的页面路由（以 / 开头的 posix 路径），不含 404 页 */
function collectRoutes(dir: string): string[] {
  const routes: string[] = [];
  const walk = (current: string): void => {
    for (const entry of readdirSync(current, { withFileTypes: true })) {
      const full = path.join(current, entry.name);
      if (entry.isDirectory()) {
        walk(full);
      } else if (entry.name.endsWith(".html") && entry.name !== "404.html") {
        routes.push(`/${path.relative(buildDir, full).split(path.sep).join("/")}`);
      }
    }
  };
  walk(dir);
  return routes.sort();
}

function writeSeoFiles(): void {
  if (IS_MIRROR) {
    console.log("[seo] mirror build: no sitemap/robots (see the noindex meta)");
    return;
  }
  // 同页的各语言版本归为一组，sitemap 每条 <url> 都带上整组的 alternate
  const groups = new Map<string, Map<string, string>>();
  for (const route of collectRoutes(buildDir)) {
    const key = pairingKey(route);
    const group = groups.get(key) ?? new Map<string, string>();
    group.set(langOf(route), route);
    groups.set(key, group);
  }
  const urls: string[] = [];
  for (const group of groups.values()) {
    const alternates = LOCALES.filter(({ lang }) => group.has(lang)).map(({ lang }) => ({
      lang,
      href: canonicalHref(group.get(lang) as string),
    }));
    const xDefault = alternates.find(({ lang }) => lang === DEFAULT_LANG)?.href;
    const alternateTags = alternates
      .map(
        ({ lang, href }) =>
          `    <xhtml:link rel="alternate" hreflang="${lang}" href="${href}"/>`,
      )
      .concat(
        xDefault
          ? [`    <xhtml:link rel="alternate" hreflang="x-default" href="${xDefault}"/>`]
          : [],
      )
      .join("\n");
    for (const { href } of alternates) {
      urls.push(
        ["  <url>", `    <loc>${href}</loc>`, alternateTags, "  </url>"].join("\n"),
      );
    }
  }
  writeFileSync(
    path.join(buildDir, "sitemap.xml"),
    `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">\n${urls.join("\n")}\n</urlset>\n`,
  );
  const sitemapUrl = siteHref("/sitemap.xml");
  writeFileSync(
    path.join(buildDir, "robots.txt"),
    `User-agent: *\nAllow: /\n\nSitemap: ${sitemapUrl}\n`,
  );
  console.log(`[seo] sitemap: ${urls.length} urls; robots.txt: Sitemap ${sitemapUrl}`);
}

writeSeoFiles();
