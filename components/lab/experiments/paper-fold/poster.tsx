import { formInkAt } from "@/components/lab/source/form-tone";

const width = 48;
const height = 27;
const pageHeight = 22;
const pageWidth = pageHeight / Math.SQRT2;
const panelWidth = pageWidth / 3;
const cell = 0.34;
const radiusSteps = 8;
const figure = { height: 8.8, width: pageWidth - 2.6, x: 1.3, y: 2.4 } as const;
const flapAngle = (62 * Math.PI) / 180;
const depthX = 0.35;
const depthY = 0.2;

const dotStrokes = Array.from({ length: radiusSteps }, () => "");
for (let row = 0; row < figure.height / cell; row += 1) {
  for (let column = 0; column < figure.width / cell; column += 1) {
    const x = figure.x + (column + 0.5) * cell;
    const y = figure.y + (row + 0.5) * cell;
    const coverage = formInkAt(
      (x - figure.x - figure.width / 2) / figure.height,
      (figure.y + figure.height / 2 - y) / figure.height
    );
    const step = Math.round(Math.sqrt(coverage) * (radiusSteps - 1));
    if (step > 0) {
      dotStrokes[step] += `M${x.toFixed(2)} ${y.toFixed(2)}h0`;
    }
  }
}

const textLines = Array.from({ length: 12 }, (_, row) => {
  const isShort = (row + 1) % 5 === 0;
  const length =
    (isShort ? 0.42 : 0.72 + ((row * 37) % 23) / 100) * figure.width;
  return `M${figure.x} ${(12.8 + row * 0.66).toFixed(2)}h${length.toFixed(2)}`;
}).join("");

const pageX = (width - pageWidth) / 2 + 1.2;
const pageY = (height - pageHeight) / 2;
const hinge = pageX + panelWidth;
const flapScaleX = Math.cos(flapAngle) + depthX * Math.sin(flapAngle);
const flapSkewY = depthY * Math.sin(flapAngle);
const flapMatrix = [
  flapScaleX,
  flapSkewY,
  0,
  1,
  hinge - flapScaleX * panelWidth,
  pageY - flapSkewY * panelWidth,
]
  .map((value) => value.toFixed(4))
  .join(" ");

const printId = "paper-fold-poster-print";
const flapClipId = "paper-fold-poster-flap";
const bodyClipId = "paper-fold-poster-body";

export const PaperFoldPoster = () => (
  <svg
    aria-hidden
    className="size-full"
    preserveAspectRatio="xMidYMid slice"
    viewBox={`0 0 ${width} ${height}`}
  >
    <defs>
      <g id={printId}>
        <rect className="fill-paper" height={pageHeight} width={pageWidth} />
        {dotStrokes.map((path, step) =>
          path ? (
            <path
              className="stroke-ink"
              d={path}
              fill="none"
              key={step.toString()}
              strokeLinecap="round"
              strokeWidth={((step / (radiusSteps - 1)) * cell * 1.1).toFixed(3)}
            />
          ) : null
        )}
        <rect
          className="stroke-ink"
          fill="none"
          height={figure.height + 0.4}
          strokeWidth={0.06}
          width={figure.width + 0.4}
          x={figure.x - 0.2}
          y={figure.y - 0.2}
        />
        <path
          className="stroke-ink"
          d={`M${figure.x} 1.4h${figure.width}`}
          strokeWidth={0.06}
        />
        <path
          className="stroke-ink"
          d={`M${figure.x} 0.9h2.6`}
          strokeWidth={0.4}
        />
        <path className="stroke-ink" d={textLines} strokeWidth={0.22} />
        <path
          className="stroke-ink"
          d={`M${panelWidth} 0v${pageHeight}M${panelWidth * 2} 0v${pageHeight}`}
          strokeOpacity={0.25}
          strokeWidth={0.05}
        />
      </g>
      <clipPath id={flapClipId}>
        <rect height={pageHeight} width={panelWidth} />
      </clipPath>
      <clipPath id={bodyClipId}>
        <rect height={pageHeight} width={panelWidth * 2} x={panelWidth} />
      </clipPath>
    </defs>
    <g transform={`translate(${pageX} ${pageY})`}>
      <use clipPath={`url(#${bodyClipId})`} href={`#${printId}`} />
      <rect
        className="fill-ink"
        fillOpacity={0.06}
        height={pageHeight}
        width={panelWidth * 2}
        x={panelWidth}
      />
      <rect
        className="stroke-ink"
        fill="none"
        height={pageHeight}
        strokeWidth={0.08}
        width={panelWidth * 2}
        x={panelWidth}
      />
    </g>
    <g transform={`matrix(${flapMatrix})`}>
      <use clipPath={`url(#${flapClipId})`} href={`#${printId}`} />
      <rect
        className="fill-ink"
        fillOpacity={0.24}
        height={pageHeight}
        width={panelWidth}
      />
      <rect
        className="stroke-ink"
        fill="none"
        height={pageHeight}
        strokeWidth={0.08}
        width={panelWidth}
      />
    </g>
  </svg>
);
