import {
  BlueprintPanel,
  BlueprintPanelContent,
  BlueprintPanelFooter,
  BlueprintPanelHeader,
} from "@/registry/ivan/ui/blueprint-panel";

const specs = [
  { label: "Frame", value: "Next.js" },
  { label: "Styles", value: "Tailwind v4" },
  { label: "Motion", value: "CSS and GSAP" },
  { label: "Tokens", value: "shadcn" },
] as const;

export const Example = () => (
  <BlueprintPanel className="w-full max-w-md">
    <BlueprintPanelHeader index="SH-01" meta="REV A">
      Spec sheet
    </BlueprintPanelHeader>
    <BlueprintPanelContent>
      <dl className="grid grid-cols-2 gap-x-6 gap-y-4">
        {specs.map((spec) => (
          <div className="flex flex-col gap-1" key={spec.label}>
            <dt className="text-muted-foreground font-mono text-xs tracking-widest uppercase">
              {spec.label}
            </dt>
            <dd className="text-foreground font-mono text-sm">{spec.value}</dd>
          </div>
        ))}
      </dl>
    </BlueprintPanelContent>
    <BlueprintPanelFooter>
      <span>Sample content</span>
    </BlueprintPanelFooter>
  </BlueprintPanel>
);
