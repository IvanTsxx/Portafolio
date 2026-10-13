"use client";

import { Playground } from "@/components/registry-docs/playground";
import type { Control } from "@/components/registry-docs/playground";
import { CopyEmail } from "@/registry/ivan/ui/copy-email";
import type { CopyEmailProps } from "@/registry/ivan/ui/copy-email";

interface CopyEmailValues {
  email: string;
  label: string;
  size: NonNullable<CopyEmailProps["size"]>;
}

const initialValues: CopyEmailValues = {
  email: "hello@example.com",
  label: "",
  size: "md",
};

const controls: readonly Control<keyof CopyEmailValues>[] = [
  { key: "size", kind: "choice", label: "Size", options: ["sm", "md", "lg"] },
  { key: "email", kind: "text", label: "Email", maxLength: 48 },
  { key: "label", kind: "text", label: "Label", maxLength: 32 },
];

export const Demo = () => (
  <Playground controls={controls} initialValues={initialValues}>
    {(values) => (
      <CopyEmail
        email={values.email || "hello@example.com"}
        label={values.label || undefined}
        size={values.size}
      />
    )}
  </Playground>
);

export const Thumbnail = () => (
  <div className="absolute inset-0 flex items-center justify-center p-6">
    <CopyEmail email="hello@example.com" />
  </div>
);
