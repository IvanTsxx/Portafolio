import {
  ArrowUpRightIcon,
  StarIcon,
  XIcon,
} from "@phosphor-icons/react/dist/ssr";

import { cn } from "@/lib/utils";

import type { BookTone, ShelfBook } from "./shelf-model";

const toneSwatches = {
  deep: "bg-paper-deep border-ink border",
  graphite: "bg-graphite",
  paper: "bg-paper border-ink border",
  steel: "bg-signal-steel",
} as const satisfies Record<BookTone, string>;

export const ToneSwatch = ({ tone }: { tone: BookTone }) => (
  <span aria-hidden className={cn("size-2 shrink-0", toneSwatches[tone])} />
);

export const RepoCard = ({
  book,
  className,
  onClose,
}: {
  book: ShelfBook;
  className?: string;
  onClose?: () => void;
}) => (
  <div
    className={cn(
      "bg-paper border-ink relative flex flex-col gap-2 border p-3.5",
      className
    )}
  >
    {onClose ? (
      <button
        aria-label="Close repository details"
        className="text-graphite hover:text-ink focus-visible:outline-ink absolute top-2 right-2 grid size-6 place-items-center"
        onClick={onClose}
        type="button"
      >
        <XIcon aria-hidden className="size-3.5" />
      </button>
    ) : null}
    <h3 className="text-ink m-0 pr-6 text-base leading-tight font-medium tracking-tight wrap-break-word">
      {book.name}
    </h3>
    <p className="label text-ink m-0 flex items-center gap-2 tabular-nums">
      <ToneSwatch tone={book.tone} />
      <span>{book.language ?? "Unknown"}</span>
      <span className="text-mist">·</span>
      <span
        aria-label={`${book.stars} stars`}
        className="flex items-center gap-1"
      >
        <StarIcon aria-hidden className="size-3" />
        {book.stars}
      </span>
    </p>
    {book.description ? (
      <p className="text-graphite m-0 text-sm leading-snug text-pretty">
        {book.description}
      </p>
    ) : null}
    <a
      className="label text-graphite hover:text-ink focus-visible:text-ink flex w-fit items-center gap-1 underline-offset-4 transition-colors duration-100 hover:underline"
      href={book.url}
      rel="noreferrer"
      target="_blank"
    >
      Open on GitHub
      <ArrowUpRightIcon aria-hidden className="size-3" />
    </a>
  </div>
);
