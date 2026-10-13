import { formInkAt } from "@/components/lab/source/form-tone";

const width = 48;
const height = 27;
const curvature = 0.12;
const screenInset = 1.08;
const rows = 24;
const rowHeight = height / rows;
const columnWidth = rowHeight * 0.55;
const columns = Math.ceil(width / columnWidth);

const toStage = (screenX: number, screenY: number) => {
  let uvX = screenX;
  let uvY = screenY;
  for (let pass = 0; pass < 6; pass += 1) {
    const stretch = (1 + curvature) / (1 + curvature * (uvX * uvX + uvY * uvY));
    uvX = screenX * stretch;
    uvY = screenY * stretch;
  }
  return {
    x: ((uvX / screenInset) * 0.5 + 0.5) * width,
    y: ((uvY / screenInset) * 0.5 + 0.5) * height,
  };
};

let slots = "";
for (let column = 0; column < columns; column += 1) {
  const stagger = (column % 2) * 0.5;
  for (let row = 0; row < rows; row += 1) {
    const centerX = (column + 0.5) * columnWidth;
    const centerY = (row + 0.5 - stagger) * rowHeight;
    if (centerY < 0) {
      continue;
    }
    const screenX = (centerX / width) * 2 - 1;
    const screenY = (centerY / height) * 2 - 1;
    const corner = screenX * screenX + screenY * screenY;
    const tone = Math.min(
      formInkAt(
        (centerX - width / 2) / height,
        (height / 2 - centerY) / height
      ) +
        0.22 * Math.min(Math.max((corner - 0.6) / 1.4, 0), 1),
      1
    );
    const halfHeight = 0.46 * Math.sqrt(tone) * rowHeight;
    if (tone < 0.02) {
      continue;
    }
    const { x, y } = toStage(screenX, screenY);
    slots += `M${x.toFixed(2)} ${(y - halfHeight).toFixed(2)}v${(halfHeight * 2).toFixed(2)}`;
  }
}

const rimSteps = 24;
const rimEdges = [
  (amount: number) => ({ x: amount * 2 - 1, y: 1 }),
  (amount: number) => ({ x: 1, y: 1 - amount * 2 }),
  (amount: number) => ({ x: 1 - amount * 2, y: -1 }),
  (amount: number) => ({ x: -1, y: amount * 2 - 1 }),
] as const;
const rim = `${rimEdges
  .flatMap((edge) =>
    Array.from({ length: rimSteps }, (_, step) => {
      const corner = edge(step / rimSteps);
      const { x, y } = toStage(corner.x, corner.y);
      return `${x.toFixed(2)} ${y.toFixed(2)}`;
    })
  )
  .join("L")}`;

export const CrtPoster = () => (
  <svg
    aria-hidden
    className="size-full"
    preserveAspectRatio="xMidYMid slice"
    viewBox={`0 0 ${width} ${height}`}
  >
    <path
      className="stroke-ink"
      d={slots}
      fill="none"
      strokeWidth={(columnWidth * 0.72).toFixed(3)}
    />
    <path
      className="stroke-ink"
      d={`M${rim}Z`}
      fill="none"
      strokeWidth="0.12"
    />
  </svg>
);
