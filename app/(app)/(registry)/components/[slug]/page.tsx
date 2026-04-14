import { ArrowLeft } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { BreadcrumbJsonLd } from "@/shared/components/json-ld";
import { Markdown } from "@/shared/components/markdown";
import { SITE } from "@/shared/config/site";
import {
  getComponent,
  getComponents,
  getMdxComponent,
} from "@/shared/lib/registry";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  const components = getComponents();
  return components.map((c) => ({ slug: c.name }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const entry = getComponent(slug);

  if (!entry) return { title: "Not Found" };
  return {
    alternates: {
      canonical: `/components/${slug}`,
    },
    description: entry.description,
    openGraph: {
      description: entry.description,
      siteName: SITE.name,
      title: entry.title,
      type: "website",
      url: `${SITE.url}/components/${slug}`,
    },
    title: entry.title,
    twitter: {
      card: "summary_large_image",
    },
  };
}

export default async function ComponentPage({ params }: Props) {
  const { slug } = await params;
  const entry = getComponent(slug);
  if (!entry) notFound();

  const mdxContent = await getMdxComponent(entry.name);

  return (
    <section className="py-10 px-6">
      <BreadcrumbJsonLd
        items={[
          { name: "Home", url: SITE.url },
          { name: "Components", url: `${SITE.url}/components` },
          { name: entry.title, url: `${SITE.url}/components/${slug}` },
        ]}
      />
      <header className="bg-background border-t border-border px-2 py-1">
        {/* Back */}
        <Link
          prefetch={false}
          href="/components"
          className="inline-flex items-center gap-1.5 text-[12px] text-muted-foreground hover:text-brand-green transition-colors"
        >
          <ArrowLeft className="size-3" />
          Components
        </Link>

        {/* Header */}
        <div className="grid grid-cols-1 gap-y-2">
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">
            {entry.title}
          </h1>
          <p className="text-[13px] text-muted-foreground">
            {entry.description}
          </p>
        </div>
      </header>

      <article className="my-12 prose w-full max-w-full prose-neutral dark:prose-invert">
        <Markdown content={mdxContent} />
      </article>

      {/* Dependencies components (Can be placed at the bottom or inside MDX, keeping here for now just in case) */}
      {entry.registryDependencies.length > 0 && (
        <div className="mt-16 pt-8 border-t border-border">
          <p className="mb-2 text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
            Dependencies Components
          </p>
          <div className="flex flex-wrap gap-2">
            {entry.registryDependencies.map((dep) => (
              <Link
                prefetch={false}
                key={dep}
                href={`/components/${dep}`}
                target="_blank"
                className="border border-border px-2 py-1 text-[12px] text-foreground hover:bg-secondary/50 rounded"
              >
                {dep}
              </Link>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}
