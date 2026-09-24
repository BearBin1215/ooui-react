import { existsSync, readdirSync, readFileSync } from "node:fs";
import { join, resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

/**
 * 「双层文档契约」守卫：dev-docs/DEVIATIONS.md（维护者台账）与 docs/（消费方文档）之间的同步契约。
 *
 * 本测试不测组件，而是读仓库内的台账与文档文件做契约校验；按文件名约定落 node 组——
 * 这是对「进 node 组判据」（全新模块实例 / 重定义全局）的一条例外，动机同
 * theme-contract.node.test.ts：把跨文件契约从「静默漂移」变为测试断言。
 *
 * 契约内容见 dev-docs/DEVIATIONS.md 的「双层文档契约」节：
 * - 台账每条带元数据行：`> id：<dev-*> ｜ 组件：<组件列表> ｜ 文档：<路由列表>｜无需（<理由>）`
 * - 文档侧差异内容行尾带 deviations 标记注释（`deviations: <id...>`），中英两侧标记集合一致
 * - 台账「文档」路由指向的页面必须携带对应标记（双向对齐）
 * - 差异容器只用 warning（迁移陷阱）/ note（通知性）；tip 仅供与差异无关的通知性提示；每页差异容器 ≤3 个
 */

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");

interface Entry {
  title: string;
  id: string;
  component: string;
  doc: string;
  /** 元数据行在台账中的行号（1 起），报错时定位用 */
  line: number;
}

const ledgerText = readFileSync(join(ROOT, "dev-docs", "DEVIATIONS.md"), "utf8");
const ledgerLines = ledgerText.split(/\r?\n/);

/** 只解析四个差异分节（`###` 之后），避免把头部契约说明里的要点列表当条目 */
const sectionStarts = ledgerLines
  .map((line, i) => (line.startsWith("### ") ? i : -1))
  .filter((i) => i >= 0);

const entries: Entry[] = [];
const entryProblems: string[] = [];

for (const start of sectionStarts) {
  let current: { title: string; lines: string[] } | null = null;
  const flush = (endLine: number) => {
    if (!current) {
      return;
    }
    // 元数据行是条目块内最后一个「  > id：」行
    const metaLine = [...current.lines].reverse().find((l) => /^ {2,}> id：/.test(l));
    if (!metaLine) {
      entryProblems.push(
        `dev-docs/DEVIATIONS.md:${endLine} 条目缺元数据行「> id：…｜组件：…｜文档：…」：${current.title.slice(0, 40)}`,
      );
    }
    const meta = metaLine
      ?.trim()
      .match(/^>\s*id：(\S+)\s*｜\s*组件：(.+?)\s*｜\s*文档：(.+?)\s*$/);
    entries.push({
      title: current.title,
      id: meta?.[1] ?? "",
      component: meta?.[2] ?? "",
      doc: meta?.[3] ?? "",
      line: endLine,
    });
    current = null;
  };
  for (let i = start + 1; i < ledgerLines.length; i++) {
    const line = ledgerLines[i];
    if (/^- \*\*/.test(line)) {
      flush(i);
      current = { title: line, lines: [] };
    } else if (current) {
      if (/^### /.test(line)) {
        break;
      }
      current.lines.push(line);
    }
  }
  flush(ledgerLines.length);
}

const ROUTE_RE = /^(components\/[a-z0-9-]+\/index\.mdx|guide\/[a-z0-9-]+\.mdx)$/;
const NO_NEED_RE = /^无需（(纯内部实现|对调用方不可见|已对齐项留档)）$/;
const ID_RE = /^dev-[a-z0-9-]+$/;

const parseRoutes = (doc: string): string[] | null => {
  if (NO_NEED_RE.test(doc)) {
    return null;
  }
  const routes = doc.split("；").map((r) => r.trim());
  if (routes.every((r) => ROUTE_RE.test(r))) {
    return routes;
  }
  return null;
};

const markerOf = (file: string): Set<string> => {
  const text = readFileSync(file, "utf8");
  const ids = new Set<string>();
  for (const m of text.matchAll(/\{\/\* deviations: ([a-z0-9 -]+?) \*\/\}/g)) {
    for (const id of m[1].trim().split(/\s+/)) {
      ids.add(id);
    }
  }
  return ids;
};

const walkMdx = (dir: string): string[] =>
  readdirSync(dir, { recursive: true })
    .map(String)
    .filter((f) => f.endsWith(".mdx"))
    .map((f) => join(dir, f))
    .sort();

const zhFiles = walkMdx(join(ROOT, "docs", "zh"));
const enFiles = walkMdx(join(ROOT, "docs", "en"));

describe("双层文档契约：dev-docs/DEVIATIONS.md ↔ docs/", () => {
  it("台账每条都有格式合法且唯一的元数据行", () => {
    expect(entryProblems).toEqual([]);
    const problems: string[] = [];
    const seen = new Map<string, number>();
    for (const entry of entries) {
      if (!ID_RE.test(entry.id)) {
        problems.push(
          `dev-docs/DEVIATIONS.md:${entry.line} id 非法（应为 dev- 开头的 kebab 标识）：${entry.id || "（空）"}`,
        );
      }
      const prev = seen.get(entry.id);
      if (prev !== undefined) {
        problems.push(
          `dev-docs/DEVIATIONS.md:${entry.line} id 与第 ${prev} 行重复：${entry.id}`,
        );
      } else {
        seen.set(entry.id, entry.line);
      }
      if (!entry.component.trim()) {
        problems.push(
          `dev-docs/DEVIATIONS.md:${entry.line} 「组件」字段为空：${entry.id}`,
        );
      }
      if (!NO_NEED_RE.test(entry.doc) && parseRoutes(entry.doc) === null) {
        problems.push(
          `dev-docs/DEVIATIONS.md:${entry.line} 「文档」字段非法（应为路由列表或 无需（纯内部实现|对调用方不可见|已对齐项留档））：${entry.id} → ${entry.doc}`,
        );
      }
    }
    expect(problems).toEqual([]);
  });

  it("台账「文档」路由在中英两侧都存在对应页面", () => {
    const problems: string[] = [];
    for (const entry of entries) {
      const routes = parseRoutes(entry.doc);
      if (!routes) {
        continue;
      }
      for (const route of routes) {
        for (const lang of ["zh", "en"] as const) {
          const file = join(ROOT, "docs", lang, ...route.split("/"));
          if (!existsSync(file)) {
            problems.push(
              `dev-docs/DEVIATIONS.md:${entry.line} ${entry.id} 的路由在 ${lang} 侧不存在：${route}`,
            );
          }
        }
      }
    }
    expect(problems).toEqual([]);
  });

  it("文档侧标记引用的 id 都在台账中（无孤儿标记）", () => {
    const known = new Set(entries.map((e) => e.id));
    const problems: string[] = [];
    for (const file of [...zhFiles, ...enFiles]) {
      for (const id of markerOf(file)) {
        if (!known.has(id)) {
          problems.push(`${file} 的 deviations 标记引用了不存在的条目 id：${id}`);
        }
      }
    }
    expect(problems).toEqual([]);
  });

  it("台账每个文档路由都由对应页面的标记承载（双向对齐）", () => {
    const problems: string[] = [];
    for (const entry of entries) {
      const routes = parseRoutes(entry.doc);
      if (!routes) {
        continue;
      }
      for (const route of routes) {
        for (const lang of ["zh", "en"] as const) {
          const file = join(ROOT, "docs", lang, ...route.split("/"));
          if (!existsSync(file)) {
            continue;
          }
          if (!markerOf(file).has(entry.id)) {
            problems.push(
              `${entry.id} 记录的落点 ${route} 在 ${lang} 侧缺少标记 {/* deviations: ${entry.id} */}（或内容未同步）`,
            );
          }
        }
      }
    }
    expect(problems).toEqual([]);
  });

  it("每个页面的中英两侧标记集合一致", () => {
    const problems: string[] = [];
    // 以 docs/zh 或 docs/en 之后的相对路径为镜像键（分隔符归一为 /，兼容 Windows）
    const mirrorKey = (f: string): string | null => {
      const m = f.match(/[/\\]docs[/\\](?:zh|en)[/\\](.+)$/);
      return m ? m[1].replace(/\\/g, "/") : null;
    };
    const zhRel = new Map<string, string>();
    const enRel = new Map<string, string>();
    for (const f of zhFiles) {
      zhRel.set(mirrorKey(f) ?? f, f);
    }
    for (const f of enFiles) {
      enRel.set(mirrorKey(f) ?? f, f);
    }
    for (const [key, zhFile] of zhRel) {
      const enFile = enRel.get(key);
      if (!enFile) {
        problems.push(`页面缺少 en 侧镜像：${key}`);
        continue;
      }
      const zhIds = markerOf(zhFile);
      const enIds = markerOf(enFile);
      for (const id of zhIds) {
        if (!enIds.has(id)) {
          problems.push(`标记中英不同步（zh 有、en 无）：${key} → ${id}`);
        }
      }
      for (const id of enIds) {
        if (!zhIds.has(id)) {
          problems.push(`标记中英不同步（en 有、zh 无）：${key} → ${id}`);
        }
      }
    }
    for (const [key, enFile] of enRel) {
      if (!zhRel.has(key)) {
        problems.push(`页面缺少 zh 侧镜像：${key}（${enFile}）`);
      }
    }
    expect(problems).toEqual([]);
  });

  it("差异容器只用 warning/note 且每页差异容器 ≤3 个", () => {
    const problems: string[] = [];
    for (const file of [...zhFiles, ...enFiles]) {
      const text = readFileSync(file, "utf8");
      let deviationContainers = 0;
      for (const m of text.matchAll(
        /^:::(note|warning|tip|info|caution|danger|details)?[ \t]*(.*)$/gm,
      )) {
        const [, type = "", title = ""] = m;
        const isDeviation =
          title.includes("与原版的差异") || title.includes("Differences from OOUI");
        if (isDeviation) {
          deviationContainers++;
          if (type !== "note" && type !== "warning") {
            problems.push(
              `${file} 差异容器「${title}」用了 :::${type}，只允许 :::note / :::warning`,
            );
          }
        }
      }
      if (deviationContainers > 3) {
        problems.push(
          `${file} 差异容器 ${deviationContainers} 个（上限 3）：多差异改用「## 与原版的差异」页级小节列表`,
        );
      }
    }
    expect(problems).toEqual([]);
  });
});
