import { describe, expect, test } from "bun:test";
import { readFile } from "node:fs/promises";
import path from "node:path";

import { compile } from "@mdx-js/mdx";
import { plugin } from "bun";
import { createElement } from "react";
import type { ReactNode } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import rehypeSlug from "rehype-slug";
import remarkGfm from "remark-gfm";

import { getPost, getPosts, getPostSlugs } from "./blog";
import type { ContentDocument } from "./collection";
import { removeMetaExport } from "./text";
import { getProject, getProjects, getProjectSlugs } from "./work";

plugin({
  name: "mdx",
  setup(build) {
    build.onLoad({ filter: /\.mdx$/u }, async ({ path: filePath }) => {
      const source = await readFile(filePath, "utf-8");
      const compiled = await compile(source, {
        rehypePlugins: [rehypeSlug],
        remarkPlugins: [remarkGfm],
      });
      return { contents: String(compiled), loader: "js" };
    });
  },
});

const passthrough = ({ children }: { children?: ReactNode }) =>
  createElement("div", null, children);

const blockStubs = {
  Callout: passthrough,
  Demo: passthrough,
  Diagram: passthrough,
  Figure: () => null,
  NoteList: () => null,
  Step: passthrough,
  Steps: passthrough,
  Table: passthrough,
  Video: () => null,
};

const renderedHeadingIds = (html: string) =>
  (html.match(/<h[23] id="[^"]+"/gu) ?? []).map((tag) =>
    tag.slice(tag.indexOf('id="') + 4, -1)
  );

const compareHeadingIds = (
  slugs: readonly string[],
  load: (slug: string) => Promise<ContentDocument<object> | undefined>
) =>
  Promise.all(
    slugs.map(async (slug) => {
      const document = await load(slug);
      if (!document) {
        throw new Error(`${slug} did not load`);
      }
      const html = renderToStaticMarkup(
        createElement(document.Content, { components: blockStubs })
      );
      return {
        expected: document.headings.map((heading) => heading.id),
        rendered: renderedHeadingIds(html),
        slug,
      };
    })
  );

describe("shipped work content", () => {
  test("every project passes its schema and lists only existing related projects", async () => {
    const [projects, slugs] = await Promise.all([
      getProjects(),
      getProjectSlugs(),
    ]);

    expect(projects.map((item) => item.slug).toSorted()).toEqual(slugs);
    expect(projects.length).toBeGreaterThanOrEqual(3);
  });

  test("is ordered newest year first", async () => {
    const projects = await getProjects();
    const years = projects.map((item) => item.year);

    expect(years).toEqual(years.toSorted((a, b) => b - a));
  });

  test("labels every non-real entry as sample content", async () => {
    const projects = await getProjects();

    expect(projects.every((item) => item.sample)).toBe(true);
  });

  test("table of contents ids match the ids rendered into the page", async () => {
    const slugs = await getProjectSlugs();
    const results = await compareHeadingIds(slugs, getProject);

    for (const result of results) {
      expect({ ids: result.rendered, slug: result.slug }).toEqual({
        ids: result.expected,
        slug: result.slug,
      });
    }
  });
});

describe("shipped blog content", () => {
  test("every post passes its schema", async () => {
    const [posts, slugs] = await Promise.all([getPosts(), getPostSlugs()]);

    expect(posts.map((item) => item.slug).toSorted()).toEqual(slugs);
    expect(posts.length).toBeGreaterThanOrEqual(3);
  });

  test("is ordered newest first", async () => {
    const posts = await getPosts();
    const dates = posts.map((item) => item.date);

    expect(dates).toEqual(dates.toSorted().toReversed());
  });

  test("labels every non-real post as sample content", async () => {
    const posts = await getPosts();

    expect(posts.every((item) => item.sample)).toBe(true);
  });

  test("reading time comes from the prose and not from the meta block", async () => {
    const posts = await getPosts();
    const sources = await Promise.all(
      posts.map((post) =>
        readFile(
          path.join(process.cwd(), "content/blog", `${post.slug}.mdx`),
          "utf-8"
        )
      )
    );

    for (const [index, post] of posts.entries()) {
      const source = sources[index] ?? "";
      expect(removeMetaExport(source)).not.toContain("export const meta");
      expect(post.wordCount).toBeGreaterThan(150);
      expect(post.readingTimeMinutes).toBe(Math.ceil(post.wordCount / 220));
    }
  });

  test("table of contents ids match the ids rendered into the page", async () => {
    const slugs = await getPostSlugs();
    const results = await compareHeadingIds(slugs, getPost);

    for (const result of results) {
      expect({ ids: result.rendered, slug: result.slug }).toEqual({
        ids: result.expected,
        slug: result.slug,
      });
    }
  });
});
