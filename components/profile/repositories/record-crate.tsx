import { cn } from "@/lib/utils";

import { CrateStage } from "./crate-stage";
import type { RepositorySpecimen } from "./repositories";
import {
  RepositoryDescription,
  RepositoryFacts,
  RepositoryHeading,
  RepositoryTopics,
} from "./repository-facts";
import { RepositoryLink } from "./repository-link";
import { COVER_CELLS, sleeveCoverOf } from "./sleeve-cover";
import { swatchClassNames } from "./swatch";

const SleeveCover = ({ specimen }: { specimen: RepositorySpecimen }) => (
  <svg
    aria-hidden
    className="text-ink size-full [shape-rendering:crispEdges]"
    preserveAspectRatio="xMidYMid slice"
    viewBox={`0 0 ${COVER_CELLS} ${COVER_CELLS}`}
  >
    <path
      d={sleeveCoverOf(specimen.id, specimen.language)}
      fill="currentColor"
    />
  </svg>
);

const Sleeve = ({ specimen }: { specimen: RepositorySpecimen }) => (
  <RepositoryLink
    className="border-ink bg-paper flex size-full flex-col border"
    specimen={specimen}
  >
    <span
      className={cn(
        swatchClassNames[specimen.swatch],
        "label flex h-7 shrink-0 items-center gap-2 px-3 tabular-nums"
      )}
    >
      <span className="min-w-0 truncate">
        <span className="opacity-60">{specimen.owner}/</span>
        {specimen.name}
      </span>
      <span className="ml-auto shrink-0">★{specimen.stars}</span>
      <span className="shrink-0">{specimen.languageCode}</span>
    </span>
    <span className="bg-paper-deep relative min-h-0 flex-1">
      <SleeveCover specimen={specimen} />
      <span className="label bg-paper text-ink border-ink absolute bottom-3 left-3 border px-1.5 py-0.5">
        {specimen.language}
      </span>
    </span>
  </RepositoryLink>
);

const SleeveNote = ({
  count,
  specimen,
}: {
  count: number;
  specimen: RepositorySpecimen;
}) => (
  <div className="border-rule-strong flex w-full flex-col gap-4 border-t pt-4">
    <p className="label text-mist flex justify-between gap-4 tabular-nums">
      <span>
        Pulled {String(specimen.index + 1).padStart(2, "0")} /{" "}
        {String(count).padStart(2, "0")}
      </span>
      <span>{specimen.visibility}</span>
    </p>
    <RepositoryHeading className="text-3xl" specimen={specimen} />
    <RepositoryDescription className="max-w-prose" specimen={specimen} />
    <RepositoryTopics specimen={specimen} />
    <RepositoryFacts className="sm:grid-cols-4" specimen={specimen} />
  </div>
);

export const RecordCrate = ({
  specimens,
}: {
  specimens: readonly RepositorySpecimen[];
}) => (
  <CrateStage
    band={
      <>
        <span className="label text-ink">Crate</span>
        <span className="label text-mist tabular-nums">
          {String(specimens.length).padStart(2, "0")} records
        </span>
      </>
    }
    notes={specimens.map((specimen) => ({
      id: specimen.id,
      node: <SleeveNote count={specimens.length} specimen={specimen} />,
    }))}
    sleeves={specimens.map((specimen) => ({
      id: specimen.id,
      node: <Sleeve specimen={specimen} />,
    }))}
  />
);
