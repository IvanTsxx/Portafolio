import { existsSync, readFileSync, readdirSync } from "node:fs";
import path from "node:path";

import { registerAppLoaders } from "./bun-loaders";

registerAppLoaders();

const { getPublicRoutes } = await import("./public-routes");
const { absoluteUrl } = await import("./seo");
const { getNotes } = await import("@/lib/content/notes");
const { notePath } = await import("@/lib/content/note-domain");

const builtAppDir = path.join(process.cwd(), ".next/server/app");

if (!existsSync(builtAppDir)) {
  console.error("No build found. Run bun run build first.");
  process.exit(1);
}

type Expectation = "indexable" | "noindex-page" | "noindex-only";

interface BuiltPage {
  expectation: Expectation;
  file: string;
  label: string;
  path: string;
}

const entities = new Map([
  ["&#x27;", "'"],
  ["&amp;", "&"],
  ["&gt;", ">"],
  ["&lt;", "<"],
  ["&quot;", '"'],
]);

const between = (html: string, start: string, end: string) => {
  const open = html.indexOf(start);
  if (open === -1) {
    return;
  }
  const close = html.indexOf(end, open + start.length);
  return close === -1 ? undefined : html.slice(open + start.length, close);
};

const allBetween = (html: string, start: string, end: string) =>
  html
    .split(start)
    .slice(1)
    .flatMap((chunk) => {
      const close = chunk.indexOf(end);
      return close === -1 ? [] : [chunk.slice(0, close)];
    });

const decode = (value: string) =>
  value.replaceAll(
    /&(?:#x27|amp|gt|lt|quot);/gu,
    (entity) => entities.get(entity) ?? entity
  );

const metaContent = (
  html: string,
  attribute: "name" | "property",
  key: string
) => {
  const content = between(html, `<meta ${attribute}="${key}" content="`, '"');
  return content === undefined ? undefined : decode(content);
};

const titleOf = (html: string) =>
  decode(between(html, "<title>", "</title>") ?? "");

const canonicalOf = (html: string) =>
  between(html, '<link rel="canonical" href="', '"');

const sameUrl = (first: string | undefined, second: string) =>
  first !== undefined && new URL(first).href === new URL(second).href;

const isNoIndex = (html: string) =>
  /<meta name="robots" content="[^"]*noindex/u.test(html);

const jsonLdProblems = (html: string) => {
  const blocks = allBetween(
    html,
    '<script type="application/ld+json">',
    "</script>"
  );
  if (blocks.length === 0) {
    return ["no JSON-LD"];
  }
  return blocks.flatMap((block) => {
    try {
      JSON.parse(block);
      return [];
    } catch (error) {
      return [`JSON-LD does not parse: ${String(error)}`];
    }
  });
};

const socialProblems = (html: string, routePath: string) => [
  ...(sameUrl(canonicalOf(html), absoluteUrl(routePath))
    ? []
    : [`canonical is ${canonicalOf(html)}`]),
  ...(sameUrl(metaContent(html, "property", "og:url"), absoluteUrl(routePath))
    ? []
    : ["og:url does not match the canonical"]),
  ...["og:title", "og:description", "og:type", "og:image"].flatMap((key) =>
    metaContent(html, "property", key) ? [] : [`no ${key}`]
  ),
  ...["twitter:card", "twitter:title", "twitter:image"].flatMap((key) =>
    metaContent(html, "name", key) ? [] : [`no ${key}`]
  ),
  ...(html.includes('rel="icon"') && html.includes('rel="apple-touch-icon"')
    ? []
    : ["icon links missing"]),
  ...jsonLdProblems(html),
];

const detailPathPattern = /^\/(?:experiments|notes|registry|skills)\/[^/]+$/u;

const markdownBodyOf = (routePath: string) =>
  path.join(builtAppDir, "markdown", `${routePath.slice(1)}.body`);

const markdownProblems = (html: string, routePath: string) => {
  if (!detailPathPattern.test(routePath)) {
    return [];
  }
  const alternate = `<link rel="alternate" type="text/markdown" href="${absoluteUrl(`${routePath}.md`)}"/>`;
  return [
    ...(html.includes(alternate) ? [] : ["no text/markdown alternate link"]),
    ...(existsSync(markdownBodyOf(routePath))
      ? []
      : [`${routePath}.md was not prerendered`]),
  ];
};

const checkPage = (page: BuiltPage) => {
  if (!existsSync(page.file)) {
    return { ...page, description: "", problems: ["not built"], title: "" };
  }
  const html = readFileSync(page.file, "utf-8");
  const title = titleOf(html);
  const description = metaContent(html, "name", "description") ?? "";
  const wantsNoIndex = page.expectation !== "indexable";
  const problems = [
    ...(title ? [] : ["no <title>"]),
    ...(description ? [] : ["no meta description"]),
    ...(isNoIndex(html) === wantsNoIndex
      ? []
      : [wantsNoIndex ? "missing noindex" : "indexable route is noindex"]),
    ...(page.expectation === "noindex-only"
      ? []
      : [
          ...socialProblems(html, page.path),
          ...markdownProblems(html, page.path),
        ]),
  ];
  return { ...page, description, problems, title };
};

const htmlFileOf = (routePath: string) =>
  path.join(
    builtAppDir,
    routePath === "/" ? "index.html" : `${routePath}.html`
  );

const allHtmlFiles = readdirSync(builtAppDir, { recursive: true }).flatMap(
  (entry) => (String(entry).endsWith(".html") ? [String(entry)] : [])
);

const notes = await getNotes();
const publicRoutes = await getPublicRoutes();

const pages: BuiltPage[] = [
  ...publicRoutes.map((route) => ({
    expectation: "indexable" as const,
    file: htmlFileOf(route.path),
    label: route.path,
    path: route.path,
  })),
  ...notes.flatMap((note) =>
    note.sample
      ? [
          {
            expectation: "noindex-page" as const,
            file: htmlFileOf(notePath(note.slug)),
            label: `${notePath(note.slug)} (sample, noindex)`,
            path: notePath(note.slug),
          },
        ]
      : []
  ),
  ...allHtmlFiles.flatMap((file) =>
    file.startsWith("dev/") || file === "_not-found.html"
      ? [
          {
            expectation: "noindex-only" as const,
            file: path.join(builtAppDir, file),
            label: `/${file.replace(/\.html$/u, "")} (noindex)`,
            path: `/${file.replace(/\.html$/u, "")}`,
          },
        ]
      : []
  ),
];

const reports = pages.map(checkPage);

const removedNote = "composable-page-builder";
const removedNotePattern = /composable-page-builder/u;
const leaks = allHtmlFiles.filter((file) =>
  removedNotePattern.test(readFileSync(path.join(builtAppDir, file), "utf-8"))
);

console.log("| Route | Title | Description |");
console.log("| --- | --- | --- |");
for (const report of reports) {
  console.log(`| ${report.label} | ${report.title} | ${report.description} |`);
}

const missingLlms = ["llms.txt", "llms-full.txt"].filter(
  (file) => !existsSync(path.join(builtAppDir, `${file}.body`))
);

const failures = reports.filter((report) => report.problems.length > 0);
for (const failure of failures) {
  console.error(`FAIL ${failure.label}: ${failure.problems.join("; ")}`);
}
for (const leak of leaks) {
  console.error(`FAIL ${leak} mentions ${removedNote}`);
}
for (const file of missingLlms) {
  console.error(`FAIL /${file} was not prerendered`);
}
if (failures.length > 0 || leaks.length > 0 || missingLlms.length > 0) {
  process.exit(1);
}
console.log(`\nok: ${reports.length} built pages checked`);
