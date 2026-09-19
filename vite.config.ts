import path from "node:path";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

/** playground 开发服务器配置 */
export default defineConfig({
  root: "./playground",
  plugins: [react()],
  resolve: {
    alias: [
      {
        find: /^ooui-react\/locales\/(.+)$/,
        replacement: path.resolve(import.meta.dirname, "src/locales/$1"),
      },
      {
        find: /^ooui-react$/,
        replacement: path.resolve(import.meta.dirname, "src/index.ts"),
      },
    ],
  },
});
