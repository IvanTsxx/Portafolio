import { ArrowLeft } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { getBlock, getBlocks } from "@/shared/lib/registry";

import { InstallCommand } from "../../_components/install-command";
import { RegistryPreview } from "../../_components/registry-preview";

interface Props {
  params: Promise<{ slug: string }>;
}

// oxlint-disable-next-line require-await
export async function generateStaticParams() {
  return getBlocks().map((b) => ({ slug: b.name }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const entry = getBlock(slug);
  if (!entry) return { title: "Not Found" };
  return {
    description: entry.description,
    title: entry.title,
  };
}

export default async function BlockPage({ params }: Props) {
  const { slug } = await params;
  const entry = getBlock(slug);
  if (!entry) notFound();

  return (
    <div className="mx-auto bg-background max-w-3xl px-4 py-16">
      {/* Back */}
      <Link
        prefetch={false}
        href="/blocks"
        className="inline-flex items-center gap-1.5   text-[12px] text-muted-foreground hover:text-foreground transition-colors mb-8"
      >
        <ArrowLeft className="size-3" />
        Blocks
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

      {/* Install command */}
      <div className="mb-8">
        <p className="mb-2   text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
          Installation
        </p>
        <InstallCommand name={entry.name} />
      </div>

      {/* Preview + Code tabs */}
      <RegistryPreview
        source={entry.content}
        componentName={entry.name}
        type="block"
      />

      {/* File tree — show all files in the block */}
      {entry.files.length > 1 && (
        <div className="mt-10">
          <p className="mb-3   text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
            Files
          </p>
          <div className="border border-border">
            {entry.files.map((file, i) => (
              <div
                key={file.path}
                className={`flex items-center gap-2 px-3 py-2 ${
                  i < entry.files.length - 1 ? "border-b border-border" : ""
                }`}
              >
                <span className="  text-[12px] text-muted-foreground">
                  {file.type === "registry:block" ? "block" : "file"}
                </span>
                <span className="  text-[12px] text-foreground">
                  {file.path}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Dependencies */}
      {entry.dependencies.length > 0 && (
        <div className="mt-10">
          <p className="mb-2   text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
            Dependencies
          </p>
          <div className="flex flex-wrap gap-2">
            {entry.dependencies.map((dep) => (
              <span
                key={dep}
                className="border border-border px-2 py-1   text-[12px] text-foreground"
              >
                {dep}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
