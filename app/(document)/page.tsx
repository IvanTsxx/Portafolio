import { AgentWorkshop } from "@/components/profile/agent-workshop";
import { ExperienceSection } from "@/components/profile/experience/experience-section";
import { ExperimentsSection } from "@/components/profile/experiments-section";
import { HowIWork } from "@/components/profile/how-i-work/how-i-work-section";
import { MatrixSection } from "@/components/profile/matrix/matrix-section";
import { ProfileIntro } from "@/components/profile/profile-intro";
import { RegistrySection } from "@/components/profile/registry-section";
import { ReposSection } from "@/components/profile/repositories/repos-section";
import { JsonLd } from "@/components/site/json-ld";
import { getGithubProfile } from "@/lib/site/github-profile";
import { buildPageMetadata, pageSeo } from "@/lib/site/seo";
import { homeJsonLd } from "@/lib/site/structured-data";

export const metadata = buildPageMetadata(pageSeo.home);

const HomePage = async () => {
  const { profile } = await getGithubProfile();

  return (
    <>
      <JsonLd data={homeJsonLd()} />
      <ProfileIntro identity={profile.identity} />
      <ExperienceSection />
      <MatrixSection calendars={profile.calendars} />
      <ExperimentsSection />
      <HowIWork />
      <ReposSection repositories={profile.pinned} />
      <RegistrySection />
      <AgentWorkshop />
    </>
  );
};

export default HomePage;
