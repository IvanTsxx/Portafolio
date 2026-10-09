"use client";

import { useRef } from "react";
import type { ReactNode } from "react";

import { motionKit } from "@/lib/motion/gsap";

const { gsap, useGSAP } = motionKit;

export const HeroChoreography = ({
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
        const timeline = gsap.timeline({
          defaults: { duration: 0.9, ease: "expo.out" },
          delay: 0.25,
        });
        timeline
          .fromTo(
            "[data-hero-rule]",
            { autoAlpha: 0, scaleX: 0 },
            {
              autoAlpha: 1,
              duration: 1.2,
              scaleX: 1,
              stagger: 0.08,
              transformOrigin: "left center",
            }
          )
          .fromTo(
            "[data-hero-frame]",
            { autoAlpha: 0, clipPath: "inset(0% 0% 100% 0%)" },
            { autoAlpha: 1, clipPath: "inset(0% 0% 0% 0%)", duration: 1.3 },
            0.1
          )
          .fromTo(
            "[data-hero-reveal]",
            { autoAlpha: 0, y: 12 },
            { autoAlpha: 1, stagger: 0.06, y: 0 },
            0.35
          );
      });
      media.add("(prefers-reduced-motion: reduce)", () => {
        gsap.set("[data-hero-rule], [data-hero-frame], [data-hero-reveal]", {
          autoAlpha: 1,
        });
      });
    },
    { scope: root }
  );

  return (
    <div className={className} ref={root}>
      {children}
    </div>
  );
};
