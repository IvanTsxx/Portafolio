import { TableOfContents } from "@/components/content/table-of-contents";
import { DossierPanel } from "@/components/site/compact-dossier";
import { LeaderList, LeaderRow } from "@/components/site/leader-list";
import { PageAside } from "@/components/site/page-aside";
import { linkClassName } from "@/components/site/styles";
import { loadDesignMarkdown } from "@/lib/design-system/load";
import { documentCode, rawMarkdownPath } from "@/lib/design-system/sections";
import { designSystemHeadings } from "@/lib/site/sections";

const bytesPerKilobyte = 1024;

export const DesignSystemPanels = async () => {
  const markdown = await loadDesignMarkdown();
  const kilobytes = (
    new TextEncoder().encode(markdown).length / bytesPerKilobyte
  ).toFixed(1);

  return (
    <PageAside code={documentCode} label="Design system index">
      <DossierPanel collapsible jp="目次" label="On this page">
        <TableOfContents headings={designSystemHeadings} />
      </DossierPanel>
      <DossierPanel jp="出力" label="Export">
        <LeaderList>
          <LeaderRow jp="形式" label="Format">
            Markdown
          </LeaderRow>
          <LeaderRow jp="容量" label="Size">
            {kilobytes} KB
          </LeaderRow>
          <LeaderRow jp="行数" label="Lines">
            {markdown.split("\n").length}
          </LeaderRow>
          <LeaderRow jp="原文" label="Raw">
            <a className={linkClassName} href={rawMarkdownPath}>
              {rawMarkdownPath}
            </a>
          </LeaderRow>
        </LeaderList>
      </DossierPanel>
    </PageAside>
  );
};
