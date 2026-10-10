import { StarIcon } from "@phosphor-icons/react/ssr";
import { cva } from "class-variance-authority";

import { AgentSpot } from "@/components/scene/agent-spot";
import type {
  PinnedRepository,
  RepositoryVisibility,
} from "@/lib/github/model";
import { cn } from "@/lib/utils";

import { profileAgentSpots } from "./agent-spots";
import { LanguageSwatch } from "./language-swatch";
import { PanelCount, SectionFrame } from "./section-frame";

const PINNED_LIMIT = 6;

const visibilityLabels: Record<
  RepositoryVisibility,
  { en: string; jp: string }
> = {
  private: { en: "Private", jp: "非公開" },
  public: { en: "Public", jp: "公開" },
  "public-template": { en: "Public template", jp: "公開雛形" },
};

const specimen = cva(
  "group border-rule ease-mechanical pointer-fine:hover:bg-paper-deep/60 focus-visible:bg-paper-deep/60 relative flex h-full flex-col gap-4 border-r border-b p-4 transition-colors duration-100 md:p-5",
  {
    variants: {
      visibility: {
        private: "bg-paper-deep/40",
        public: "",
        "public-template": "hatch",
      } satisfies Record<RepositoryVisibility, string>,
    },
  }
);

const visibilityBadge = cva("label border px-1.5 py-0.5", {
  variants: {
    visibility: {
      private: "border-graphite bg-graphite text-paper",
      public: "border-rule-strong text-graphite",
      "public-template": "border-rule-strong text-ink border-dashed",
    } satisfies Record<RepositoryVisibility, string>,
  },
});

const corners = [
  "top-1.5 left-1.5 border-t border-l",
  "top-1.5 right-1.5 border-t border-r",
  "bottom-1.5 left-1.5 border-b border-l",
  "right-1.5 bottom-1.5 border-r border-b",
] as const;

const RepositorySpecimen = ({
  id,
  repository,
}: {
  id: string;
  repository: PinnedRepository;
}) => {
  const visibility = visibilityLabels[repository.visibility];
  return (
    <a
      className={specimen({ visibility: repository.visibility })}
      href={`https://github.com/${repository.nameWithOwner}`}
      rel="noopener"
      target="_blank"
    >
      {corners.map((corner) => (
        <span
          aria-hidden
          className={cn(
            "border-ink ease-mechanical absolute size-2 opacity-0 transition-opacity duration-100 group-hover:opacity-100 group-focus-visible:opacity-100",
            corner
          )}
          key={corner}
        />
      ))}
      <span className="label flex items-baseline justify-between gap-3">
        <span className="text-mist tabular-nums">{id}</span>
        <span
          className={visibilityBadge({ visibility: repository.visibility })}
        >
          {visibility.en} <span className="jp">{visibility.jp}</span>
        </span>
      </span>
      <span className="text-ink text-lg leading-tight font-medium tracking-tight wrap-break-word">
        {repository.name}
      </span>
      <span
        className={cn(
          "flex-1",
          repository.description
            ? "text-graphite text-sm leading-relaxed text-pretty"
            : "label text-mist"
        )}
      >
        {repository.description ?? "No description / 記述なし"}
      </span>
      <span className="label border-rule text-ink flex items-center justify-between gap-3 border-t pt-3 tabular-nums">
        <span className="flex items-center gap-2">
          <LanguageSwatch className="size-3" language={repository.language} />
          {repository.language ?? "Unknown"}
        </span>
        <span
          aria-label={`${repository.stars} stars`}
          className="flex items-center gap-1.5"
        >
          <StarIcon aria-hidden className="size-3" />
          {String(repository.stars).padStart(2, "0")}
        </span>
      </span>
    </a>
  );
};

export const PinnedRepositories = ({
  repositories,
}: {
  repositories: readonly PinnedRepository[];
}) => (
  <SectionFrame
    aside={<PanelCount current={repositories.length} total={PINNED_LIMIT} />}
    id="pinned"
    index="GH-03"
    jp="固定標本"
    label="Pinned specimens"
  >
    <ul className="border-rule grid border-t border-l sm:grid-cols-2">
      {repositories.map((repository, index) => (
        <li className="relative" key={repository.nameWithOwner}>
          <RepositorySpecimen
            id={`P-${String(index + 1).padStart(2, "0")}`}
            repository={repository}
          />
          {index === 0 && <AgentSpot {...profileAgentSpots.pinned} />}
        </li>
      ))}
    </ul>
  </SectionFrame>
);
