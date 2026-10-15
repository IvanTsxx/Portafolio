import { POSTER_HEIGHT, POSTER_WIDTH, proofPosterOf } from "./proof-poster";
import type { RepositorySpecimen } from "./repositories";
import { RepositoryLink } from "./repository-link";

const ProofPlate = ({ specimen }: { specimen: RepositorySpecimen }) => {
  const poster = proofPosterOf(specimen.id, specimen.language);
  return (
    <svg
      aria-hidden
      className="block h-auto w-full"
      viewBox={`0 0 ${POSTER_WIDTH} ${POSTER_HEIGHT}`}
    >
      <g className="fill-mist stroke-mist motion-safe:group-hover/proof:animate-misregister-tint motion-safe:group-focus-visible/proof:animate-misregister-tint mix-blend-multiply">
        <path d={poster.tint} stroke="none" />
        <path d={poster.marks} fill="none" strokeWidth="0.3" />
      </g>
      <g className="fill-ink stroke-ink motion-safe:group-hover/proof:animate-misregister-ink motion-safe:group-focus-visible/proof:animate-misregister-ink mix-blend-multiply">
        <path d={poster.ink} stroke="none" />
        <path d={poster.marks} fill="none" strokeWidth="0.3" />
      </g>
    </svg>
  );
};

const PrintProof = ({ specimen }: { specimen: RepositorySpecimen }) => (
  <li className="flex min-w-0 flex-col" data-build-block>
    <RepositoryLink
      className="group/proof border-rule bg-paper ease-out-quart hover:border-ink focus-visible:border-ink flex flex-1 flex-col border transition-colors duration-150"
      specimen={specimen}
    >
      <div className="bg-popover border-rule border-b p-1 sm:p-2">
        <ProofPlate specimen={specimen} />
      </div>
      <div className="flex flex-1 flex-col gap-1.5 p-3 font-mono sm:gap-2 sm:p-4">
        <p className="label text-mist truncate">{specimen.owner}</p>
        <p className="text-ink text-sm leading-5 wrap-break-word">
          {specimen.name}
        </p>
        <p className="text-graphite line-clamp-2 text-xs leading-5 max-sm:hidden">
          {specimen.description ?? "No description."}
        </p>
        <p className="label text-mist mt-auto flex flex-wrap gap-x-3 pt-1 tabular-nums">
          <span className="text-ink">{specimen.language}</span>
          <span className="text-ink">★ {specimen.stars}</span>
          <span>{specimen.pushed}</span>
        </p>
      </div>
    </RepositoryLink>
  </li>
);

export const PrintProofs = ({
  specimens,
}: {
  specimens: readonly RepositorySpecimen[];
}) => (
  <ul
    aria-label="Pinned repositories as print proofs"
    className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-3"
  >
    {specimens.map((specimen) => (
      <PrintProof key={specimen.id} specimen={specimen} />
    ))}
  </ul>
);
