import { RegistryFilters } from "@/components/registry-docs/registry-browser";
import { DossierPanel } from "@/components/site/compact-dossier";
import { PageAside } from "@/components/site/page-aside";
import { getRegistryCategories, registryItems } from "@/lib/registry/registry";

const RegistryAside = () => (
  <PageAside code="REG-02" label="Registry filters">
    <DossierPanel collapsible jp="絞込" label="Filter">
      <RegistryFilters
        categories={getRegistryCategories()}
        total={registryItems.length}
      />
    </DossierPanel>
  </PageAside>
);

export default RegistryAside;
