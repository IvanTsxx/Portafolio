"use client";

import { Playground } from "@/components/registry-docs/playground";
import type { Control } from "@/components/registry-docs/playground";
import {
  BlueprintPanel,
  BlueprintPanelContent,
  BlueprintPanelFooter,
  BlueprintPanelHeader,
} from "@/registry/ivan/ui/blueprint-panel";
import type { BlueprintPanelProps } from "@/registry/ivan/ui/blueprint-panel";

interface PanelValues {
  index: string;
  markers: boolean;
  showFooter: boolean;
  title: string;
  tone: NonNullable<BlueprintPanelProps["tone"]>;
}

const initialValues: PanelValues = {
  index: "SH-01",
  markers: true,
  showFooter: true,
  title: "Spec sheet",
  tone: "default",
};

const controls: readonly Control<keyof PanelValues>[] = [
  {
    key: "tone",
    kind: "choice",
    label: "Tone",
    options: ["default", "inset", "clay"],
  },
  { key: "title", kind: "text", label: "Title", maxLength: 32 },
  { key: "index", kind: "text", label: "Index", maxLength: 8 },
  { key: "markers", kind: "toggle", label: "Corner marks" },
  { key: "showFooter", kind: "toggle", label: "Footer" },
];

const specs = [
  { label: "Frame", value: "Next.js" },
  { label: "Styles", value: "Tailwind v4" },
  { label: "Motion", value: "CSS and GSAP" },
  { label: "Tokens", value: "shadcn" },
] as const;

const SpecList = () => (
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
);

export const Demo = () => (
  <Playground controls={controls} initialValues={initialValues}>
    {(values) => (
      <BlueprintPanel
        className="w-full max-w-md"
        markers={values.markers}
        tone={values.tone}
      >
        <BlueprintPanelHeader index={values.index || undefined} meta="REV A">
          {values.title}
        </BlueprintPanelHeader>
        <BlueprintPanelContent>
          <SpecList />
        </BlueprintPanelContent>
        {values.showFooter ? (
          <BlueprintPanelFooter>
            <span>Sample content</span>
          </BlueprintPanelFooter>
        ) : null}
      </BlueprintPanel>
    )}
  </Playground>
);

export const Thumbnail = () => (
  <div className="absolute inset-0 flex items-center justify-center p-8">
    <BlueprintPanel className="w-full max-w-72">
      <BlueprintPanelHeader index="SH-01" meta="REV A">
        Spec sheet
      </BlueprintPanelHeader>
      <BlueprintPanelContent>
        <SpecList />
      </BlueprintPanelContent>
    </BlueprintPanel>
  </div>
);
