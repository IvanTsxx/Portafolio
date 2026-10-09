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
      "label border-rule-strong text-signal-steel inline-flex w-fit items-center gap-2 rounded-sm border px-2 py-1 whitespace-nowrap",
      className
    )}
    title={`Placeholder entry. Edit or replace ${source}.`}
  >
    <span aria-hidden className="bg-signal-steel size-1.5 rounded-full" />
    Sample content
  </span>
);
