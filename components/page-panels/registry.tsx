import { RegistryFilters } from "@/components/registry-docs/registry-browser";
import { AsidePanel, PageAside } from "@/components/site/page-aside";
import { getRegistryCategories, registryItems } from "@/lib/registry/registry";

export const RegistryPanels = () => (
  <PageAside code="REG-02" label="Registry filters">
    <AsidePanel collapsible jp="絞込" label="Filter">
      <RegistryFilters
        categories={getRegistryCategories()}
        total={registryItems.length}
      />
    </AsidePanel>
  </PageAside>
);
