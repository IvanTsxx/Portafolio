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
        const tl = gsap.timeline({ defaults: { ease: "power3.out" } });

        tl.from("[data-hero-title]", {
          y: 24,
          autoAlpha: 0,
          duration: 0.65,
        });

        tl.from(
          "[data-hero-avatar]",
          {
            scale: 0.88,
            autoAlpha: 0,
            duration: 0.5,
            ease: "back.out(1.4)",
          },
          "-=0.35"
        );

        tl.from(
          "[data-hero-name]",
          {
            x: -10,
            autoAlpha: 0,
            duration: 0.45,
          },
          "-=0.35"
        );

        tl.from(
          "[data-hero-flip]",
          {
            autoAlpha: 0,
            duration: 0.35,
          },
          "-=0.2"
        );

        tl.from(
          "[data-hero-social]",
          {
            y: 12,
            autoAlpha: 0,
            duration: 0.5,
            stagger: 0.08,
          },
          "-=0.15"
        );
      });

      return () => {
        mm.revert();
      };
    },
    { scope: containerRef }
  );

  return (
    <div ref={containerRef} className="flex flex-col flex-1 items-start gap-y-4">
      {children}
    </div>
  );
}
