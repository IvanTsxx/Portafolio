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
      <mark className="bg-ink/15 text-ink" key={segment.start}>
        {segment.text}
      </mark>
    ) : (
      <span className="text-graphite" key={segment.start}>
        {segment.text}
      </span>
    )
  );
};
