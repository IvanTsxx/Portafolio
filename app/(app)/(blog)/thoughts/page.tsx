import type { Metadata } from "next";
import { Suspense } from "react";

import { BreadcrumbJsonLd } from "@/shared/components/json-ld";
import { Spinner } from "@/shared/components/ui/spinner";
import { SITE } from "@/shared/config/site";
import { getAllThoughts, getAllTags } from "@/shared/lib/thoughts";

import { ThoughtsFilter } from "./_components/thoughts-filter";

export const metadata: Metadata = {
  alternates: {
    canonical: "/thoughts",
  },
  description:
    "Writing about Next.js, architecture, and building things on the web.",
  openGraph: {
    description:
      "Writing about Next.js, architecture, and building things on the web.",
    siteName: SITE.name,
    title: "Thoughts",
    type: "website",
    url: `${SITE.url}/thoughts`,
  },
  title: "Thoughts",
  twitter: {
    card: "summary_large_image",
    creator: "@IvanTsxx",
    description: SITE.description,
    site: SITE.twitter,
    title: SITE.name,
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
      {/* Page header */}
      <div className="mb-8">
        <h1 className="text-2xl font-medium tracking-tight">Thoughts</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Writing about Next.js, architecture, and building things on the web.
        </p>
        <div className="border-b border-border mt-4" />
      </div>

      {/* Client filter + list */}
      <Suspense fallback={<Spinner />}>
        <ThoughtsFilter thoughts={thoughts} allTags={allTags} />
      </Suspense>
    </section>
  );
}
