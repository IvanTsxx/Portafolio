import { cva } from "class-variance-authority";
import type { VariantProps } from "class-variance-authority";
import type { ComponentProps } from "react";

import { cn } from "@/lib/utils";

const calloutVariants = cva(
  "border-rule-strong bg-card my-8 flex flex-col gap-3 rounded-sm border p-5 md:p-6",
  {
    defaultVariants: { tone: "note" },
    variants: {
      tone: {
        note: "",
        sample: "",
        tip: "",
        warning: "",
      },
    },
  }
);

const calloutDotVariants = cva("size-1.5 shrink-0 rounded-full", {
  defaultVariants: { tone: "note" },
  variants: {
    tone: {
      note: "bg-signal-steel",
      sample: "bg-signal-steel",
      tip: "bg-signal-moss",
      warning: "bg-signal-rust",
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
    <p className="label text-muted-foreground flex items-center gap-2">
      <span aria-hidden className={calloutDotVariants({ tone })} />
      {title ?? defaultTitles[tone ?? "note"]}
    </p>
    <div className="text-foreground/90 [&_p]:text-base/7 [&>*]:my-0 [&>*+*]:mt-3">
      {children}
    </div>
  </aside>
);
