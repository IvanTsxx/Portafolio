import type { Metadata } from "next";

import { CommandLine } from "@/components/registry-docs/command-line";
import { ItemStyles } from "@/components/registry-docs/item-styles";
import { loadDemoModule } from "@/components/registry-docs/load-demo";
import {
  RegistryFilters,
  RegistryGrid,
} from "@/components/registry-docs/registry-browser";
import { DocumentHero } from "@/components/site/document-hero";
import { FilterFold } from "@/components/site/filter-fold";
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

export const metadata: Metadata = {
  description: `Installable shadcn components. Add any item from ${registryUrlTemplate}.`,
  title: "Registry",
};

const RegistryPage = async () => {
  const categories = getRegistryCategories();
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
      <DocumentHero
        code="REG-01"
        jp="登録簿"
        lede="Install with one command"
        meta={[
          {
            label: "Items",
            value: String(registryItems.length).padStart(2, "0"),
          },
        ]}
        title="Registry"
      >
        <div className="flex w-full flex-col gap-2">
          <CommandLine
            command={`bunx --bun shadcn@latest add ${getRegistryItemUrl("<name>")}`}
          />
          <CommandLine
            command={`bunx --bun shadcn@latest add ${siteConfig.registryNamespace}/<name>`}
          />
        </div>
      </DocumentHero>
      <FilterFold index="REG-02">
        <RegistryFilters categories={categories} total={registryItems.length} />
      </FilterFold>
      <RegistryGrid categories={categories} entries={entries} />
    </>
  );
};

export default RegistryPage;
