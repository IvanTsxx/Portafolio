import { cva } from "class-variance-authority";

export const focusRingClassName =
  "outline-none focus-visible:ring-2 focus-visible:ring-ink focus-visible:ring-offset-2 focus-visible:ring-offset-paper";

export const linkClassName = `underline decoration-graphite/40 decoration-dotted underline-offset-4 transition-[text-decoration-color] duration-100 ease-mechanical hover:decoration-ink hover:decoration-solid ${focusRingClassName}`;

export const technicalButtonVariants = cva(
  `label ease-mechanical relative inline-flex cursor-pointer items-center justify-center gap-2 border transition-[background-color,color,border-color,translate] duration-100 active:translate-y-px disabled:cursor-not-allowed disabled:opacity-50 ${focusRingClassName}`,
  {
    defaultVariants: { size: "md", tone: "outline" },
    variants: {
      size: {
        md: "min-h-11 px-4",
        sm: "h-8 px-3 before:absolute before:inset-x-0 before:-inset-y-2",
      },
      tone: {
        outline:
          "border-graphite/60 text-ink hover:border-ink hover:bg-ink hover:text-paper bg-transparent",
        selected: "border-ink bg-graphite text-paper",
        solid: "border-ink bg-ink text-paper hover:bg-paper hover:text-ink",
      },
    },
  }
);

export const chipClassName = `label inline-flex min-h-11 items-center gap-2 border border-graphite/60 px-3 text-ink transition-colors duration-100 ease-mechanical hover:border-ink hover:bg-ink hover:text-paper aria-pressed:border-ink aria-pressed:bg-ink aria-pressed:text-paper md:min-h-8 ${focusRingClassName}`;

export const hoverRowClassName =
  "transition-colors duration-100 ease-mechanical hover:bg-paper-deep/60 has-[a:focus-visible]:bg-paper-deep/60 has-[a:focus-visible]:outline-2 has-[a:focus-visible]:-outline-offset-2 has-[a:focus-visible]:outline-ink";

export const dotItemClassName = `ease-mechanical text-graphite hover:text-ink aria-pressed:text-ink aria-[current=location]:text-ink before:bg-ink flex min-h-11 items-center gap-3 text-sm transition-colors duration-100 before:size-1.5 before:shrink-0 before:opacity-0 before:transition-opacity before:duration-100 aria-pressed:before:opacity-100 aria-[current=location]:before:opacity-100 xl:min-h-8 ${focusRingClassName}`;
