import { readdirSync, readFileSync } from "node:fs";
import path from "node:path";

import { describe, expect, test } from "bun:test";

import { siteConfig } from "./config";

const sourceDirectories = ["app", "components", "content", "lib"];

const sourceFilePattern = /\.(?:ts|tsx|mdx)$/u;

const sourceFiles = sourceDirectories.flatMap((directory) =>
  readdirSync(path.join(process.cwd(), directory), { recursive: true })
    .map(String)
    .filter(
      (file) => sourceFilePattern.test(file) && !file.endsWith(".test.ts")
    )
    .map((file) => path.join(directory, file))
);

const filesContaining = (needle: string) =>
  sourceFiles
    .filter((file) =>
      readFileSync(path.join(process.cwd(), file), "utf8").includes(needle)
    )
    .toSorted();

describe("site naming", () => {
  test("calls him by the nickname and keeps the legal name separate", () => {
    expect(siteConfig.nickname).toBe("Ivo");
    expect(siteConfig.name).toContain(siteConfig.nickname.slice(0, 2));
    expect(siteConfig.name).not.toBe(siteConfig.nickname);
  });

  test("spells the surname in the site config and nowhere else in the source", () => {
    const surname = siteConfig.name.split(" ").at(-1) ?? "";

    expect(filesContaining(surname)).toEqual(["lib/site/config.ts"]);
  });

  test("reads the legal name only in the dossier heading and the mobile monogram", () => {
    expect(filesContaining("siteConfig.name")).toEqual([
      "components/profile/identity-dossier.tsx",
      "components/site/dossier-disclosure.tsx",
    ]);
  });
});
