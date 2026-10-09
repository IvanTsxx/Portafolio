import { MagneticButton } from "@/registry/ivan/ui/magnetic-button";

export const Example = () => (
  <div className="flex flex-wrap items-center gap-6 p-6">
    <MagneticButton>Outline</MagneticButton>
    <MagneticButton variant="solid">Solid</MagneticButton>
    <MagneticButton variant="accent">Accent</MagneticButton>
    <MagneticButton variant="ghost">Ghost</MagneticButton>
    <MagneticButton disabled>Disabled</MagneticButton>
  </div>
);
