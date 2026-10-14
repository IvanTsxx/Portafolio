import { edgeHoleCenter } from "../dossier-edge-grid";

export interface EdgePress {
  at: number;
  lens: HTMLElement;
  marks: HTMLElement;
  reduced: boolean;
}

const waveReach = 280;
const waveDuration = 760;
const punchDuration = 380;
const reducedDuration = 200;
const easeOutQuart = "cubic-bezier(0.25, 1, 0.5, 1)";
const easeOutExpo = "cubic-bezier(0.16, 1, 0.3, 1)";

const along = (offset: number) => `translate3d(0, ${offset}px, 0)`;

const sendWave = ({ at, lens, reduced }: EdgePress) => {
  const start = at - lens.offsetHeight / 2;
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
      duration: reduced ? reducedDuration : waveDuration,
      easing: easeOutQuart,
    };
    const run = wave.animate(
      { opacity: [1, 0], transform: [along(start), along(end)] },
      timing
    );
    content?.animate({ transform: [along(-start), along(-end)] }, timing);
    run.addEventListener("finish", () => wave.remove());
  }
};

const punchPart = (className: string, center: number) => {
  const part = document.createElement("span");
  part.className = `absolute left-5 -translate-x-1/2 -translate-y-1/2 rounded-full opacity-0 ${className}`;
  part.style.top = `${center}px`;
  return part;
};

const punchHole = ({ at, marks, reduced }: EdgePress) => {
  const center = edgeHoleCenter(at);
  const plug = punchPart("bg-ink size-2.5", center);
  marks.append(plug);
  if (reduced) {
    plug
      .animate({ opacity: [0, 0.8, 0] }, { duration: reducedDuration })
      .addEventListener("finish", () => plug.remove());
    return center;
  }
  const ring = punchPart("border-ink size-5 border-2", center);
  marks.append(ring);
  plug.animate(
    [
      { opacity: 0, scale: "1" },
      { offset: 0.3, opacity: 0.9, scale: "0.8" },
      { opacity: 0, scale: "1" },
    ],
    { duration: punchDuration, easing: easeOutQuart }
  );
  ring
    .animate(
      [
        { opacity: 0.6, scale: "0.6" },
        { opacity: 0, scale: "1.4" },
      ],
      { duration: punchDuration, easing: easeOutExpo }
    )
    .addEventListener("finish", () => {
      plug.remove();
      ring.remove();
    });
  return center;
};

export const punchAndRipple = (press: EdgePress) => {
  const center = punchHole(press);
  sendWave({ ...press, at: center });
};
