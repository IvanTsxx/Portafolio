import { describe, expect, test } from "bun:test";
import { existsSync, readFileSync } from "node:fs";
import path from "node:path";

import { sectionSpecs } from "@/lib/design-system/sections";

import { homeSections } from "./config";
import { notchNumber, notchedRoutes, sectionsForRoute } from "./page-sections";
import type { PageSection } from "./page-sections";

const sectionLists = new Map<string, readonly PageSection[]>([
  ["homeSectionById", homeSections],
  ["sectionById", sectionSpecs],
]);

const root = process.cwd();

const pageFileFor = (route: string) =>
  path.join(root, "app/(document)", route, "page.tsx");

const resolveImport = (specifier: string, fromFile: string) => {
  const base = specifier.startsWith("@/")
    ? path.join(root, specifier.slice(2))
    : path.resolve(path.dirname(fromFile), specifier);
  return [`${base}.tsx`, `${base}.ts`, path.join(base, "index.tsx")].find(
    (candidate) => existsSync(candidate)
  );
};

const openingTagAt = (source: string, start: number) => {
  let depth = 0;
  for (let cursor = start; cursor < source.length; cursor += 1) {
    const character = source[cursor];
    if (character === "{") {
      depth += 1;
    } else if (character === "}") {
      depth -= 1;
    } else if (character === ">" && depth === 0) {
      return source.slice(start, cursor);
    }
  }
  return source.slice(start);
};

const unwrap = (expression: string) => expression.slice(1, -1);

const resolveValue = (expression: string, source: string): string | null => {
  if (/^"[^"]*"$/u.test(expression)) {
    return unwrap(expression);
  }
  if (/^\{\w+\.(?:id|index|label)\}$/u.test(expression)) {
    const [binding, field] = unwrap(expression).split(".");
    const call = new RegExp(
      `const ${binding} = (?<lookup>\\w+)\\("(?<id>[^"]+)"\\)`,
      "u"
    ).exec(source)?.groups;
    const section = sectionLists
      .get(call?.lookup ?? "")
      ?.find((candidate) => candidate.id === call?.id);
    return section
      ? (new Map(Object.entries(section)).get(field ?? "") ?? null)
      : null;
  }
  if (/^\{\w+\}$/u.test(expression)) {
    return (
      new RegExp(`const ${unwrap(expression)} = "(?<text>[^"]*)"`, "u").exec(
        source
      )?.groups?.text ?? null
    );
  }
  return null;
};

const attribute = (tag: string, name: string, source: string) => {
  const value = new RegExp(
    `\\s${name}=(?<value>"[^"]*"|\\{[\\w.]+\\})`,
    "u"
  ).exec(tag)?.groups?.value;
  return value ? resolveValue(value, source) : null;
};

const headingsIn = (file: string) => {
  const source = readFileSync(file, "utf-8");
  return [...source.matchAll(/<DocumentSection\b/gu)].map((match) => {
    const tag = openingTagAt(source, match.index);
    return {
      id: attribute(tag, "id", source),
      index: attribute(tag, "index", source),
      label: attribute(tag, "label", source),
    };
  });
};

const renderedHeadings = (route: string) => {
  const pageFile = pageFileFor(route);
  const page = readFileSync(pageFile, "utf-8");
  const imports = new Map(
    (page.match(/import \{ \w+ \} from "[^"]+";/gu) ?? []).map((line) => [
      line.slice(line.indexOf("{ ") + 2, line.indexOf(" }")),
      line.slice(line.indexOf('"') + 1, line.lastIndexOf('"')),
    ])
  );
  return (page.match(/<\w+[\s/>]/gu) ?? []).flatMap((tag) => {
    const specifier = imports.get(tag.slice(1, -1));
    const file = specifier ? resolveImport(specifier, pageFile) : undefined;
    return file ? headingsIn(file) : [];
  });
};

describe("thumb index sections", () => {
  test("every notch matches a rendered heading's code and label, in page order", () => {
    expect(notchedRoutes).toEqual(["/", "/design-system"]);
    for (const route of notchedRoutes) {
      const notches = sectionsForRoute(route);
      const ids = new Set(notches.map((section) => section.id));
      const headings = renderedHeadings(route).filter(
        (heading) => heading.id !== null && ids.has(heading.id)
      );
      expect(headings).toEqual(
        notches.map(({ id, index, label }) => ({ id, index, label }))
      );
    }
  });

  test("a notch prints the number of its section's heading code, counting up the page", () => {
    for (const route of notchedRoutes) {
      const numbers = sectionsForRoute(route).map((section) =>
        Number(notchNumber(section.index))
      );
      for (const [position, number] of numbers.entries()) {
        expect(number).toBe((numbers[0] ?? 0) + position);
      }
    }
    expect(notchNumber("GH-03")).toBe("03");
    expect(notchNumber("DS-06")).toBe("06");
  });

  test("routes without a section map get no notches", () => {
    expect(sectionsForRoute("/notes")).toEqual([]);
    expect(sectionsForRoute("/notes/some-note")).toEqual([]);
  });
});
