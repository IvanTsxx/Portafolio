import { describe, expect, test } from "bun:test";
import { existsSync } from "node:fs";
import path from "node:path";

import type { Metadata } from "next";

import * as experimentItemPage from "@/app/(detail)/experiments/[slug]/page";
import * as noteItemPage from "@/app/(detail)/notes/[slug]/page";
import * as registryItemPage from "@/app/(detail)/registry/[slug]/page";
import * as designSystemPage from "@/app/(document)/design-system/page";
import * as experimentsPage from "@/app/(document)/experiments/page";
import * as notesPage from "@/app/(document)/notes/page";
import * as homePage from "@/app/(document)/page";
import * as registryPage from "@/app/(document)/registry/page";
import * as devAgentsPage from "@/app/dev/agents/page";
import * as devStationsPage from "@/app/dev/stations/page";
import { metadata as rootMetadata } from "@/app/layout";
import { metadata as notFoundMetadata } from "@/app/not-found";
import sitemap from "@/app/sitemap";

import { getPublicRoutes, lastModifiedOf } from "./public-routes";
import { absoluteUrl } from "./seo";

interface RouteCase {
  dir: string;
  metadata: Metadata;
  path: string;
}

interface GeneratedPage {
  generateMetadata: (
    props: PageProps<"/experiments/[slug]"> &
      PageProps<"/notes/[slug]"> &
      PageProps<"/registry/[slug]">
  ) => Promise<Metadata>;
  generateStaticParams: () =>
    | readonly { slug: string }[]
    | Promise<readonly { slug: string }[]>;
}

const staticCases: RouteCase[] = [
  { dir: "app/(document)", metadata: homePage.metadata, path: "/" },
  { dir: "app/(document)/notes", metadata: notesPage.metadata, path: "/notes" },
  {
    dir: "app/(document)/experiments",
    metadata: experimentsPage.metadata,
    path: "/experiments",
  },
  {
    dir: "app/(document)/registry",
    metadata: registryPage.metadata,
    path: "/registry",
  },
  {
    dir: "app/(document)/design-system",
    metadata: designSystemPage.metadata,
    path: "/design-system",
  },
];

const generatedPages: { base: string; dir: string; page: GeneratedPage }[] = [
  { base: "/notes", dir: "app/(detail)/notes/[slug]", page: noteItemPage },
  {
    base: "/experiments",
    dir: "app/(detail)/experiments/[slug]",
    page: experimentItemPage,
  },
  {
    base: "/registry",
    dir: "app/(detail)/registry/[slug]",
    page: registryItemPage,
  },
];

const generatedCases = async (): Promise<RouteCase[]> => {
  const perPage = await Promise.all(
    generatedPages.map(async ({ base, dir, page }) => {
      const params = await page.generateStaticParams();
      return Promise.all(
        params.map(async ({ slug }) => ({
          dir,
          metadata: await page.generateMetadata({
            params: Promise.resolve({ slug }),
            searchParams: Promise.resolve({}),
          }),
          path: `${base}/${slug}`,
        }))
      );
    })
  );
  return perPage.flat();
};

const routes = [...staticCases, ...(await generatedCases())];

const socialTitleOf = (metadata: Metadata) =>
  String(metadata.openGraph?.title ?? "");

const isIndexable = (metadata: Metadata) => !metadata.robots;

describe("every public route has complete metadata", () => {
  test("the walk reaches generated pages", () => {
    expect(routes.length).toBeGreaterThan(
      staticCases.length + generatedPages.length
    );
  });

  test.each(routes.map((route) => [route.path, route] as const))(
    "%s",
    (routePath, { dir, metadata }) => {
      expect(metadata.title).toBeTruthy();
      expect(socialTitleOf(metadata).length).toBeGreaterThan(0);
      expect(socialTitleOf(metadata).length).toBeLessThanOrEqual(70);
      expect(metadata.description?.length ?? 0).toBeGreaterThanOrEqual(50);
      expect(metadata.description?.length ?? 0).toBeLessThanOrEqual(170);
      expect(metadata.alternates?.canonical).toBe(routePath);
      expect(metadata.openGraph).toMatchObject({
        description: metadata.description ?? "",
        type: expect.stringMatching(/^(?:article|website)$/u),
        url: routePath,
      });
      expect(metadata.twitter).toMatchObject({ card: "summary_large_image" });
      expect(
        existsSync(path.join(process.cwd(), dir, "opengraph-image.tsx"))
      ).toBe(true);
    }
  );

  test("titles are unique", () => {
    const titles = routes.map((route) => socialTitleOf(route.metadata));
    expect(new Set(titles).size).toBe(titles.length);
  });

  test("descriptions are unique", () => {
    const descriptions = routes.map((route) => route.metadata.description);
    expect(new Set(descriptions).size).toBe(descriptions.length);
  });

  test("the root layout leaves canonical and Open Graph URLs to each page", () => {
    expect(rootMetadata.alternates).toBeUndefined();
    expect(rootMetadata.openGraph).toBeUndefined();
  });
});

describe("dev and error routes stay out of search", () => {
  test.each([
    ["/dev/agents", devAgentsPage.metadata],
    ["/dev/stations", devStationsPage.metadata],
    ["not-found", notFoundMetadata],
  ])("%s is noindex", (_route, metadata) => {
    expect(metadata.robots).toMatchObject({ index: false });
  });
});

describe("sitemap", () => {
  const entriesPromise = sitemap();

  test("lists exactly the indexable routes", async () => {
    const entries = await entriesPromise;
    const indexable = routes
      .filter((route) => isIndexable(route.metadata))
      .map((route) => absoluteUrl(route.path))
      .toSorted();
    expect(entries.map((entry) => entry.url).toSorted()).toEqual(indexable);
  });

  test("every entry has a lastModified date", async () => {
    const entries = await entriesPromise;
    for (const entry of entries) {
      expect(entry.lastModified).toMatch(/^\d{4}-\d{2}-\d{2}$/u);
    }
  });

  test("route-dates.json covers every public route (rerun bun run seo:dates)", async () => {
    const publicRoutes = await getPublicRoutes();
    expect(
      publicRoutes.filter((route) => lastModifiedOf(route.path) === undefined)
    ).toEqual([]);
  });

  test("excludes dev routes and the removed composable page builder note", async () => {
    const entries = await entriesPromise;
    const urls = entries.map((entry) => entry.url).join("\n");
    expect(urls).not.toContain("/dev");
    expect(urls).not.toContain("composable-page-builder");
  });
});
