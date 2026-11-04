import { cva } from "class-variance-authority";

export const focusRingClassName =
  "outline-none focus-visible:ring-1 focus-visible:ring-focus focus-visible:ring-offset-2 focus-visible:ring-offset-background";

export const linkClassName = `underline decoration-muted-foreground/40 decoration-dotted underline-offset-4 transition-[text-decoration-color] duration-100 ease-mechanical hover:decoration-foreground hover:decoration-solid ${focusRingClassName}`;

export const technicalButtonVariants = cva(
  `ease-out-quart rounded-pill relative inline-flex cursor-pointer items-center justify-center gap-2 border text-sm transition-[background-color,color,border-color,scale] duration-200 active:scale-97 disabled:cursor-not-allowed disabled:opacity-50 ${focusRingClassName}`,
  {
    defaultVariants: { size: "md", tone: "outline" },
    variants: {
      size: {
        md: "min-h-10 px-4",
        sm: "h-8 px-3 text-xs before:absolute before:inset-x-0 before:-inset-y-2",
      },
      tone: {
        outline:
          "border-border-strong text-foreground hover:border-foreground hover:bg-foreground/5 bg-transparent",
        selected: "border-foreground bg-foreground text-background",
        solid:
          "border-foreground bg-foreground text-background hover:bg-foreground/85",
      },
    },
  }
);

export const chipClassName = `inline-flex min-h-9 items-center gap-2 rounded-pill border border-border px-3.5 text-sm text-muted-foreground transition-colors duration-200 hover:border-border-strong hover:text-foreground aria-pressed:border-foreground aria-pressed:bg-foreground aria-pressed:text-background ${focusRingClassName}`;

export const hoverRowClassName =
  "transition-colors duration-100 ease-mechanical hover:bg-surface/60 has-[a:focus-visible]:bg-surface/60 has-[a:focus-visible]:outline-2 has-[a:focus-visible]:-outline-offset-2 has-[a:focus-visible]:outline-foreground";
