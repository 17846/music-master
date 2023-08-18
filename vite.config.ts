import { fileURLToPath, URL } from "node:url";

import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";

import electron from "vite-plugin-electron";
import electronRenderer from "vite-plugin-electron-renderer";
import polyfillExports from "vite-plugin-electron-renderer";
import { createSvgIconsPlugin } from "vite-plugin-svg-icons";
import path from "path";
import Unocss from "unocss/vite";

import { unocssConfig } from "./unocss.config";
// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    vue(),

    //electron 插件
    electron({
      entry: "main-electron/index.ts",
      vite: {
        build: {
          minify: false,
        },
      },
    }),
    electronRenderer(),
    polyfillExports(),

    //unocss插件
    Unocss(unocssConfig),

    //自定义svg图标插件
    createSvgIconsPlugin({
      iconDirs: [path.resolve(process.cwd(), "src/assets/icons")],
      symbolId: "icon-[name]",
    }),
  ],
  base: "./",
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
  server: {
    open: false,
    hmr: true,
  },
  build: {
    emptyOutDir: false,
    outDir: "dist-electron",
  },
});
