import { HomePanels } from "@/components/page-panels/home";
import { AgentWorkshop } from "@/components/profile/agent-workshop";
import { ContactRow } from "@/components/profile/contact-row";
import { ContributionMatrix } from "@/components/profile/contribution-matrix";
import { ExperienceSection } from "@/components/profile/experience-stairs/experience-section";
import { HowIWork } from "@/components/profile/how-i-work";
import { ProfileIntro } from "@/components/profile/profile-intro";
import { PinnedSection } from "@/components/profile/repo-shelf/pinned-section";
import { getGithubProfile } from "@/lib/site/github-profile";

export const revalidate = 3600;

const HomePage = async () => {
  const { profile, source } = await getGithubProfile();

  return (
    <>
      <ProfileIntro
        fetchedAt={profile.fetchedAt}
        identity={profile.identity}
        source={source}
      />
      <HomePanels />
      <ExperienceSection />
      <PinnedSection repositories={profile.pinned} />
      <ContributionMatrix calendars={profile.calendars} />
      <HowIWork />
      <AgentWorkshop />
      <ContactRow />
    </>
  );
};

export default HomePage;
