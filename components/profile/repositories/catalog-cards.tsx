import type { RepositorySpecimen } from "./repositories";
import { RepositoryLink } from "./repository-link";

const stampClassName = "label border-ink text-ink border px-1.5 py-0.5";

const CatalogCard = ({ specimen }: { specimen: RepositorySpecimen }) => (
  <li className="flex min-w-0 flex-col" data-build-block>
    <RepositoryLink
      className="group/card flex flex-1 flex-col pt-2"
      specimen={specimen}
    >
      <div className="border-rule-strong bg-paper ease-out-quart group-hover/card:border-ink group-focus-visible/card:border-ink relative flex flex-1 flex-col border transition-[translate,border-color] duration-300 motion-safe:group-hover/card:-translate-y-1.5 motion-safe:group-focus-visible/card:-translate-y-1.5">
        <div className="border-rule-strong flex items-center justify-between gap-3 border-b px-4 py-2">
          <span className="label text-mist tabular-nums">
            Card {String(specimen.index + 1).padStart(2, "0")}
          </span>
          <span className="label text-mist">{specimen.visibility}</span>
        </div>
        <div className="border-rule flex flex-1 gap-4 border-b px-4 pt-3 pb-4 font-mono">
          <p className="text-graphite flex shrink-0 flex-col text-xs leading-5 tabular-nums">
            {specimen.callNumber.map((line) => (
              <span key={line}>{line}</span>
            ))}
          </p>
          <div className="flex min-w-0 flex-1 flex-col gap-2">
            <p className="text-ink text-sm leading-5 wrap-break-word">
              <span className="text-graphite">{specimen.owner}/</span>
              {specimen.name}
            </p>
            <p className="text-graphite line-clamp-3 text-xs leading-5 text-pretty">
              {specimen.description ?? "No description on file."}
            </p>
            <p className="text-mist text-xs leading-5 tabular-nums">
              Pushed {specimen.pushed}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 px-4 pt-3">
          <span className={`${stampClassName} -rotate-2`}>
            {specimen.language}
          </span>
          <span className={`${stampClassName} rotate-1 tabular-nums`}>
            ★ {specimen.stars}
          </span>
        </div>
        <span
          aria-hidden
          className="border-rule-strong bg-paper-deep mx-auto mt-3 mb-6 size-3 rounded-full border"
        />
      </div>
      <span
        aria-hidden
        className="border-ink bg-paper-deep hatch relative z-10 -mt-4 h-4 border-t"
      />
    </RepositoryLink>
  </li>
);

export const CatalogCards = ({
  specimens,
}: {
  specimens: readonly RepositorySpecimen[];
}) => (
  <ul
    aria-label="Pinned repositories as library catalog cards"
    className="grid gap-x-4 gap-y-6 sm:grid-cols-2 lg:grid-cols-3"
  >
    {specimens.map((specimen) => (
      <CatalogCard key={specimen.id} specimen={specimen} />
    ))}
  </ul>
);
