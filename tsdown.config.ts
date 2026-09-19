import { defineConfig } from "tsdown";

export default defineConfig({
  entry: [
    "src/**/*.ts",
    "src/**/*.tsx",
    "!**/*.test.ts",
    "!**/*.test.tsx",
    "!src/testing/**",
  ],
  unbundle: true,
  platform: "neutral",
  format: ["esm", "cjs"],
  dts: true,
  sourcemap: true,
});
