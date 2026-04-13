import type { Metadata } from "next";

import { BreadcrumbJsonLd } from "@/shared/components/json-ld";
import { ShadcnInstallCommandFlip } from "@/shared/components/shadcn-install-command-flip";
import { SITE } from "@/shared/config/site";
import { getComponents } from "@/shared/lib/registry";

import { RegistryCard } from "../_components/registry-card";
import { RegistryPreview } from "../_components/registry-preview";

export const metadata: Metadata = {
  alternates: {
    canonical: "/components",
  },
  description:
    "Reusable components built for the modern web. Install via shadcn CLI.",
  openGraph: {
    description:
      "Reusable components built for the modern web. Install via shadcn CLI.",
    siteName: SITE.name,
    title: "Components",
    type: "website",
    url: `${SITE.url}/components`,
  },
  title: "Components",
  twitter: {
    card: "summary_large_image",
  },
};

export default async function ComponentsPage() {
  const components = await getComponents();

  return (
    <section className="py-10">
      <BreadcrumbJsonLd
        items={[
          { name: "Home", url: SITE.url },
          { name: "Components", url: `${SITE.url}/components` },
        ]}
      />
      {/* Page header */}
      <div className="mb-10 border-t bg-background border-border pt-4">
        <div className="flex flex-col items-start gap-3 w-full">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-foreground">
              Components ({components.length})
            </h1>
            <p className="mt-1 text-[13px] text-muted-foreground">
              Reusable components built for the modern web. Install via shadcn
              CLI.
            </p>
          </div>
          <div className="flex w-full items-center gap-2">
            <ShadcnInstallCommandFlip
              names={components.map((component) => `${component.name}.json`)}
            />
          </div>
        </div>
      </div>

      {components.length === 0 ? (
        <p className="text-[13px] text-muted-foreground">No components yet.</p>
      ) : (
        <div className="grid grid-cols-1 gap-px">
          {components.map((entry) => (
            <div key={entry.name} className="bg-background">
              <RegistryCard
                entry={{
                  description: entry.description,
                  name: entry.name,
                  preview: (
                    <RegistryPreview
                      type="component"
                      source={entry.content}
                      componentName={entry.name}
                    />
                  ),

                  title: entry.title,
                  type: "component",
                }}
                basePath="/components"
              />
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
