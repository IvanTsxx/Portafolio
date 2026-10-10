import { ActivityOverview } from "@/components/profile/activity-overview";
import { ActivityTimeline } from "@/components/profile/activity-timeline";
import { AgentWorkshop } from "@/components/profile/agent-workshop";
import { ContactRow } from "@/components/profile/contact-row";
import { ContributionMatrix } from "@/components/profile/contribution-matrix";
import { ExperienceLedger } from "@/components/profile/experience-ledger";
import { HowIWork } from "@/components/profile/how-i-work";
import { LanguageSpectrum } from "@/components/profile/language-spectrum";
import { PinnedRepositories } from "@/components/profile/pinned-repositories";
import { ProfileHero } from "@/components/profile/profile-hero";
import { StackSheet } from "@/components/profile/stack-sheet";
import { getGithubProfile } from "@/lib/site/github-profile";

export const revalidate = 3600;

const HomePage = async () => {
  const { profile, source } = await getGithubProfile();

  return (
    <>
      <ProfileHero
        fetchedAt={profile.fetchedAt}
        identity={profile.identity}
        source={source}
      />
      <ExperienceLedger />
      <PinnedRepositories repositories={profile.pinned} />
      <LanguageSpectrum repositories={profile.pinned} />
      <ContributionMatrix calendars={profile.calendars} />
      <ActivityOverview activity={profile.activity} />
      <ActivityTimeline months={profile.timeline} />
      <HowIWork />
      <AgentWorkshop />
      <StackSheet />
      <ContactRow />
    </>
  );
};

export default HomePage;
