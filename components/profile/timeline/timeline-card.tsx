import {
  ArrowUpRightIcon,
  StarIcon,
  XIcon,
} from "@phosphor-icons/react/dist/ssr";
import Image from "next/image";

import type {
  TimelineEntry,
  TimelinePoint,
  TimelineSpan,
} from "@/lib/timeline/timeline";
import { formatStamp, formatTenure, spanDates } from "@/lib/timeline/timeline";
import { cn } from "@/lib/utils";

const hostOf = (url: string) =>
  url.replace(/^https?:\/\/(?:www\.)?/u, "").replace(/\/$/u, "");

const CardLink = ({ href, label }: { href: string; label: string }) => (
  <a
    className="label text-graphite hover:text-ink focus-visible:text-ink flex w-fit items-center gap-1 normal-case underline-offset-4 transition-colors duration-100 hover:underline"
    href={href}
    rel="noreferrer"
    target="_blank"
  >
    {label}
    <ArrowUpRightIcon aria-hidden className="size-3" />
  </a>
);

const SpanDetails = ({ span }: { span: TimelineSpan }) => (
  <>
    <div className="flex items-center gap-3">
      <Image
        alt=""
        className="border-rule-strong size-8 shrink-0 border object-cover grayscale"
        height={32}
        src={span.logo}
        width={32}
      />
      <div className="flex min-w-0 flex-col">
        <h3 className="text-ink m-0 text-base leading-tight font-medium tracking-tight">
          {span.company}
        </h3>
        <p className="label text-graphite m-0">{span.role}</p>
      </div>
    </div>
    <p className="label text-ink m-0 tabular-nums">
      {spanDates(span)}
      <span className="text-mist">
        {" "}
        · {formatTenure(span.tenureMonths)} · {span.type}
      </span>
    </p>
    {span.summary ? (
      <p className="text-graphite m-0 text-sm leading-snug text-pretty">
        {span.summary}
      </p>
    ) : null}
    {span.stack.length > 0 ? (
      <ul className="m-0 flex list-none flex-wrap gap-1 p-0">
        {span.stack.map((item) => (
          <li
            className="label border-rule-strong text-ink border px-1.5 py-0.5"
            key={item}
          >
            {item}
          </li>
        ))}
      </ul>
    ) : null}
    {span.website ? (
      <CardLink href={span.website} label={hostOf(span.website)} />
    ) : null}
  </>
);

const PointDetails = ({ point }: { point: TimelinePoint }) => (
  <>
    <h3 className="text-ink m-0 text-base leading-tight font-medium tracking-tight wrap-break-word">
      {point.name}
    </h3>
    <p className="label text-ink m-0 flex items-center gap-2 tabular-nums">
      <span>{formatStamp(point.createdAt)}</span>
      <span className="text-mist">·</span>
      <span>{point.language ?? "Unknown"}</span>
      <span className="text-mist">·</span>
      <span
        aria-label={`${point.stars} stars`}
        className="flex items-center gap-1"
      >
        <StarIcon aria-hidden className="size-3" />
        {point.stars}
      </span>
    </p>
    {point.description ? (
      <p className="text-graphite m-0 text-sm leading-snug text-pretty">
        {point.description}
      </p>
    ) : null}
    <CardLink href={point.url} label={hostOf(point.url)} />
  </>
);

export const TimelineCard = ({
  className,
  entry,
  onClose,
}: {
  className?: string;
  entry: TimelineEntry;
  onClose?: () => void;
}) => (
  <div
    className={cn(
      "bg-paper border-ink relative flex w-72 flex-col gap-2.5 border p-3.5",
      className
    )}
  >
    {onClose ? (
      <button
        aria-label="Close details"
        className="text-graphite hover:text-ink focus-visible:outline-ink absolute top-2 right-2 grid size-6 place-items-center"
        onClick={onClose}
        type="button"
      >
        <XIcon aria-hidden className="size-3.5" />
      </button>
    ) : null}
    {entry.kind === "experience" ? (
      <SpanDetails span={entry} />
    ) : (
      <PointDetails point={entry} />
    )}
  </div>
);
