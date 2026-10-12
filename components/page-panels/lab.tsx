import { LabTopicFilter } from "@/components/lab/lab-archive";
import { AsidePanel, PageAside } from "@/components/site/page-aside";
import { activeTopics, experiments } from "@/lib/lab/experiments";

const topicCounts = activeTopics.map((topic) => ({
  count: experiments.filter((experiment) => experiment.topics.includes(topic))
    .length,
  topic,
}));

export const LabPanels = () => (
  <PageAside code="LAB-02" label="Lab filters">
    <AsidePanel collapsible jp="絞込" label="Filter">
      <LabTopicFilter topics={topicCounts} total={experiments.length} />
    </AsidePanel>
  </PageAside>
);
