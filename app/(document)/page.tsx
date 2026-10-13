import { AgentWorkshop } from "@/components/profile/agent-workshop";
import { PinnedSection } from "@/components/profile/card-catalog/pinned-section";
import { ContactRow } from "@/components/profile/contact-row";
import { ExperienceSection } from "@/components/profile/experience/experience-section";
import { ExperimentsSection } from "@/components/profile/experiments-section";
import { HowIWork } from "@/components/profile/how-i-work/how-i-work-section";
import { MatrixSection } from "@/components/profile/matrix/matrix-section";
import { ProfileIntro } from "@/components/profile/profile-intro";
import { JsonLd } from "@/components/site/json-ld";
import { getGithubProfile } from "@/lib/site/github-profile";
import { buildPageMetadata, pageSeo } from "@/lib/site/seo";
import { homeJsonLd } from "@/lib/site/structured-data";

export const revalidate = 3600;

export const metadata = buildPageMetadata(pageSeo.home);

const HomePage = async () => {
  const { profile } = await getGithubProfile();

  return (
    <>
      <JsonLd data={homeJsonLd()} />
      <ProfileIntro identity={profile.identity} />
      <ExperienceSection />
      <PinnedSection repositories={profile.pinned} />
      <MatrixSection calendars={profile.calendars} />
      <HowIWork />
      <AgentWorkshop />
      <ExperimentsSection />
      <ContactRow />
    </>
  );
};

export default HomePage;
