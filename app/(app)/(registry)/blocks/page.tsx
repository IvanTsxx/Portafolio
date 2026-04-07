import type { Metadata } from "next";

import { ShadcnInstallCommandFlip } from "@/shared/components/shadcn-install-command-flip";
import { getBlocks } from "@/shared/lib/registry";

import { RegistryCard } from "../_components/registry-card";
import { RegistryPreview } from "../_components/registry-preview";

export const metadata: Metadata = {
  description: "Full-page sections and layout blocks. Install via shadcn CLI.",
  title: "Blocks",
};

export default function BlocksPage() {
  const blocks = getBlocks();

  return (
    <div className="mx-auto max-w-3xl bg-background/85 dark:bg-transparent px-4 py-16">
      {/* Page header */}
      <div className="mb-10 border-t border-border pt-4">
        <div className="flex flex-col items-start gap-3 w-full">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-foreground">
              Blocks ({blocks.length})
            </h1>
            <p className="mt-1 text-[13px] text-muted-foreground">
              Full-page sections and layout blocks ready to drop into your app.
            </p>
          </div>
          <div className="flex items-center w-full gap-2">
            <ShadcnInstallCommandFlip
              names={blocks.map((block) => block.name)}
            />
          </div>
        </div>
      </div>

      {blocks.length === 0 ? (
        <p className="  text-[13px] text-muted-foreground">No blocks yet.</p>
      ) : (
        <div className="grid grid-cols-1 gap-px bg-border overflow-hidden">
          {blocks.map((entry) => (
            <div key={entry.name} className="bg-background overflow-hidden">
              <RegistryCard
                entry={{
                  description: entry.description,
                  name: entry.name,
                  preview: (
                    <RegistryPreview
                      componentName={entry.name}
                      source={entry.content}
                      type="block"
                    />
                  ),

                  title: entry.title,
                  type: "block",
                }}
                basePath="/blocks"
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
