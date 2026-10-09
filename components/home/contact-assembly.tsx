"use client";

import { useRef } from "react";
import type { ReactNode } from "react";

import { motionKit } from "@/lib/motion/gsap";
import { cn } from "@/lib/utils";

const { gsap, useGSAP } = motionKit;

const assemblyPieces = [
  { className: "top-0 left-0 border-t-2 border-l-2", from: { x: -40, y: -40 } },
  { className: "top-0 right-0 border-t-2 border-r-2", from: { x: 40, y: -40 } },
  {
    className: "bottom-0 left-0 border-b-2 border-l-2",
    from: { x: -40, y: 40 },
  },
  {
    className: "right-0 bottom-0 border-r-2 border-b-2",
    from: { x: 40, y: 40 },
  },
] as const;

export const ContactAssembly = ({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) => {
  const root = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const media = gsap.matchMedia();
      media.add("(prefers-reduced-motion: no-preference)", () => {
        const pieces = gsap.utils.toArray<HTMLElement>("[data-assembly-piece]");
        const timeline = gsap.timeline({
          defaults: { duration: 1, ease: "expo.out" },
          scrollTrigger: {
            once: true,
            start: "top 75%",
            trigger: root.current,
          },
        });
        timeline
          .from(pieces, {
            autoAlpha: 0,
            stagger: 0.05,
            x: (index) => assemblyPieces[index]?.from.x ?? 0,
            y: (index) => assemblyPieces[index]?.from.y ?? 0,
          })
          .from(
            "[data-assembly-frame]",
            { autoAlpha: 0, duration: 0.8, scale: 0.98 },
            0.2
          )
          .from(
            "[data-assembly-content]",
            { autoAlpha: 0, stagger: 0.08, y: 12 },
            0.45
          );
      });
    },
    { scope: root }
  );

  return (
    <div className={cn("relative", className)} ref={root}>
      {assemblyPieces.map((piece) => (
        <span
          aria-hidden
          className={cn(
            "border-clay pointer-events-none absolute z-10 size-6",
            piece.className
          )}
          data-assembly-piece
          key={piece.className}
        />
      ))}
      <div
        aria-hidden
        className="border-rule bg-card/40 absolute inset-0 border"
        data-assembly-frame
      />
      <div className="relative">{children}</div>
    </div>
  );
};
