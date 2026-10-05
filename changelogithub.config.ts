import { defineConfig } from "changelogithub";

export default defineConfig({
  types: {
    feat: { title: "✨ 新特性" },
    fix: { title: "🐛 问题修复" },
    perf: { title: "⚡ 性能优化" },
    docs: { title: "📚 文档" },
    build: { title: "🛠️ 构建" },
    ci: { title: "🤖 CI" },
    test: { title: "🧪 测试" },
    chore: { title: "🧹 杂项" },
    revert: { title: "↩️ 回滚" },
  },
});
