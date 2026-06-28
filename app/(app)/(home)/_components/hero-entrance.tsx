"use client";

import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { useRef } from "react";

gsap.registerPlugin(useGSAP);

export function HeroEntrance({ children }: { children: React.ReactNode }) {
  const containerRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();

      mm.add("(prefers-reduced-motion: no-preference)", () => {
        const tl = gsap.timeline({
          defaults: { ease: "power3.out" },
          delay: 0.85, // let cover hero animate first
        });

        tl.from("[data-hero-avatar]", {
          scale: 0.82,
          autoAlpha: 0,
          duration: 0.55,
          ease: "back.out(1.5)",
        });

        tl.from(
          "[data-hero-name]",
          { x: -12, autoAlpha: 0, duration: 0.45 },
          "-=0.3"
        );

        tl.from(
          "[data-hero-flip]",
          { autoAlpha: 0, duration: 0.35 },
          "-=0.2"
        );

        tl.from(
          "[data-hero-visitors]",
          { autoAlpha: 0, y: 6, duration: 0.4 },
          "-=0.1"
        );

        tl.from(
          "[data-hero-social]",
          { y: 14, autoAlpha: 0, duration: 0.5, stagger: 0.07 },
          "-=0.2"
        );
      });

      return () => mm.revert();
    },
    { scope: containerRef }
  );

  return (
    <div
      ref={containerRef}
      className="flex flex-col flex-1 items-start gap-y-4 w-full"
    >
      {children}
    </div>
  );
}
