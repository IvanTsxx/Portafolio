import { cn } from "@/lib/utils";

const corners = [
  "top-1.5 left-1.5 border-t border-l",
  "top-1.5 right-1.5 border-t border-r",
  "bottom-1.5 left-1.5 border-b border-l",
  "right-1.5 bottom-1.5 border-r border-b",
] as const;

export const SpecimenCorners = () =>
  corners.map((corner) => (
    <span
      aria-hidden
      className={cn(
        "border-ink ease-mechanical pointer-events-none absolute size-2 opacity-0 transition-opacity duration-100 group-hover:opacity-100 group-focus-visible:opacity-100",
        corner
      )}
      key={corner}
    />
  ));
