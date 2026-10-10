import { ActivityOverview } from "@/components/profile/activity-overview";
import { ActivityTimeline } from "@/components/profile/activity-timeline";
import { AiPractice } from "@/components/profile/ai-practice";
import { ContactRow } from "@/components/profile/contact-row";
import { ContributionMatrix } from "@/components/profile/contribution-matrix";
import { ExperienceLedger } from "@/components/profile/experience-ledger";
import { IdentityDossier } from "@/components/profile/identity-dossier";
import { LanguageSpectrum } from "@/components/profile/language-spectrum";
import { PinnedRepositories } from "@/components/profile/pinned-repositories";
import { ProfileHero } from "@/components/profile/profile-hero";
import { StackSheet } from "@/components/profile/stack-sheet";
import { DocumentLayout } from "@/components/site/document-layout";
import { loadGithubProfile } from "@/lib/github/profile";

export const revalidate = 3600;

const HomePage = async () => {
  const { profile, source } = await loadGithubProfile();

  return (
    <DocumentLayout
      after={
        <>
          <AiPractice />
          <StackSheet />
          <ContactRow />
        </>
      }
      dossier={<IdentityDossier identity={profile.identity} />}
      dossierLabel="Profile"
      hero={
        <ProfileHero
          fetchedAt={profile.fetchedAt}
          identity={profile.identity}
          source={source}
        />
      }
    >
      <ExperienceLedger />
      <PinnedRepositories repositories={profile.pinned} />
      <LanguageSpectrum repositories={profile.pinned} />
      <ContributionMatrix calendars={profile.calendars} />
      <ActivityOverview activity={profile.activity} />
      <ActivityTimeline months={profile.timeline} />
    </DocumentLayout>
  );
};

export default HomePage;
