import type { ReactNode } from "react";

import { PrintOnView } from "./print-on-view";
import type { RepositorySpecimen } from "./repositories";
import { RepositoryLink } from "./repository-link";

const LINE_STAGGER_MS = 70;

const Marker = ({ children }: { children: ReactNode }) => (
  <mark className="text-ink before:bg-ink/15 ease-out-quart relative isolate min-w-0 bg-transparent break-all before:absolute before:-inset-x-1 before:inset-y-0.5 before:-z-10 before:origin-left before:scale-x-0 before:transition-[scale,opacity] before:duration-300 group-hover/print:before:scale-x-100 group-focus-visible/print:before:scale-x-100 motion-reduce:before:scale-x-100 motion-reduce:before:opacity-0 motion-reduce:group-hover/print:before:opacity-100 motion-reduce:group-focus-visible/print:before:opacity-100">
    {children}
  </mark>
);

const PrintLine = ({
  children,
  line,
}: {
  children: ReactNode;
  line: number;
}) => (
  <p
    className="even:bg-paper-deep/60 ease-out-quart flex min-w-0 gap-3 px-3 transition-opacity duration-150 group-data-waiting/printer:opacity-0"
    style={{ transitionDelay: `${line * LINE_STAGGER_MS}ms` }}
  >
    {children}
  </p>
);

const Key = ({ children }: { children: ReactNode }) => (
  <span className="text-mist w-12 shrink-0">{children}</span>
);

const Prompt = ({ children }: { children: ReactNode }) => (
  <>
    <span className="text-mist shrink-0">$</span>
    <span className="text-graphite min-w-0 truncate">{children}</span>
  </>
);

const SprocketStrip = ({ side }: { side: "left" | "right" }) => (
  <span
    aria-hidden
    className={
      side === "left"
        ? "blueprint-dots border-rule w-4 shrink-0 border-r border-dashed [--grid-size:16px] sm:w-5"
        : "blueprint-dots border-rule w-4 shrink-0 border-l border-dashed [--grid-size:16px] sm:w-5"
    }
  />
);

const Printout = ({ specimen }: { specimen: RepositorySpecimen }) => (
  <li className="min-w-0" data-build-block>
    <RepositoryLink
      className="group/print border-rule bg-paper ease-out-quart hover:border-ink focus-visible:border-ink block border transition-colors duration-150"
      specimen={specimen}
    >
      <PrintOnView className="flex">
        <SprocketStrip side="left" />
        <div className="min-w-0 flex-1 py-3 font-mono text-xs leading-6">
          <PrintLine line={0}>
            <Prompt>gh repo view {specimen.id}</Prompt>
          </PrintLine>
          <PrintLine line={1}>
            <Key>name</Key>
            <Marker>{specimen.id}</Marker>
          </PrintLine>
          <PrintLine line={2}>
            <Key>about</Key>
            <span className="text-graphite min-w-0 truncate">
              {specimen.description ?? "--"}
            </span>
          </PrintLine>
          <PrintLine line={3}>
            <Key>lang</Key>
            <span className="text-ink">{specimen.language}</span>
          </PrintLine>
          <PrintLine line={4}>
            <Key>stars</Key>
            <Marker>★ {specimen.stars}</Marker>
            <span className="text-mist tabular-nums">
              forks {specimen.forks}
            </span>
          </PrintLine>
          <PrintLine line={5}>
            <Prompt>git log -1 --format=%cs</Prompt>
          </PrintLine>
          <PrintLine line={6}>
            <Key>pushed</Key>
            <span className="text-ink tabular-nums">{specimen.pushedOn}</span>
          </PrintLine>
        </div>
        <SprocketStrip side="right" />
      </PrintOnView>
    </RepositoryLink>
  </li>
);

export const TerminalPrintout = ({
  specimens,
}: {
  specimens: readonly RepositorySpecimen[];
}) => (
  <ul
    aria-label="Pinned repositories as printed terminal output"
    className="grid gap-4 lg:grid-cols-2"
  >
    {specimens.map((specimen) => (
      <Printout key={specimen.id} specimen={specimen} />
    ))}
  </ul>
);
