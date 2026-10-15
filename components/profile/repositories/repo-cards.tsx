import { CornerMarks } from "@/components/site/corner-marks";

import { RepoCardStack } from "./repo-card-stack";
import type { RepositorySpecimen } from "./repositories";
import {
  RepositoryDescription,
  RepositoryHeading,
  RepositoryTopics,
} from "./repository-facts";
import { RepositoryLink } from "./repository-link";

const Stamp = ({ children }: { children: string }) => (
  <span className="label border-ink text-ink outline-ink/40 inline-block border-2 px-2 py-1 tabular-nums outline outline-offset-1 odd:-rotate-3 even:rotate-2">
    {children}
  </span>
);

const ordinalOf = (index: number) => String(index + 1).padStart(2, "0");

const CardTab = ({ specimen }: { specimen: RepositorySpecimen }) => (
  <>
    <span>{ordinalOf(specimen.index)}</span>
    <span className="truncate max-sm:hidden">
      <span className="opacity-60">{specimen.owner}/</span>
      {specimen.name}
    </span>
    <span className="ml-auto sm:hidden">{specimen.languageCode}</span>
  </>
);

const RepoCard = ({ specimen }: { specimen: RepositorySpecimen }) => (
  <RepositoryLink
    className="bg-paper border-rule-strong block size-full cursor-pointer border text-left transition-transform duration-150 active:scale-99"
    specimen={specimen}
  >
    <span className="relative flex h-full flex-col">
      <CornerMarks />
      <span className="flex items-start justify-between gap-4 px-5 pt-5 sm:px-6 sm:pt-6">
        <span className="label text-mist tabular-nums">
          {specimen.file.code}
        </span>
        <span className="flex shrink-0 gap-2">
          <Stamp>{specimen.language}</Stamp>
          <Stamp>{`★ ${specimen.stars}`}</Stamp>
        </span>
      </span>
      <span className="flex flex-1 flex-col gap-4 px-5 pt-6 pb-6 sm:px-6 sm:pt-10">
        <RepositoryHeading
          className="font-mono text-3xl leading-none tracking-tight sm:text-5xl"
          specimen={specimen}
        />
        <RepositoryDescription className="max-w-prose" specimen={specimen} />
        <RepositoryTopics specimen={specimen} />
      </span>
      <span className="label border-rule bg-rule grid grid-cols-3 gap-px border-t tabular-nums">
        <span className="bg-paper text-graphite px-5 py-3 sm:px-6">
          {specimen.forks} {specimen.forks === 1 ? "fork" : "forks"}
        </span>
        <span className="bg-paper text-graphite truncate px-5 py-3 sm:px-6">
          {specimen.pushed}
        </span>
        <span className="bg-paper text-ink px-5 py-3 text-right sm:px-6">
          Open ↗
        </span>
      </span>
    </span>
  </RepositoryLink>
);

export const RepoCards = ({
  specimens,
}: {
  specimens: readonly RepositorySpecimen[];
}) => {
  const stars = specimens.reduce(
    (total, specimen) => total + specimen.stars,
    0
  );
  return (
    <RepoCardStack
      cards={specimens.map((specimen) => ({
        card: <RepoCard specimen={specimen} />,
        id: specimen.id,
        tab: <CardTab specimen={specimen} />,
      }))}
      footer={
        <p className="label text-mist flex justify-between gap-4 tabular-nums">
          <span>
            {specimens.length} repositories · ★ {stars}
          </span>
          <span>Hover a tab · open the repo</span>
        </p>
      }
    />
  );
};
