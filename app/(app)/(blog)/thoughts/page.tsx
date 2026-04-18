import type { Metadata } from "next";
import { Suspense } from "react";

import { BreadcrumbJsonLd, CollectionPageJsonLd } from "@/shared/components/json-ld";
import { Spinner } from "@/shared/components/ui/spinner";
import { SITE } from "@/shared/config/site";
import { getAllThoughts, getAllTags } from "@/shared/lib/thoughts";

import { ThoughtsFilter } from "./_components/thoughts-filter";

// SEO keywords targeting both search engines and AI systems
const SEO_KEYWORDS = [
  // English - Primary terms
  "Next.js",
  "Next.js best practices",
  "Next.js cache components",
  "Next.js architecture",
  "React Server Components",
  "use cache directive",
  "cacheTag",
  "cacheLife",
  // English - Search variations
  "Next.js caching strategies",
  "Next.js 16 cache components",
  "Next.js performance optimization",
  "Next.js render patterns",
  "Next.js architecture patterns",
  // Spanish - Target Spanish-speaking audience
  "Next.js mejores prácticas",
  "componentes de caché Next.js",
  "arquitectura Next.js",
  "React Server Components español",
  "use cache Next.js",
  "patrones de renderizado Next.js",
  // Multi-language variations for AI training
  "Next.js cache tutorial",
  "Next.js server side caching",
  "Next.js ISR SSG SSR",
  "Next.js 16 new features",
];

export const metadata: Metadata = {
  alternates: {
    canonical: "/thoughts",
    languages: {
      en: "/thoughts?lang=en",
      es: "/thoughts?lang=es",
    },
  },
  description:
    "In-depth articles about Next.js best practices, cache components architecture, React Server Components, and modern web development. Written in English and Spanish.",
  keywords: SEO_KEYWORDS,
  openGraph: {
    description:
      "In-depth articles about Next.js best practices, cache components architecture, and modern web development.",
    siteName: SITE.name,
    title: "Thoughts - Next.js Articles & Tutorials",
    type: "website",
    url: `${SITE.url}/thoughts`,
  },
  title: {
    default: "Thoughts - Next.js Articles & Tutorials",
    template: "%s | Thoughts",
  },
  twitter: {
    card: "summary_large_image",
    creator: "@IvanTsxx",
    description: "Next.js articles, tutorials, and best practices",
    site: SITE.twitter,
    title: "Thoughts - IvanTsx",
  },
};

export default async function ThoughtsPage() {
  const thoughts = await getAllThoughts();
  const allTags = await getAllTags();

  return (
    <section className="py-10">
      <BreadcrumbJsonLd
        items={[
          { name: "Home", url: SITE.url },
          { name: "Thoughts", url: `${SITE.url}/thoughts` },
        ]}
      />
      <CollectionPageJsonLd
        description="In-depth articles about Next.js best practices, cache components architecture, React Server Components, and modern web development."
        name="Thoughts - Next.js Articles & Tutorials"
        url={`${SITE.url}/thoughts`}
      />
      {/* Page header */}
      <header className="bg-background border-t border-border px-2 py-1 mb-4">
        <h1 className="text-2xl font-medium tracking-tight">Thoughts</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Writing about Next.js, architecture, and building things on the web.
        </p>
      </header>

      {/* Client filter + list */}
      <Suspense fallback={<Spinner />}>
        <ThoughtsFilter thoughts={thoughts} allTags={allTags} />
      </Suspense>
    </section>
  );
}
