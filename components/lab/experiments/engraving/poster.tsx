import { formInkAt, formReliefAt } from "@/components/lab/source/form-tone";

const width = 48;
const height = 27;
const pitch = 1;
const step = 1;
const angle = Math.PI / 6;
const crossTurn = Math.PI / 3;
const crossShare = 0.62;
const hairline = 0.05;
const shiftLines = (0.14 * 0.7 * height) / pitch;
const reach = Math.hypot(width, height) / 2 + 1;

interface Family {
  angle: number;
  lineWidth: (tone: number) => number;
}

interface Sample {
  x: number;
  y: number;
  half: number;
}

const families: readonly Family[] = [
  {
    angle,
    lineWidth: (tone) =>
      hairline + (crossShare - hairline) * Math.min(tone / crossShare, 1),
  },
  {
    angle: angle + crossTurn,
    lineWidth: (tone) => Math.max(tone - crossShare, 0) / (1 - crossShare),
  },
];

const format = (x: number, y: number) => `${x.toFixed(1)} ${y.toFixed(1)}`;

const ribbon = (run: readonly Sample[]) => {
  const sides = run.map((sample, index) => {
    const before = run[Math.max(index - 1, 0)] ?? sample;
    const after = run[Math.min(index + 1, run.length - 1)] ?? sample;
    const length = Math.hypot(after.x - before.x, after.y - before.y) || 1;
    const normalX = -(after.y - before.y) / length;
    const normalY = (after.x - before.x) / length;
    return {
      left: format(
        sample.x + normalX * sample.half,
        sample.y + normalY * sample.half
      ),
      right: format(
        sample.x - normalX * sample.half,
        sample.y - normalY * sample.half
      ),
    };
  });
  const forward = sides.map((side) => side.left).join("L");
  const backward = sides
    .toReversed()
    .map((side) => side.right)
    .join("L");
  return `M${forward}L${backward}Z`;
};

const traceLine = (family: Family, line: number) => {
  const directionX = Math.cos(family.angle);
  const directionY = Math.sin(family.angle);
  const normalX = -directionY;
  const normalY = directionX;
  const runs: Sample[][] = [];
  let run: Sample[] = [];
  for (let along = -reach; along <= reach; along += step) {
    let pointX = 0;
    let pointY = 0;
    let shift = 0;
    for (let pass = 0; pass < 3; pass += 1) {
      const offset = (line + 0.5 - shift) * pitch;
      pointX = directionX * along + normalX * offset;
      pointY = directionY * along + normalY * offset;
      shift = shiftLines * formReliefAt(pointX / height, pointY / height);
    }
    const x = pointX + width / 2;
    const y = height / 2 - pointY;
    const isInside = x > -1 && x < width + 1 && y > -1 && y < height + 1;
    const half =
      (family.lineWidth(formInkAt(pointX / height, pointY / height)) * pitch) /
      2;
    if (isInside && half > 0.01) {
      run.push({ half, x, y });
    } else if (run.length > 0) {
      runs.push(run);
      run = [];
    }
  }
  if (run.length > 0) {
    runs.push(run);
  }
  let path = "";
  for (const samples of runs) {
    if (samples.length > 2) {
      path += ribbon(samples);
    }
  }
  return path;
};

let inkPath = "";
for (const family of families) {
  const lineLimit = Math.ceil(reach / pitch + shiftLines);
  for (let line = -lineLimit; line <= lineLimit; line += 1) {
    inkPath += traceLine(family, line);
  }
}

export const EngravingPoster = () => (
  <svg
    aria-hidden
    className="size-full"
    preserveAspectRatio="xMidYMid slice"
    viewBox={`0 0 ${width} ${height}`}
  >
    <path className="fill-ink" d={inkPath} />
  </svg>
);
