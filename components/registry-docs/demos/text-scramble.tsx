"use client";

import { Playground } from "@/components/registry-docs/playground";
import type { Control } from "@/components/registry-docs/playground";
import { TextScramble } from "@/registry/ivan/ui/text-scramble";
import type { TextScrambleProps } from "@/registry/ivan/ui/text-scramble";

interface ScrambleValues {
  charset: NonNullable<TextScrambleProps["charset"]>;
  duration: number;
  text: string;
  tone: NonNullable<TextScrambleProps["tone"]>;
  trigger: NonNullable<TextScrambleProps["trigger"]>;
  variant: NonNullable<TextScrambleProps["variant"]>;
}

const initialValues: ScrambleValues = {
  charset: "technical",
  duration: 900,
  text: "Systems designed in the open",
  tone: "default",
  trigger: "mount",
  variant: "heading",
};

const controls: readonly Control<keyof ScrambleValues>[] = [
  { key: "text", kind: "text", label: "Text", maxLength: 64 },
  {
    key: "trigger",
    kind: "choice",
    label: "Trigger",
    options: ["mount", "visible", "hover", "manual"],
  },
  {
    key: "variant",
    kind: "choice",
    label: "Variant",
    options: ["label", "heading", "body"],
  },
  {
    key: "tone",
    kind: "choice",
    label: "Tone",
    options: ["default", "muted", "accent"],
  },
  {
    key: "charset",
    kind: "choice",
    label: "Charset",
    options: ["technical", "alpha", "binary", "hex", "blocks"],
  },
  {
    key: "duration",
    kind: "range",
    label: "Duration",
    max: 3000,
    min: 300,
    step: 100,
    unit: " ms",
  },
];

export const Demo = () => (
  <Playground controls={controls} initialValues={initialValues}>
    {(values, { runId }) => (
      <TextScramble
        charset={values.charset}
        duration={values.duration}
        key={values.trigger === "manual" ? "manual" : runId}
        replayKey={runId}
        text={values.text}
        tone={values.tone}
        trigger={values.trigger}
        variant={values.variant}
      />
    )}
  </Playground>
);

export const Thumbnail = () => (
  <div className="absolute inset-0 flex flex-col items-start justify-center gap-3 p-6">
    <TextScramble text="AG-03 / Builder" trigger="mount" />
    <TextScramble
      text="Resolve before you ship"
      tone="accent"
      trigger="mount"
      variant="heading"
    />
  </div>
);
