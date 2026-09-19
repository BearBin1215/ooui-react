import { playwright } from "@vitest/browser-playwright";
import { defineConfig } from "vitest/config";

/**
 * 测试配置（dev服务器配置在vite.config.ts——Vitest发现本文件后不再读它，故两处不共享Vite选项）。
 *
 * node/browser双project按**文件名约定**分组：`*.node.test.{ts,tsx}`落node组，其余`*.test.{ts,tsx}`
 * 落browser组。新增node-only用例只需按此命名，无需在任何清单登记（避免「忘登记即静默落错组」）。
 *
 * 进node组的判据是「逐用例需全新模块实例」或「需重定义不可桩全局」，browser组这两项都做不到
 * （实测vitest 5.0.1：browser组内vi.resetModules对动态import无效、拿回同一模块实例；
 * vi.stubGlobal("document")抛Cannot redefine property: document，navigator可桩）。判据不是
 * 「源码存在模块级单例」——dialogs/isolation.test.ts、config.imperative.test.tsx均依赖单例但用例
 * 自平衡，正确地留在browser组。各node用例的具体硬约束见其文件头注释。
 */

export default defineConfig({
  test: {
    projects: [
      {
        test: {
          name: "node",
          environment: "node",
          include: ["src/**/*.node.test.{ts,tsx}"],
        },
      },
      {
        // browser组：组件渲染契约测试（vitest-browser-react真实渲染）与纯函数测试
        test: {
          name: "browser",
          include: ["src/**/*.test.{ts,tsx}"],
          // *.node.test.*同样匹配上面的*.test.*通配，故在此显式排除，与node组互斥
          exclude: ["src/**/*.node.test.{ts,tsx}"],
          // 与测试同运行于iframe内（见vitest.browser-setup.ts的说明）
          setupFiles: ["./vitest.browser-setup.ts"],
          browser: {
            enabled: true,
            provider: playwright(),
            instances: [{ browser: "chromium" }],
            headless: true,
          },
        },
      },
    ],
  },
});
