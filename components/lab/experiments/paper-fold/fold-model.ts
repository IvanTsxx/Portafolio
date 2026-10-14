export type CreaseCount = "one" | "two";

export type Hinge = "fixed" | "left" | "right";

export interface Panel {
  hinge: Hinge;
  pageStart: number;
  pageWidth: number;
  lift: number;
  foldsFrom: number;
  foldsTo: number;
}

const restGap = 0.015;
const backBend = 0.08;
export const closedAngle = Math.PI * (1 - restGap);

export const panelLayouts = {
  one: [
    {
      foldsFrom: 0,
      foldsTo: 0,
      hinge: "fixed",
      lift: 0,
      pageStart: 0,
      pageWidth: 0.5,
    },
    {
      foldsFrom: 0,
      foldsTo: 1,
      hinge: "right",
      lift: 0.004,
      pageStart: 0.5,
      pageWidth: 0.5,
    },
  ],
  two: [
    {
      foldsFrom: 0,
      foldsTo: 0.62,
      hinge: "left",
      lift: 0.004,
      pageStart: 0,
      pageWidth: 1 / 3,
    },
    {
      foldsFrom: 0,
      foldsTo: 0,
      hinge: "fixed",
      lift: 0,
      pageStart: 1 / 3,
      pageWidth: 1 / 3,
    },
    {
      foldsFrom: 0.38,
      foldsTo: 1,
      hinge: "right",
      lift: 0.008,
      pageStart: 2 / 3,
      pageWidth: 1 / 3,
    },
  ],
} as const satisfies Record<CreaseCount, readonly Panel[]>;

const easeInOut = (amount: number) =>
  amount < 0.5 ? 2 * amount * amount : 1 - (-2 * amount + 2) ** 2 / 2;

export const panelAngle = (panel: Panel, progress: number) => {
  if (panel.hinge === "fixed") {
    return 0;
  }
  const span = panel.foldsTo - panel.foldsFrom;
  const angle =
    progress < 0
      ? Math.max(progress / span, -backBend) * closedAngle
      : easeInOut(
          Math.min(Math.max((progress - panel.foldsFrom) / span, 0), 1)
        ) * closedAngle;
  return panel.hinge === "left" ? angle : -angle;
};

export const creaseLines = (creases: CreaseCount) =>
  panelLayouts[creases].slice(1).map((panel) => panel.pageStart);

export const releaseTarget = (progress: number, velocity: number) =>
  progress + velocity * 0.18 > 0.5 ? 1 : 0;

export const dragTarget = (
  startProgress: number,
  dragDistance: number,
  stageWidth: number
) =>
  Math.min(
    Math.max(
      startProgress - (dragDistance / Math.max(stageWidth, 1)) * 1.6,
      -0.12
    ),
    1.04
  );
