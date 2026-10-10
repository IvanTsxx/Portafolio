import {
  ArrowRightIcon,
  ArrowUpRightIcon,
} from "@phosphor-icons/react/dist/ssr";
import Image from "next/image";

import {
  DocumentSection,
  PanelCount,
} from "@/components/site/document-section";
import { experience } from "@/lib/site/experience";
import type { Experience } from "@/lib/site/experience";
import { cn } from "@/lib/utils";

import { SpecimenCorners } from "./specimen-corners";
import { specimenVariants } from "./specimen-variants";

const typeAnnotations: Record<Experience["type"], string> = {
  Contract: "契約",
  "Full-time": "常勤",
};

const formatMonth = (month: string) => month.replace("-", ".");

const monthsBetween = (start: string, end: string) => {
  const [startYear = 0, startMonth = 0] = start.split("-").map(Number);
  const [endYear = 0, endMonth = 0] = end.split("-").map(Number);
  return (endYear - startYear) * 12 + (endMonth - startMonth) + 1;
};

const currentMonth = () => new Date().toISOString().slice(0, 7);

const formatTenure = (months: number) => {
  const years = Math.floor(months / 12);
  const rest = months % 12;
  return [years > 0 ? `${years} yr` : null, rest > 0 ? `${rest} mo` : null]
    .filter(Boolean)
    .join(" ");
};

const hostOf = (url: string) =>
  url.replace(/^https?:\/\/(?:www\.)?/u, "").replace(/\/$/u, "");

const ExperienceSpecimen = ({
  entry,
  id,
}: {
  entry: Experience;
  id: string;
}) => {
  const isCurrent = entry.end === null;
  const tenure = formatTenure(
    monthsBetween(entry.start, entry.end ?? currentMonth())
  );

  return (
    <article
      aria-label={`${entry.role} at ${entry.company}`}
      className={specimenVariants({
        interactive: entry.website !== null,
        surface: isCurrent ? "deep" : "plain",
      })}
    >
      <SpecimenCorners />
      <div className="label flex items-baseline justify-between gap-3">
        <span className="text-mist tabular-nums">{id}</span>
        <span className="flex items-baseline gap-2">
          {isCurrent ? (
            <span className="border-ink bg-ink text-paper border px-1.5 py-0.5">
              Current <span className="jp">現職</span>
            </span>
          ) : null}
          <span className="border-rule-strong text-graphite border px-1.5 py-0.5">
            {entry.type}{" "}
            <span className="jp">{typeAnnotations[entry.type]}</span>
          </span>
        </span>
      </div>

      <div className="flex items-center gap-3">
        <Image
          alt=""
          className="border-rule-strong size-10 shrink-0 border object-cover grayscale"
          height={40}
          src={entry.logo}
          width={40}
        />
        <div className="flex min-w-0 flex-col gap-0.5">
          <h3 className="text-ink text-lg leading-tight font-medium tracking-tight">
            {entry.website ? (
              <a
                className="outline-none after:absolute after:inset-0"
                href={entry.website}
                rel="noopener"
                target="_blank"
              >
                {entry.company}
              </a>
            ) : (
              entry.company
            )}
          </h3>
          <p className="label text-graphite">{entry.role}</p>
        </div>
      </div>

      <p className="label text-ink flex flex-wrap items-baseline gap-x-2 tabular-nums">
        <time dateTime={entry.start}>{formatMonth(entry.start)}</time>
        <ArrowRightIcon aria-hidden className="text-mist size-3 self-center" />
        {entry.end ? (
          <time dateTime={entry.end}>{formatMonth(entry.end)}</time>
        ) : (
          <span>Present</span>
        )}
        <span className="text-mist">· {tenure}</span>
      </p>

      <p
        className={cn(
          "flex-1",
          entry.summary
            ? "text-graphite text-sm leading-relaxed text-pretty"
            : "label text-mist"
        )}
      >
        {entry.summary ?? "Ongoing / 進行中"}
      </p>

      {entry.stack.length > 0 || entry.website ? (
        <div className="border-rule flex items-end justify-between gap-3 border-t pt-3">
          <ul className="flex flex-wrap gap-1.5">
            {entry.stack.map((item) => (
              <li
                className="label border-rule-strong text-ink border px-1.5 py-0.5"
                key={item}
              >
                {item}
              </li>
            ))}
          </ul>
          {entry.website ? (
            <span className="label text-graphite group-hover:text-ink flex shrink-0 items-center gap-1 normal-case transition-colors duration-100">
              {hostOf(entry.website)}
              <ArrowUpRightIcon aria-hidden className="size-3" />
            </span>
          ) : null}
        </div>
      ) : null}
    </article>
  );
};

export const ExperienceLedger = () => (
  <DocumentSection
    aside={<PanelCount current={experience.length} total={experience.length} />}
    id="experience"
    index="GH-03"
    jp="経歴"
    label="Experience"
    waypoint={{ action: "measure", role: "architect", side: "right" }}
  >
    <ol className="border-rule grid border-t border-l sm:grid-cols-2">
      {experience.map((entry, index) => (
        <li className="relative" key={entry.id}>
          <ExperienceSpecimen
            entry={entry}
            id={`E-${String(index + 1).padStart(2, "0")}`}
          />
        </li>
      ))}
    </ol>
  </DocumentSection>
);
