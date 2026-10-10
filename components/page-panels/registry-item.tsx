import { TableOfContents } from "@/components/content/table-of-contents";
import { DossierPanel } from "@/components/site/compact-dossier";
import { LeaderList, LeaderRow } from "@/components/site/leader-list";
import { PageAside } from "@/components/site/page-aside";
import { getRegistryItem, toCategoryLabel } from "@/lib/registry/registry";
import { siteConfig } from "@/lib/site/config";
import { registrySectionsOf, toHeadings } from "@/lib/site/sections";

export const RegistryItemPanels = ({ slug }: { slug: string }) => {
  const item = getRegistryItem(slug);
  if (!item) {
    return null;
  }
  return (
    <PageAside code="REG-02" label="Component details">
      <DossierPanel collapsible jp="仕様" label="Facts">
        <LeaderList>
          <LeaderRow jp="種別" label="Type">
            {item.type}
          </LeaderRow>
          <LeaderRow jp="分類" label="Category">
            {item.categories.map(toCategoryLabel).join(" / ")}
          </LeaderRow>
          <LeaderRow jp="名称" label="Name">
            {`${siteConfig.registryNamespace}/${item.name}`}
          </LeaderRow>
          <LeaderRow jp="ファイル" label="Files">
            {String(item.files.length).padStart(2, "0")}
          </LeaderRow>
        </LeaderList>
      </DossierPanel>
      <DossierPanel collapsible jp="目次" label="On this page">
        <TableOfContents headings={toHeadings(registrySectionsOf(item))} />
      </DossierPanel>
    </PageAside>
  );
};
