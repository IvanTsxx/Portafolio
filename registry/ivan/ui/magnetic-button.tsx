"use client";

import { cva } from "class-variance-authority";
import type { VariantProps } from "class-variance-authority";
import type {
  ComponentProps,
  CSSProperties,
  PointerEvent,
  ReactNode,
} from "react";

import { cn } from "@/lib/utils";
import { usePrefersReducedMotion } from "@/registry/ivan/hooks/use-prefers-reduced-motion";

const magneticButtonVariants = cva(
  "ease-out-expo group-focus-visible/mb:ring-ring group-focus-visible/mb:ring-offset-background relative flex translate-x-(--mb-x) translate-y-(--mb-y) items-center justify-center border font-mono tracking-widest whitespace-nowrap uppercase transition-[translate,scale,color,border-color] duration-500 group-focus-visible/mb:ring-2 group-focus-visible/mb:ring-offset-2 group-active/mb:scale-97 group-disabled/mb:opacity-50 group-aria-disabled/mb:opacity-50 group-data-[tracking=true]/mb:duration-100 motion-reduce:transition-none",
  {
    defaultVariants: { size: "md", variant: "outline" },
    variants: {
      size: {
        lg: "h-14 gap-3 px-8 text-sm",
        md: "h-11 gap-2 px-6 text-xs",
        sm: "h-9 gap-2 px-4 text-xs",
      },
      variant: {
        accent:
          "border-clay text-clay group-hover/mb:text-primary-foreground group-focus-visible/mb:text-primary-foreground",
        ghost:
          "text-muted-foreground group-hover/mb:text-foreground group-focus-visible/mb:text-foreground border-transparent",
        outline:
          "border-foreground/40 text-foreground group-hover/mb:border-clay group-hover/mb:text-primary-foreground group-focus-visible/mb:border-clay group-focus-visible/mb:text-primary-foreground",
        solid:
          "border-foreground bg-foreground text-background group-hover/mb:border-clay group-hover/mb:text-primary-foreground group-focus-visible/mb:border-clay group-focus-visible/mb:text-primary-foreground",
      },
    },
  }
);

const fieldClassName =
  "group/mb relative inline-flex min-h-11 min-w-11 cursor-pointer touch-manipulation items-center justify-center outline-none select-none disabled:pointer-events-none aria-disabled:pointer-events-none";

const fillClassName =
  "absolute inset-0 origin-left scale-x-0 transition-transform duration-300 ease-out-expo group-hover/mb:scale-x-100 group-focus-visible/mb:scale-x-100 group-active/mb:scale-x-100 motion-reduce:transition-none";

const markerClassNames = [
  "-top-1.5 -left-1.5 border-t border-l group-hover/mb:-translate-x-0.5 group-hover/mb:-translate-y-0.5",
  "-top-1.5 -right-1.5 border-t border-r group-hover/mb:translate-x-0.5 group-hover/mb:-translate-y-0.5",
  "-bottom-1.5 -left-1.5 border-b border-l group-hover/mb:-translate-x-0.5 group-hover/mb:translate-y-0.5",
  "-right-1.5 -bottom-1.5 border-r border-b group-hover/mb:translate-x-0.5 group-hover/mb:translate-y-0.5",
] as const;

type MagnetStyle = CSSProperties & {
  "--mb-label-x": string;
  "--mb-label-y": string;
  "--mb-x": string;
  "--mb-y": string;
};

const restStyle: MagnetStyle = {
  "--mb-label-x": "0px",
  "--mb-label-y": "0px",
  "--mb-x": "0px",
  "--mb-y": "0px",
};

const pullFactor = 0.3;
const labelParallax = 0.5;

const clamp = (value: number, limit: number) =>
  Math.min(limit, Math.max(-limit, value));

const isFinePointer = (event: PointerEvent<HTMLElement>) =>
  event.pointerType === "mouse" || event.pointerType === "pen";

const setOffset = (element: HTMLElement, x: number, y: number) => {
  element.style.setProperty("--mb-x", `${x.toFixed(2)}px`);
  element.style.setProperty("--mb-y", `${y.toFixed(2)}px`);
  element.style.setProperty(
    "--mb-label-x",
    `${(x * labelParallax).toFixed(2)}px`
  );
  element.style.setProperty(
    "--mb-label-y",
    `${(y * labelParallax).toFixed(2)}px`
  );
};

const releaseMagnet = (event: PointerEvent<HTMLElement>) => {
  delete event.currentTarget.dataset.tracking;
  setOffset(event.currentTarget, 0, 0);
};

