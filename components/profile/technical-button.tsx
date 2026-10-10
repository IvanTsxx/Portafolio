import { cva } from "class-variance-authority";
import type { VariantProps } from "class-variance-authority";
import type { ComponentProps } from "react";

import { cn } from "@/lib/utils";

const technicalButton = cva(
  "label ease-mechanical inline-flex h-11 cursor-pointer items-center justify-center gap-2 border px-4 transition-[background-color,color,border-color,translate] duration-100 select-none active:translate-y-px disabled:cursor-not-allowed disabled:opacity-50",
  {
    defaultVariants: { tone: "outline" },
    variants: {
      tone: {
        outline:
          "border-rule-strong text-ink pointer-fine:hover:border-ink pointer-fine:hover:bg-ink pointer-fine:hover:text-paper bg-transparent",
        selected: "border-ink bg-graphite text-paper",
        solid:
          "border-ink bg-ink text-paper pointer-fine:hover:bg-paper pointer-fine:hover:text-ink",
      },
    },
  }
);

type TechnicalButtonProps = Omit<ComponentProps<"button">, "type"> &
  VariantProps<typeof technicalButton>;

export const TechnicalButton = ({
  tone,
  className,
  ...props
}: TechnicalButtonProps) => (
  <button
    className={cn(technicalButton({ tone }), className)}
    {...props}
    type="button"
  />
);
