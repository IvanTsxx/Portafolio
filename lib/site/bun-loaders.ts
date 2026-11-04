import { readFile } from "node:fs/promises";

import { compile } from "@mdx-js/mdx";
import { plugin } from "bun";
import rehypeSlug from "rehype-slug";
import remarkGfm from "remark-gfm";

const googleFontNames = [
  "Geist_Mono",
  "Herr_Von_Muellerhoff",
  "Instrument_Serif",
] as const;

const geistFontStub = (exportName: string) =>
  `export const ${exportName} = { className: '', style: { fontFamily: '' }, variable: '' };`;

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
      build.module("geist/font/sans", () => ({
        contents: geistFontStub("GeistSans"),
        loader: "js",
      }));
      build.module("geist/font/mono", () => ({
        contents: geistFontStub("GeistMono"),
        loader: "js",
      }));
    },
  });
