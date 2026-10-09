import { cva } from "class-variance-authority";
import type { VariantProps } from "class-variance-authority";
import type { ComponentProps, ReactNode } from "react";

import { cn } from "@/lib/utils";

const blueprintPanelVariants = cva("relative flex flex-col border", {
  defaultVariants: { tone: "default" },
  variants: {
    tone: {
      clay: "border-border bg-card text-card-foreground [--bp-marker:var(--clay)]",
      default:
        "border-border bg-card text-card-foreground [--bp-marker:var(--muted-foreground)]",
      inset:
        "border-border bg-muted/40 text-foreground [--bp-marker:var(--muted-foreground)]",
    },
  },
});

const markerPositions = [
  "-top-1 -left-1 border-t border-l",
  "-top-1 -right-1 border-t border-r",
  "-bottom-1 -left-1 border-b border-l",
  "-right-1 -bottom-1 border-r border-b",
] as const;

type BlueprintPanelProps = ComponentProps<"section"> &
  VariantProps<typeof blueprintPanelVariants> & {
    markers?: boolean;
  };

const BlueprintPanel = ({
  children,
  className,
  markers = true,
  tone,
  ...props
}: BlueprintPanelProps) => (
  <section
    className={cn(blueprintPanelVariants({ tone }), className)}
    data-slot="blueprint-panel"
    {...props}
  >
    {markers
      ? markerPositions.map((position) => (
          <span
            aria-hidden="true"
            className={cn(
              "pointer-events-none absolute size-2 border-(--bp-marker)",
              position
            )}
            data-slot="blueprint-panel-marker"
            key={position}
          />
        ))
      : null}
    {children}
  </section>
);

type BlueprintPanelHeaderProps = Omit<ComponentProps<"header">, "title"> & {
  headingLevel?: "h2" | "h3" | "h4";
  index?: string;
  meta?: ReactNode;
};

const BlueprintPanelHeader = ({
  children,
  className,
  headingLevel: Heading = "h3",
  index,
  meta,
  ...props
}: BlueprintPanelHeaderProps) => (
  <header
    className={cn(
      "border-border flex h-10 items-center gap-3 border-b px-4 font-mono text-xs tracking-widest uppercase",
      className
    )}
    data-slot="blueprint-panel-header"
    {...props}
  >
    {index ? <span className="text-muted-foreground">{index}</span> : null}
    <Heading className="text-foreground truncate font-normal">
      {children}
    </Heading>
    {meta ? (
      <span className="text-muted-foreground ml-auto shrink-0">{meta}</span>
    ) : null}
  </header>
);

const BlueprintPanelContent = ({
  className,
  ...props
}: ComponentProps<"div">) => (
  <div
    className={cn("flex-1 p-4", className)}
    data-slot="blueprint-panel-content"
    {...props}
  />
);

const BlueprintPanelFooter = ({
  className,
  ...props
}: ComponentProps<"footer">) => (
  <footer
    className={cn(
      "border-border text-muted-foreground flex items-center gap-3 border-t px-4 py-3 font-mono text-xs tracking-widest uppercase",
      className
    )}
    data-slot="blueprint-panel-footer"
    {...props}
  />
);

export {
  BlueprintPanel,
  BlueprintPanelContent,
  BlueprintPanelFooter,
  BlueprintPanelHeader,
};
export type { BlueprintPanelHeaderProps, BlueprintPanelProps };
