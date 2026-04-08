import OpenSourceContributionsCard from "@/shared/components/github/contribution-card";
import { LoadMoreItemsWrapper } from "@/shared/components/load-more-items-wrapper";
import type { ProcessedContribution } from "@/shared/lib/github";
import { fetchUserPullRequests } from "@/shared/lib/github";

import { SectionHeader } from "./section-header";

export const GitHubOpenSource = async () => {
  const username = "IvanTsxx";
  const limit = 50;

  const contributions = await fetchUserPullRequests(username, {
    fromYear: 2025,
    includeOwnRepos: false,
    limit,
    toYear: 2026,
  });

  let data: {
    success: boolean;
    contributions: ProcessedContribution[];
    count: number;
  };

  // oxlint-disable-next-line no-unused-expressions
  !contributions
    ? (data = {
        contributions: [],
        count: 0,
        success: false,
      })
    : (data = {
        contributions,
        count: contributions.length,
        success: true,
      });

  return (
    <section>
      <SectionHeader label="Open Source Contributions" />
      <LoadMoreItemsWrapper max={3}>
        {data.contributions.map((contribution, index) => (
          <OpenSourceContributionsCard
            key={contribution.title}
            contribution={contribution}
            index={index}
          />
        ))}
      </LoadMoreItemsWrapper>
    </section>
  );
};
