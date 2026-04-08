import type { Metadata } from "next";

import { ShadcnInstallCommandFlip } from "@/shared/components/shadcn-install-command-flip";
import { getPages } from "@/shared/lib/registry";

import { RegistryCard } from "../_components/registry-card";
import { RegistryPreview } from "../_components/registry-preview";

export const metadata: Metadata = {
  description: "Full-page sections and layout pages. Install via shadcn CLI.",
  title: "Pages",
};

export default function PagesPage() {
  const pages = getPages();

  return (
    <div className="mx-auto max-w-3xl bg-background/85 dark:bg-transparent px-4 py-16">
      {/* Page header */}
      <div className="mb-10 border-t bg-background border-border pt-4">
        <div className="flex flex-col items-start gap-3 w-full">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-foreground">
              Pages ({pages.length})
            </h1>
            <p className="mt-1 text-[13px] text-muted-foreground">
              Full-page sections and layout pages ready to drop into your app.
            </p>
          </div>
          <div className="flex items-center w-full gap-2">
            <ShadcnInstallCommandFlip names={pages.map((page) => page.name)} />
          </div>
        </div>
      </div>

      {pages.length === 0 ? (
        <p className="  text-[13px] text-muted-foreground">No pages yet.</p>
      ) : (
        <div className="grid grid-cols-1 gap-px bg-border overflow-hidden">
          {pages.map((entry) => (
            <div key={entry.name} className="bg-background overflow-hidden">
              <RegistryCard
                entry={{
                  description: entry.description,
                  name: entry.name,
                  preview: (
                    <RegistryPreview
                      componentName={entry.name}
                      source={entry.content}
                      type="page"
                    />
                  ),

                  title: entry.title,
                  type: "page",
                }}
                basePath="/pages"
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
