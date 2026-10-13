export interface RailAnchor {
  scroll: number;
  share: number;
}

export interface RailLayout {
  anchors: readonly RailAnchor[];
  marks: readonly number[];
  stops: readonly number[];
}

const activeTolerance = 8;
export const sectionLandingOffset = 80;
export const activeLeadShare = 0.3;

const clamp = (value: number, min: number, max: number) =>
  Math.min(max, Math.max(min, value));

export const sectionStops = (
  sectionTops: readonly number[],
  landingOffset: number,
  maxScroll: number
) => sectionTops.map((top) => clamp(top - landingOffset, 0, maxScroll));

const evenMarks = (count: number) =>
  Array.from({ length: count }, (_, index) =>
    count === 1 ? 0 : index / (count - 1)
  );

export const railMarks = (
  stops: readonly number[],
  maxScroll: number,
  minGap: number
): number[] => {
  const count = stops.length;
  if (count === 0) {
    return [];
  }
  if (maxScroll <= 0 || minGap * (count - 1) >= 1) {
    return evenMarks(count);
  }
  const marks = stops.map((stop) => stop / maxScroll);
  for (let index = 1; index < count; index += 1) {
    marks[index] = Math.max(
      marks[index] ?? 0,
      (marks[index - 1] ?? 0) + minGap
    );
  }
  for (let index = count - 1; index >= 0; index -= 1) {
    const ceiling = index === count - 1 ? 1 : (marks[index + 1] ?? 1) - minGap;
    marks[index] = clamp(marks[index] ?? 0, 0, ceiling);
  }
  return marks;
};

export const railAnchors = (
  stops: readonly number[],
  marks: readonly number[],
  maxScroll: number
): RailAnchor[] => {
  const anchors: RailAnchor[] = [{ scroll: 0, share: 0 }];
  for (const [index, stop] of stops.entries()) {
    const share = marks[index] ?? 0;
    const last = anchors.at(-1);
    if (last && stop <= last.scroll) {
      last.share = share;
    } else {
      anchors.push({ scroll: stop, share });
    }
  }
  const last = anchors.at(-1);
  if (last && maxScroll > last.scroll) {
    anchors.push({ scroll: maxScroll, share: 1 });
  }
  return anchors;
};

export const railLayout = ({
  landingOffset,
  maxScroll,
  minGap,
  sectionTops,
}: {
  landingOffset: number;
  maxScroll: number;
  minGap: number;
  sectionTops: readonly number[];
}): RailLayout => {
  const stops = sectionStops(sectionTops, landingOffset, maxScroll);
  const marks = railMarks(stops, maxScroll, minGap);
  return { anchors: railAnchors(stops, marks, maxScroll), marks, stops };
};

export const railShare = (
  scrollY: number,
  anchors: readonly RailAnchor[]
): number => {
  const [first] = anchors;
  if (!first) {
    return 0;
  }
  if (scrollY <= first.scroll) {
    return first.share;
  }
  for (let index = 1; index < anchors.length; index += 1) {
    const from = anchors[index - 1];
    const to = anchors[index];
    if (from && to && scrollY <= to.scroll) {
      const span = to.scroll - from.scroll;
      const progress = span > 0 ? (scrollY - from.scroll) / span : 1;
      return from.share + (to.share - from.share) * progress;
    }
  }
  return anchors.at(-1)?.share ?? 0;
};

export const activeStopIndex = (
  scrollY: number,
  stops: readonly number[]
): number => {
  let active = -1;
  for (const [index, stop] of stops.entries()) {
    if (stop <= scrollY + activeTolerance) {
      active = index;
    }
  }
  return active;
};

export const activeSectionIndex = (
  scrollY: number,
  viewportHeight: number,
  stops: readonly number[]
) => activeStopIndex(scrollY + viewportHeight * activeLeadShare, stops);
