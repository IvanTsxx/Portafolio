import { Suspense } from "react";

import { SectionHeader } from "@/app/(app)/(home)/_components/section-header";
import {
  GitHubContributionFallback,
  GitHubContributionGraph,
} from "@/shared/components/github/graph";
import { getGitHubContributions } from "@/shared/lib/github";

export async function GitHubContributions() {
  const contributions = await getGitHubContributions();
  let total = 0;

  for (const contribution of contributions) {
    total += contribution.count;
  }

  return (
    <section>
      <SectionHeader label="Activity" />
      <Suspense fallback={<GitHubContributionFallback />}>
        <GitHubContributionGraph contributions={contributions} />
      </Suspense>
    </section>
  );
}
