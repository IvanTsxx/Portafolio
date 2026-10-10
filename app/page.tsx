import { ActivityOverview } from "@/components/profile/activity-overview";
import { ActivityTimeline } from "@/components/profile/activity-timeline";
import { AiPractice } from "@/components/profile/ai-practice";
import { ContactRow } from "@/components/profile/contact-row";
import { ContributionMatrix } from "@/components/profile/contribution-matrix";
import { IdentityDossier } from "@/components/profile/identity-dossier";
import { LanguageSpectrum } from "@/components/profile/language-spectrum";
import { PinnedRepositories } from "@/components/profile/pinned-repositories";
import { ProfileHero } from "@/components/profile/profile-hero";
import { StackSheet } from "@/components/profile/stack-sheet";
import { loadGithubProfile } from "@/lib/github/profile";

export const revalidate = 3600;

const HomePage = async () => {
  const { profile, source } = await loadGithubProfile();

  return (
    <div className="flex-1">
      <ProfileHero
        fetchedAt={profile.fetchedAt}
        identity={profile.identity}
        source={source}
      />
      <div className="mx-auto grid w-full max-w-screen-2xl gap-x-6 gap-y-16 px-4 pb-24 md:px-8 lg:grid-cols-12">
        <aside
          aria-label="Profile"
          className="min-w-0 lg:sticky lg:top-16 lg:col-span-4 lg:self-start"
        >
          <IdentityDossier identity={profile.identity} />
        </aside>
        <div className="flex min-w-0 flex-col gap-16 lg:col-span-8">
          <PinnedRepositories repositories={profile.pinned} />
          <LanguageSpectrum repositories={profile.pinned} />
          <ContributionMatrix calendars={profile.calendars} />
          <ActivityOverview activity={profile.activity} />
          <ActivityTimeline months={profile.timeline} />
        </div>
      </div>
      <div className="mx-auto flex w-full max-w-screen-2xl flex-col gap-16 px-4 pb-24 md:px-8">
        <AiPractice />
        <StackSheet />
        <ContactRow />
      </div>
    </div>
  );
};

export default HomePage;
