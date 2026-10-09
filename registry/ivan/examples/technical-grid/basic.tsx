import { TechnicalGrid } from "@/registry/ivan/ui/technical-grid";

export const Example = () => (
  <TechnicalGrid
    caption="SYS-01"
    className="border-border h-64 w-full border"
    label="Grid 32 px"
  >
    <div className="flex h-full items-center justify-center">
      <p className="text-foreground font-mono text-xs tracking-widest uppercase">
        Calibration field
      </p>
    </div>
  </TechnicalGrid>
);
