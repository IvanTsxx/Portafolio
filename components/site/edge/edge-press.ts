export type EdgeAxis = "x" | "y";

export interface EdgePress {
  at: number;
  axis: EdgeAxis;
  lens: HTMLElement;
  marks: HTMLElement;
  reduced: boolean;
}

export interface EdgeMark {
  build: (slot: number) => HTMLElement;
  enter: Keyframe[];
  limit: number;
  pitch: number;
  offset: number;
}

const waveReach = 280;
const waveDuration = 760;
const markDuration = 320;
const easeOutQuart = "cubic-bezier(0.25, 1, 0.5, 1)";
const easeOutExpo = "cubic-bezier(0.16, 1, 0.3, 1)";

const shift = (axis: EdgeAxis, offset: number) =>
  axis === "y"
    ? `translate3d(0, ${offset}px, 0)`
    : `translate3d(${offset}px, 0, 0)`;

const lensLength = (axis: EdgeAxis, lens: HTMLElement) =>
  axis === "y" ? lens.offsetHeight : lens.offsetWidth;

export const sendWave = ({ at, axis, lens, reduced }: EdgePress) => {
  const start = at - lensLength(axis, lens) / 2;
  const directions = reduced ? [0] : [-1, 1];
  for (const direction of directions) {
    const wave = lens.cloneNode(true);
    if (!(wave instanceof HTMLElement)) {
      return;
    }
    const content = wave.firstElementChild;
    lens.after(wave);
    const end = start + direction * waveReach;
    const timing = {
      duration: reduced ? markDuration : waveDuration,
      easing: easeOutQuart,
    };
    const run = wave.animate(
      {
        opacity: [1, 0],
        transform: [shift(axis, start), shift(axis, end)],
      },
      timing
    );
    content?.animate(
      { transform: [shift(axis, -start), shift(axis, -end)] },
      timing
    );
    run.addEventListener("finish", () => wave.remove());
  }
};

export const toggleMark = (
  { at, marks, reduced }: EdgePress,
  { build, enter, limit, offset, pitch }: EdgeMark
) => {
  const slot = Math.max(0, Math.round((at - offset) / pitch));
  const existing = marks.querySelector<HTMLElement>(`[data-slot="${slot}"]`);
  if (existing) {
    delete existing.dataset.slot;
    if (reduced) {
      existing.remove();
      return;
    }
    existing
      .animate(enter.toReversed(), {
        duration: markDuration * 0.6,
        easing: easeOutQuart,
      })
      .addEventListener("finish", () => existing.remove());
    return;
  }
  const placed = marks.querySelectorAll("[data-slot]");
  if (placed.length >= limit) {
    placed[0]?.remove();
  }
  const mark = build(slot);
  mark.dataset.slot = String(slot);
  marks.append(mark);
  if (!reduced) {
    mark.animate(enter, { duration: markDuration, easing: easeOutExpo });
  }
};

export const markPosition = (slot: number, mark: EdgeMark) =>
  mark.offset + slot * mark.pitch;
