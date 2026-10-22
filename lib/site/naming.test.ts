import { describe, expect, test } from "bun:test";
import { readdirSync, readFileSync } from "node:fs";
import path from "node:path";

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
      readFileSync(path.join(process.cwd(), file), "utf-8").includes(needle)
    )
    .toSorted();

const routePages = (group: string) =>
  sourceFiles
    .filter((file) => file.startsWith(`app/(${group})/`))
    .filter((file) => file.endsWith("/page.tsx"))
    .map((file) => file.slice(`app/(${group})/`.length, -"/page.tsx".length))
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

  test("reads the legal name only in the home intro dossier", () => {
    expect(filesContaining("siteConfig.name")).toEqual([
      "components/profile/profile-intro.tsx",
    ]);
  });

  test("reaches the dossier only through the home page", () => {
    expect(filesContaining("ProfileIntro")).toEqual([
      "app/(document)/page.tsx",
      "components/profile/profile-intro.tsx",
    ]);
  });

  test("keeps every detail route outside the document group", () => {
    expect(routePages("detail")).toEqual([
      "experiments/[slug]",
      "notes/[slug]",
      "registry/[slug]",
      "skills/[slug]",
    ]);
    expect(
      routePages("document").filter((route) => route.includes("["))
    ).toEqual([]);
    expect(filesContaining("<Dossier>")).toEqual([
      "app/(detail)/layout.tsx",
      "app/(document)/layout.tsx",
      "app/not-found.tsx",
    ]);
  });
});
