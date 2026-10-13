import { describe, expect, test } from "bun:test";
import { readdirSync, readFileSync } from "node:fs";
import path from "node:path";

import { primaryRoutes } from "./config";
import { notchNumber, sectionsForRoute } from "./page-sections";

const renderedSources = ["app", "components"]
  .flatMap((directory) =>
    readdirSync(path.join(process.cwd(), directory), { recursive: true })
      .map(String)
      .filter((file) => file.endsWith(".tsx"))
      .map((file) => path.join(process.cwd(), directory, file))
  )
  .map((file) => readFileSync(file, "utf-8"))
  .join("\n");

describe("thumb index sections", () => {
  test("every notch points at a section the pages render", () => {
    const missing = primaryRoutes.flatMap((route) =>
      sectionsForRoute(route.href)
        .filter(
          (section) =>
            !renderedSources.includes(`id="${section.id}"`) &&
            !renderedSources.includes(`sectionById("${section.id}")`)
        )
        .map((section) => `${route.href}#${section.id}`)
    );
    expect(missing).toEqual([]);
  });

  test("routes without a section map get no notches", () => {
    expect(sectionsForRoute("/notes")).toEqual([]);
    expect(sectionsForRoute("/notes/some-note")).toEqual([]);
  });

  test("a notch prints the number after the section code", () => {
    expect(notchNumber("GH-03")).toBe("03");
    expect(notchNumber("DS-06")).toBe("06");
  });
});
