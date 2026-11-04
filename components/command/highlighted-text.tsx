import { segmentText } from "@/lib/search/match";
import type { MatchRange } from "@/lib/search/match";

export const HighlightedText = ({
  ranges,
  text,
}: {
  ranges: readonly MatchRange[];
  text: string;
}) => {
  if (ranges.length === 0) {
    return text;
  }
  return segmentText(text, ranges).map((segment) =>
    segment.matched ? (
      <mark className="bg-foreground/15 text-foreground" key={segment.start}>
        {segment.text}
      </mark>
    ) : (
      <span className="text-muted-foreground" key={segment.start}>
        {segment.text}
      </span>
    )
  );
};
