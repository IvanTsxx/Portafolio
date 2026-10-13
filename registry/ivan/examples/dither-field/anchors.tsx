import { DitherField } from "@/registry/ivan/ui/dither-field";

const anchors = ["fill", "top", "bottom", "center"] as const;

export const Example = () => (
  <div className="grid w-full grid-cols-2 gap-4 p-6">
    {anchors.map((anchor) => (
      <div
        className="relative isolate h-32 overflow-hidden border"
        key={anchor}
      >
        <DitherField anchor={anchor} className="opacity-40" seed={anchor} />
        <span className="absolute top-2 left-2 font-mono text-xs uppercase">
          {anchor}
        </span>
      </div>
    ))}
  </div>
);
