import { cva } from "class-variance-authority";
import type { VariantProps } from "class-variance-authority";
import type { ComponentProps } from "react";

import { CornerMarks } from "@/components/site/corner-marks";
import { cn } from "@/lib/utils";

const calloutVariants = cva(
  "relative my-8 flex flex-col gap-3 border p-5 md:p-6",
  {
    defaultVariants: { tone: "note" },
    variants: {
      tone: {
        note: "border-rule-strong bg-popover",
        sample: "border-ink bg-popover border-dashed",
        tip: "border-rule-strong bg-popover",
        warning:
          "border-ink bg-[repeating-linear-gradient(135deg,transparent_0_6px,var(--rule)_6px_7px)]",
      },
    },
  }
);

const calloutMarkVariants = cva("border-ink size-2 shrink-0 border", {
  defaultVariants: { tone: "note" },
  variants: {
    tone: {
      note: "bg-ink",
      sample: "border-dashed",
      tip: "bg-transparent",
      warning:
        "bg-[repeating-linear-gradient(135deg,var(--ink)_0_1px,transparent_1px_3px)]",
    },
  },
});

const defaultTitles = {
  note: "Note",
  sample: "Sample content",
  tip: "Tip",
  warning: "Watch out",
} as const;

export type CalloutTone = keyof typeof defaultTitles;

export interface CalloutProps
  extends
    Omit<ComponentProps<"aside">, "title">,
    VariantProps<typeof calloutVariants> {
  title?: string;
}

export const Callout = ({
  children,
  className,
  title,
  tone = "note",
  ...props
}: CalloutProps) => (
  <aside className={cn(calloutVariants({ tone }), className)} {...props}>
    {tone === "warning" ? <CornerMarks /> : null}
    <p className="label text-graphite flex items-center gap-2">
      <span aria-hidden className={calloutMarkVariants({ tone })} />
      {title ?? defaultTitles[tone ?? "note"]}
    </p>
    <div className="text-ink [&_p]:text-base/7 [&>*]:my-0 [&>*+*]:mt-3">
      {children}
    </div>
  </aside>
);
