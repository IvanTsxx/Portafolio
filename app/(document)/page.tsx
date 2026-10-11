import { AgentWorkshop } from "@/components/profile/agent-workshop";
import { ContactRow } from "@/components/profile/contact-row";
import { ContributionMatrix } from "@/components/profile/contribution-matrix";
import { HowIWork } from "@/components/profile/how-i-work";
import { ProfileHero } from "@/components/profile/profile-hero";
import { TimelineSection } from "@/components/profile/timeline/timeline-section";
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
      <TimelineSection repositories={profile.pinned} />
      <ContributionMatrix calendars={profile.calendars} />
      <HowIWork />
      <AgentWorkshop />
      <ContactRow />
    </>
  );
};

export default HomePage;
