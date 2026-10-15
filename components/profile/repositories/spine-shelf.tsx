import { cva } from "class-variance-authority";

import { starStep } from "./repositories";
import type { RepositorySpecimen } from "./repositories";
import { RepositoryLink } from "./repository-link";
import { ShelfStage } from "./shelf-stage";

const spineHeights = ["h-44", "h-52", "h-60", "h-68", "h-76"] as const;

const spineVariants = cva(
  "group/spine ease-out-quart relative flex w-10 origin-bottom-left flex-col items-center justify-between gap-2 border py-3 transition-[translate,rotate] duration-300 hover:z-10 focus-visible:z-10 motion-safe:hover:-translate-y-3 motion-safe:hover:-rotate-3 motion-safe:focus-visible:-translate-y-3 motion-safe:focus-visible:-rotate-3 sm:w-14",
  {
    variants: {
      swatch: {
        graphite: "bg-graphite border-graphite text-paper",
        hollow: "bg-paper border-ink text-ink",
        ink: "bg-ink border-ink text-paper",
        mist: "bg-mist border-mist text-paper",
      },
    },
  }
);

const Spine = ({
  height,
  specimen,
}: {
  height: (typeof spineHeights)[number];
  specimen: RepositorySpecimen;
}) => (
  <li className="flex items-end" data-build-block>
    <RepositoryLink
      className={`${spineVariants({ swatch: specimen.swatch })} ${height}`}
      specimen={specimen}
    >
      <span className="label tabular-nums">★{specimen.stars}</span>
      <span className="flex min-h-0 w-full flex-1 justify-center border-y border-current/40 py-2">
        <span className="min-h-0 rotate-180 truncate font-mono text-xs [writing-mode:vertical-rl] sm:text-sm">
          {specimen.name}
        </span>
      </span>
      <span className="label">{specimen.languageCode}</span>
    </RepositoryLink>
  </li>
);

const CoverField = ({ label, value }: { label: string; value: string }) => (
  <div className="flex flex-col gap-1">
    <dt className="label text-mist">{label}</dt>
    <dd className="text-ink text-sm tabular-nums">{value}</dd>
  </div>
);

const Cover = ({ specimen }: { specimen: RepositorySpecimen }) => (
  <div className="border-ink bg-paper relative flex min-h-64 w-full flex-col gap-4 border p-5 lg:h-76">
    <span className="border-rule pointer-events-none absolute inset-1.5 border" />
    <p className="label text-mist relative">{specimen.owner}</p>
    <p className="display text-ink relative text-3xl wrap-break-word">
      {specimen.name}
    </p>
    <p className="text-graphite relative line-clamp-3 text-sm text-pretty">
      {specimen.description ?? "No description."}
    </p>
    <dl className="relative mt-auto grid grid-cols-3 gap-3">
      <CoverField label="Language" value={specimen.language} />
      <CoverField label="Stars" value={`★ ${specimen.stars}`} />
      <CoverField label="Pushed" value={specimen.pushed} />
    </dl>
  </div>
);

export const SpineShelf = ({
  specimens,
}: {
  specimens: readonly RepositorySpecimen[];
}) => {
  const most = Math.max(0, ...specimens.map((specimen) => specimen.stars));
  return (
    <ShelfStage
      covers={specimens.map((specimen) => ({
        cover: <Cover specimen={specimen} />,
        id: specimen.id,
      }))}
      shelf={
        <div className="flex flex-col">
          <ul
            aria-label="Pinned repositories as book spines, as tall as their stars"
            className="flex items-end gap-1 px-2 pt-4 sm:gap-2 sm:px-4"
          >
            {specimens.map((specimen) => (
              <Spine
                height={
                  spineHeights[
                    starStep(specimen.stars, most, spineHeights.length)
                  ] ?? "h-44"
                }
                key={specimen.id}
                specimen={specimen}
              />
            ))}
            <li
              aria-hidden
              className="border-ink bg-paper-deep ml-auto h-24 w-3 border border-b-0 max-sm:hidden"
            />
          </ul>
          <span aria-hidden className="bg-ink h-1" />
          <span
            aria-hidden
            className="hatch border-rule h-3 border-x border-b"
          />
        </div>
      }
    />
  );
};
