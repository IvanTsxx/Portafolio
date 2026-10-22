import Link from "next/link";

import { CornerMarks } from "@/components/site/corner-marks";
import { focusRingClassName } from "@/components/site/styles";
import { cn } from "@/lib/utils";

export interface Neighbor {
  href: string;
  title: string;
}

export const NeighborLink = ({
  direction,
  neighbor,
}: {
  direction: "Next" | "Previous";
  neighbor: Neighbor | undefined;
}) => {
  if (!neighbor) {
    return <span />;
  }
  return (
    <Link
      className={cn(
        "group/marks border-rule-strong ease-mechanical hover:bg-paper-deep/60 relative flex min-h-11 flex-col gap-1 border px-4 py-3 transition-colors duration-100",
        focusRingClassName
      )}
      href={neighbor.href}
    >
      <CornerMarks reveal="hover" />
      <span className="label text-mist group-hover/marks:text-ink transition-colors">
        {direction}
      </span>
      <span className="text-ink text-sm font-medium">{neighbor.title}</span>
    </Link>
  );
};

export const NeighborNav = ({
  label,
  next,
  previous,
}: {
  label: string;
  next: Neighbor | undefined;
  previous: Neighbor | undefined;
}) => (
  <nav
    aria-label={label}
    className="border-rule-strong grid gap-4 border-t pt-8 sm:grid-cols-2"
  >
    <NeighborLink direction="Previous" neighbor={previous} />
    <NeighborLink direction="Next" neighbor={next} />
  </nav>
);
