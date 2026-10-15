"use client";

import { Playground } from "@/components/registry-docs/playground";
import type { Control } from "@/components/registry-docs/playground";
import {
  MagneticButton,
  MagneticLink,
  magneticButtonVariants,
} from "@/registry/ivan/ui/magnetic-button";
import type { MagneticButtonProps } from "@/registry/ivan/ui/magnetic-button";

interface ButtonValues {
  disabled: boolean;
  element: "button" | "link";
  index: string;
  label: string;
  size: NonNullable<MagneticButtonProps["size"]>;
  strength: number;
  variant: NonNullable<MagneticButtonProps["variant"]>;
}

const initialValues: ButtonValues = {
  disabled: false,
  element: "button",
  index: "",
  label: "Start the run",
  size: "md",
  strength: 8,
  variant: "outline",
};

const controls: readonly Control<keyof ButtonValues>[] = [
  {
    key: "variant",
    kind: "choice",
    label: "Variant",
    options: ["outline", "solid", "accent", "ghost"],
  },
  { key: "size", kind: "choice", label: "Size", options: ["sm", "md", "lg"] },
  {
    key: "element",
    kind: "choice",
    label: "Element",
    options: ["button", "link"],
  },
  {
    key: "strength",
    kind: "range",
    label: "Strength",
    max: 24,
    min: 0,
    unit: " px",
  },
  { key: "label", kind: "text", label: "Label", maxLength: 32 },
  { key: "index", kind: "text", label: "Index", maxLength: 4 },
  { key: "disabled", kind: "toggle", label: "Disabled" },
];

export const Demo = () => (
  <Playground controls={controls} initialValues={initialValues}>
    {(values) =>
      values.element === "link" ? (
        <MagneticLink
          aria-disabled={values.disabled || undefined}
          href="#preview"
          index={values.index || undefined}
          size={values.size}
          strength={values.strength}
          tabIndex={values.disabled ? -1 : undefined}
          variant={values.variant}
        >
          {values.label}
        </MagneticLink>
      ) : (
        <MagneticButton
          disabled={values.disabled}
          index={values.index || undefined}
          size={values.size}
          strength={values.strength}
          variant={values.variant}
        >
          {values.label}
        </MagneticButton>
      )
    }
  </Playground>
);

export const Thumbnail = () => (
  <div className="absolute inset-0 flex flex-wrap items-center justify-center gap-4 p-6">
    <span className={magneticButtonVariants({ variant: "accent" })}>
      Approve
    </span>
    <span className={magneticButtonVariants()}>
      <span className="tabular-nums opacity-60">02</span>
      Inspect
    </span>
  </div>
);
