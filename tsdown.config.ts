import { defineConfig } from "tsdown";

export default defineConfig({
  entry: ["src/index.ts", "src/locales/*.ts"],
  unbundle: true,
  platform: "neutral",
  format: ["esm", "cjs"],
  target: "baseline-widely-available",
  dts: true,
  sourcemap: true,
  clean: true,
  deps: {
    neverBundle: ["react", "react-dom", /^react\//],
  },
  publint: "ci-only",
  attw: "ci-only",
});
