import { LeaderList, LeaderRow } from "@/components/site/leader-list";
import { AsidePanel, PageAside } from "@/components/site/page-aside";
import { SectionRail } from "@/components/site/section-rail";
import { linkClassName } from "@/components/site/styles";
import { loadDesignMarkdown } from "@/lib/design-system/load";
import {
  documentCode,
  rawMarkdownPath,
  sectionSpecs,
} from "@/lib/design-system/sections";

const bytesPerKilobyte = 1024;

export const DesignSystemPanels = async () => {
  const markdown = await loadDesignMarkdown();
  const kilobytes = (
    new TextEncoder().encode(markdown).length / bytesPerKilobyte
  ).toFixed(1);

  return (
    <>
      <SectionRail sections={sectionSpecs} />
      <PageAside code={documentCode} label="Design system index">
        <AsidePanel jp="出力" label="Export">
          <LeaderList>
            <LeaderRow jp="容量" label="Size">
              {kilobytes} KB
            </LeaderRow>
            <LeaderRow jp="原文" label="Raw">
              <a className={linkClassName} href={rawMarkdownPath}>
                {rawMarkdownPath}
              </a>
            </LeaderRow>
          </LeaderList>
        </AsidePanel>
      </PageAside>
    </>
  );
};
