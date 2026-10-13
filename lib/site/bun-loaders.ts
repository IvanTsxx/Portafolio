import { readFile } from "node:fs/promises";

import { compile } from "@mdx-js/mdx";
import { plugin } from "bun";
import rehypeSlug from "rehype-slug";
import remarkGfm from "remark-gfm";

const googleFontNames = [
  "Archivo",
  "Geist_Mono",
  "Instrument_Serif",
  "Noto_Sans_JP",
  "Zen_Kaku_Gothic_New",
] as const;

const googleFontStub = [
  "const font = () => ({ className: '', style: { fontFamily: '' }, variable: '' });",
  ...googleFontNames.map((name) => `export const ${name} = font;`),
].join("\n");

export const registerAppLoaders = () =>
  plugin({
    name: "app-modules",
    setup(build) {
      build.onLoad({ filter: /\.mdx$/u }, async ({ path: filePath }) => {
        const source = await readFile(filePath, "utf-8");
        const compiled = await compile(source, {
          rehypePlugins: [rehypeSlug],
          remarkPlugins: [remarkGfm],
        });
        return { contents: String(compiled), loader: "js" };
      });
      build.module("next/font/google", () => ({
        contents: googleFontStub,
        loader: "js",
      }));
    },
  });
