import { ArrowLeft } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { Markdown } from "@/shared/components/markdown";
import { getComponent, getComponents } from "@/shared/lib/registry";

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
    description: entry.description,
    openGraph: {
      description: entry.description,
      title: entry.title,
      type: "website",
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

  return (
    <div className="mx-auto bg-background max-w-3xl px-4 py-16">
      {/* Back */}
      <Link
        prefetch={false}
        href="/components"
        className="inline-flex items-center gap-1.5 text-[12px] text-muted-foreground hover:text-foreground transition-colors mb-8"
      >
        <ArrowLeft className="size-3" />
        Components
      </Link>

      {/* Header */}
      <div className="mb-8 border-t border-border pt-4">
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">
          {entry.title}
        </h1>
        <p className="mt-1 text-[13px] text-muted-foreground">
          {entry.description}
        </p>
      </div>

      {/* MDX Content rendered securely on the server with custom wrappers */}
      {/* MDX content */}
      <article className="my-12 prose dark:prose-invert">
        <Markdown content={entry.content} />
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
    </div>
  );
}