const useMagnet = (strength: number) => {
  const reducedMotion = usePrefersReducedMotion();
  const limit = Math.min(24, Math.max(0, strength));

  const onPointerEnter = (event: PointerEvent<HTMLElement>) => {
    if (reducedMotion || !isFinePointer(event)) {
      return;
    }
    event.currentTarget.dataset.tracking = "true";
  };

  const onPointerMove = (event: PointerEvent<HTMLElement>) => {
    if (reducedMotion || !isFinePointer(event)) {
      return;
    }
    const element = event.currentTarget;
    const rect = element.getBoundingClientRect();
    const offsetX = event.clientX - (rect.left + rect.width / 2);
    const offsetY = event.clientY - (rect.top + rect.height / 2);
    setOffset(
      element,
      clamp(offsetX * pullFactor, limit),
      clamp(offsetY * pullFactor, limit)
    );
  };

  return { onPointerEnter, onPointerLeave: releaseMagnet, onPointerMove };
};

interface MagneticOwnProps extends VariantProps<typeof magneticButtonVariants> {
  index?: string;
  strength?: number;
}

const MagneticSurface = ({
  children,
  index,
  size,
  variant,
}: MagneticOwnProps & { children: ReactNode }) => (
  <span
    className={magneticButtonVariants({ size, variant })}
    data-slot="magnetic-button-surface"
  >
    <span
      aria-hidden="true"
      className={cn(
        fillClassName,
        variant === "ghost" ? "bg-accent" : "bg-clay"
      )}
    />
    {markerClassNames.map((marker) => (
      <span
        aria-hidden="true"
        className={cn(
          "border-clay ease-out-expo pointer-events-none absolute size-1.5 opacity-0 transition-[opacity,translate] duration-300 group-hover/mb:opacity-100 group-focus-visible/mb:opacity-100 motion-reduce:transition-none",
          marker
        )}
        key={marker}
      />
    ))}
    <span className="ease-out-expo relative flex translate-x-(--mb-label-x) translate-y-(--mb-label-y) items-center gap-2 transition-transform duration-500 group-data-[tracking=true]/mb:duration-100 motion-reduce:transition-none">
      {index ? (
        <span aria-hidden="true" className="tabular-nums opacity-60">
          {index}
        </span>
      ) : null}
      {children}
    </span>
  </span>
);

const composeHandler =
  <Event,>(first: (event: Event) => void, second?: (event: Event) => void) =>
  (event: Event) => {
    first(event);
    second?.(event);
  };

type MagneticButtonProps = Omit<ComponentProps<"button">, "children"> &
  MagneticOwnProps & { children: ReactNode };

const MagneticButton = ({
  children,
  className,
  index,
  onPointerEnter,
  onPointerLeave,
  onPointerMove,
  size,
  strength = 8,
  style,
  variant,
  ...props
}: MagneticButtonProps) => {
  const magnet = useMagnet(strength);

  return (
    <button
      className={cn(fieldClassName, className)}
      data-slot="magnetic-button"
      onPointerEnter={composeHandler(magnet.onPointerEnter, onPointerEnter)}
      onPointerLeave={composeHandler(magnet.onPointerLeave, onPointerLeave)}
      onPointerMove={composeHandler(magnet.onPointerMove, onPointerMove)}
      style={{ ...restStyle, ...style }}
      type="button"
      {...props}
    >
      <MagneticSurface index={index} size={size} variant={variant}>
        {children}
      </MagneticSurface>
    </button>
  );
};

type MagneticLinkProps = Omit<ComponentProps<"a">, "children"> &
  MagneticOwnProps & { children: ReactNode; href: string };

const MagneticLink = ({
  children,
  className,
  index,
  onPointerEnter,
  onPointerLeave,
  onPointerMove,
  size,
  strength = 8,
  style,
  variant,
  ...props
}: MagneticLinkProps) => {
  const magnet = useMagnet(strength);

  return (
    <a
      className={cn(fieldClassName, className)}
      data-slot="magnetic-link"
      onPointerEnter={composeHandler(magnet.onPointerEnter, onPointerEnter)}
      onPointerLeave={composeHandler(magnet.onPointerLeave, onPointerLeave)}
      onPointerMove={composeHandler(magnet.onPointerMove, onPointerMove)}
      style={{ ...restStyle, ...style }}
      {...props}
    >
      <MagneticSurface index={index} size={size} variant={variant}>
        {children}
      </MagneticSurface>
    </a>
  );
};

export { MagneticButton, MagneticLink, magneticButtonVariants };
export type { MagneticButtonProps, MagneticLinkProps };
