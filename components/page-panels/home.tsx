import { TableOfContents } from "@/components/content/table-of-contents";
import { AsidePanel, PageAside } from "@/components/site/page-aside";
import { homeSections } from "@/lib/site/config";
import { toHeadings } from "@/lib/site/sections";

const homeHeadings = toHeadings(homeSections);

export const HomePanels = () => (
  <PageAside code="GH-00" label="Index">
    <AsidePanel collapsible jp="目次" label="On this page">
      <TableOfContents headings={homeHeadings} />
    </AsidePanel>
  </PageAside>
);
