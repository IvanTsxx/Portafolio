import { cn } from "@/lib/utils";

export const SampleBadge = ({
  className,
  source,
}: {
  className?: string;
  source: string;
}) => (
  <span
    className={cn(
      "label text-ink border-ink inline-flex w-fit items-center gap-2 border border-dashed px-2 py-1 whitespace-nowrap",
      className
    )}
    title={`Placeholder entry. Edit or replace ${source}.`}
  >
    <span aria-hidden className="border-ink size-1.5 border" />
    Sample content
  </span>
);
