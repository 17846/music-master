import { presetUno, presetAttributify, presetIcons } from "unocss";
import { defineConfig } from "unocss";
export const unocssConfig = defineConfig({
  presets: [presetUno(), presetAttributify(), presetIcons()],
  rules: [
    // m-10 默认解析为 margin:10rem 单位改为px
    [/^m-(\d+)$/, (match: RegExpMatchArray) => ({ margin: `${+match[1]}px` })],
    // m-10-10 默认解析为 margin:10rem 10rem 单位改为px
    [
      /^m-(\d+)-(\d+)$/,
      (match: RegExpMatchArray) => ({
        margin: `${+match[1]}px ${+match[2]}px`,
      }),
    ],
    // p-10 默认解析为 padding:10rem 单位改为px
    [/^p-(\d+)$/, (match: RegExpMatchArray) => ({ padding: `${+match[1]}px` })],
    // m-10-10 默认解析为 padding:10rem 10rem 单位改为px
    [
      /^p-(\d+)-(\d+)$/,
      (match: RegExpMatchArray) => ({
        padding: `${+match[1]}px ${match[2]}px`,
      }),
    ],
  ],
  shortcuts: {
    "flex-center": "flex items-center justify-center",
  },
});
