import { cva } from "class-variance-authority";

export const specimenVariants = cva(
  "group border-rule ease-mechanical relative flex h-full flex-col gap-4 border-r border-b p-4 transition-colors duration-100 md:p-5",
  {
    defaultVariants: { surface: "plain" },
    variants: {
      interactive: {
        false: "",
        true: "pointer-fine:hover:bg-paper-deep/60 focus-visible:bg-paper-deep/60",
      },
      surface: {
        deep: "bg-paper-deep/40",
        hatch: "hatch",
        plain: "",
      },
    },
  }
);
