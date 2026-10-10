import type { Metadata } from "next";

import { CommandLine } from "@/components/registry-docs/command-line";
import { ItemStyles } from "@/components/registry-docs/item-styles";
import { loadDemoModule } from "@/components/registry-docs/load-demo";
import { RegistryBrowser } from "@/components/registry-docs/registry-browser";
import { PageHeader } from "@/components/site/page-header";
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
  description: `Installable shadcn components. Add any item from ${registryUrlTemplate}.`,
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
      <div className="relative isolate overflow-hidden">
        <TechnicalGrid
          className="absolute inset-0"
          fade="bottom"
          markers={false}
          nodes={4}
          scan="none"
        />
        <PageHeader
          code="REG-00"
          jp="登録簿"
          lede="Install with one command"
          meta={[
            {
              label: "Items",
              value: String(registryItems.length).padStart(2, "0"),
            },
          ]}
          title="Registry"
        />
        <div className="relative mx-auto flex w-full max-w-screen-2xl flex-col gap-2 px-4 pb-14 md:px-8">
          <CommandLine
            command={`bunx --bun shadcn@latest add ${getRegistryItemUrl("<name>")}`}
          />
          <CommandLine
            command={`bunx --bun shadcn@latest add ${siteConfig.registryNamespace}/<name>`}
          />
        </div>
      </div>
      <section
        aria-label="Registry components"
        className="mx-auto w-full max-w-screen-2xl px-4 pb-8 md:px-8"
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
