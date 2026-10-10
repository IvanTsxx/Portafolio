import { ArrowUpRightIcon } from "@phosphor-icons/react/dist/ssr";

import { TableOfContents } from "@/components/content/table-of-contents";
import { DossierPanel } from "@/components/site/compact-dossier";
import { LeaderList, LeaderRow } from "@/components/site/leader-list";
import { PageAside } from "@/components/site/page-aside";
import { linkClassName } from "@/components/site/styles";
import { experiments, getExperiment } from "@/lib/lab/experiments";
import { experimentSectionsOf } from "@/lib/site/sections";
import { cn } from "@/lib/utils";

export const dynamicParams = false;

export const generateStaticParams = () =>
  experiments.map((experiment) => ({ slug: experiment.slug }));

const ExperimentAside = async ({ params }: PageProps<"/lab/[slug]">) => {
  const { slug } = await params;
  const experiment = getExperiment(slug);
  if (!experiment) {
    return null;
  }
  return (
    <PageAside code="LAB-02" label="Experiment details">
      <DossierPanel collapsible jp="仕様" label="Facts">
        <LeaderList>
          <LeaderRow jp="年" label="Year">
            {experiment.year}
          </LeaderRow>
          <LeaderRow jp="分野" label="Topics">
            {experiment.topics.join(" / ")}
          </LeaderRow>
          <LeaderRow jp="操作" label="Controls">
            {experiment.hasControls ? "Panel" : "Direct"}
          </LeaderRow>
          <LeaderRow jp="出典" label="Source">
            {experiment.sourceUrl ? (
              <a
                className={cn(linkClassName, "inline-flex items-center gap-1")}
                href={experiment.sourceUrl}
                rel="noreferrer"
                target="_blank"
              >
                View
                <ArrowUpRightIcon aria-hidden className="size-3.5" />
              </a>
            ) : (
              "Unpublished"
            )}
          </LeaderRow>
        </LeaderList>
      </DossierPanel>
      <DossierPanel collapsible jp="目次" label="On this page">
        <TableOfContents headings={experimentSectionsOf(experiment)} />
      </DossierPanel>
    </PageAside>
  );
};

export default ExperimentAside;
