import { hashText, seededRandom } from "@/components/profile/seeded";

const BARCODE_UNITS = 96;
const BARCODE_HEIGHT = 24;

const barcodeOf = (value: string) => {
  const seed = hashText(value);
  const random = seededRandom(seed);
  const bars: { width: number; x: number }[] = [];
  let cursor = 0;
  while (cursor < BARCODE_UNITS) {
    const width = 1 + Math.floor(random() * 3);
    if (random() > 0.35) {
      bars.push({ width, x: cursor });
    }
    cursor += width + 1;
  }
  return {
    bars,
    code: seed.toString(16).toUpperCase().padStart(8, "0"),
    total: cursor,
  };
};

export const Barcode = ({ value }: { value: string }) => {
  const barcode = barcodeOf(value);
  return (
    <div className="flex w-full flex-col gap-1">
      <svg
        aria-hidden
        className="text-ink h-10 w-full"
        fill="currentColor"
        preserveAspectRatio="none"
        viewBox={`0 0 ${barcode.total} ${BARCODE_HEIGHT}`}
      >
        {barcode.bars.map((bar) => (
          <rect
            height={BARCODE_HEIGHT}
            key={bar.x}
            width={bar.width}
            x={bar.x}
            y={0}
          />
        ))}
      </svg>
      <p className="label text-ink flex justify-between">
        <span>{value}</span>
        <span>{barcode.code}</span>
      </p>
    </div>
  );
};
