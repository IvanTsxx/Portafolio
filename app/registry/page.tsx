import type { Metadata } from "next";

import { ItemStyles } from "@/components/registry-docs/item-styles";
import { loadDemoModule } from "@/components/registry-docs/load-demo";
import { RegistryBrowser } from "@/components/registry-docs/registry-browser";
import {
  getRegistryItemUrl,
  registryUrlTemplate,
} from "@/lib/registry/install";
import {
  formatRegistryIndex,
  getRegistryCategories,
  registryItems,
  toCategoryLabel,
} from "@/lib/registry/registry";
import { siteConfig } from "@/lib/site/config";
import { TechnicalGrid } from "@/registry/ivan/ui/technical-grid";

export const metadata: Metadata = {
  description: `Installable shadcn components for technical, industrial interfaces. Add any item with the shadcn CLI from ${registryUrlTemplate}.`,
  title: "Registry",
};

const RegistryPage = async () => {
  const entries = await Promise.all(
    registryItems.map(async (item, position) => {
      const { Thumbnail } = await loadDemoModule(item.name);
      return {
        categories: item.categories.map((id) => ({
          id,
          label: toCategoryLabel(id),
        })),
        description: item.description,
        index: formatRegistryIndex(position),
        name: item.name,
        thumbnail: <Thumbnail />,
        title: item.title,
      };
    })
  );

  return (
    <>
      <ItemStyles items={registryItems} />
      <section className="border-rule relative isolate overflow-hidden border-b">
        <TechnicalGrid
          className="absolute inset-0"
          fade="edges"
          markers={false}
          nodes={4}
          scanDuration={12}
        />
        <div className="relative mx-auto flex w-full max-w-screen-2xl flex-col gap-6 px-4 py-16 md:px-6 md:py-24">
          <p className="label text-clay">03 · Registry</p>
          <h1 className="display max-w-3xl text-5xl md:text-7xl">
            Components you can install
          </h1>
          <p className="text-muted-foreground max-w-prose text-base text-pretty">
            {registryItems.length} self contained shadcn items for technical,
            industrial interfaces. Each one carries its own tokens and
            keyframes, respects reduced motion and installs with one command.
          </p>
          <div className="flex w-fit max-w-full flex-col gap-2">
            {[
              `bunx --bun shadcn@latest add ${getRegistryItemUrl("<name>")}`,
              `bunx --bun shadcn@latest add ${siteConfig.registryNamespace}/<name>`,
            ].map((command) => (
              <code
                className="border-rule bg-card overflow-x-auto border px-4 py-3 font-mono text-xs whitespace-nowrap"
                key={command}
              >
                <span aria-hidden="true" className="text-clay select-none">
                  ${" "}
                </span>
                {command}
              </code>
            ))}
          </div>
        </div>
      </section>
      <section
        aria-label="Registry components"
        className="mx-auto w-full max-w-screen-2xl px-4 py-12 md:px-6"
      >
        <RegistryBrowser
          categories={getRegistryCategories()}
          entries={entries}
        />
      </section>
    </>
  );
};

export default RegistryPage;
