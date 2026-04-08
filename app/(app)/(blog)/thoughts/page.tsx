import type { Metadata } from "next";
import { Suspense } from "react";

import { Spinner } from "@/shared/components/ui/spinner";
import { getAllThoughts, getAllTags } from "@/shared/lib/thoughts";

import { ThoughtsFilter } from "./_components/thoughts-filter";

export const metadata: Metadata = {
  description:
    "Writing about Next.js, architecture, and building things on the web.",
  title: "Thoughts",
  twitter: {
    card: "summary_large_image",
  },
};

export default function ThoughtsPage() {
  const thoughts = getAllThoughts();
  const allTags = getAllTags();

  return (
    <div className="max-w-3xl bg-background/85 dark:bg-transparent mx-auto px-4 py-10">
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
    </div>
  );
}
