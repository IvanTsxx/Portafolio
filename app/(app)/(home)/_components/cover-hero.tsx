"use client";

import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { useRef } from "react";

gsap.registerPlugin(useGSAP);

export function CoverHero() {
  const containerRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();

      mm.add("(prefers-reduced-motion: no-preference)", () => {
        const tl = gsap.timeline({ defaults: { ease: "power4.out" } });

        // Reveal line first
        tl.fromTo(
          "[data-cover-line]",
          { scaleX: 0, transformOrigin: "left center" },
          { scaleX: 1, duration: 0.6 }
        );

        // Words enter from below, clipped by overflow-hidden parents
        tl.from(
          "[data-cover-word]",
          {
            y: "110%",
            duration: 0.75,
            stagger: 0.07,
          },
          "-=0.3"
        );

        // Eyebrow fades in
        tl.from(
          "[data-cover-meta]",
          { autoAlpha: 0, y: 8, duration: 0.5 },
          "-=0.3"
        );
      });

      return () => mm.revert();
    },
    { scope: containerRef }
  );

  return (
    <div
      ref={containerRef}
      className="w-full border-b border-border bg-foreground text-background overflow-hidden select-none"
      aria-hidden="true"
    >
      {/* Top accent line */}
      <div
        data-cover-line
        className="h-[3px] w-full bg-brand-green"
      />

      <div className="px-4 pt-6 pb-4 lg:px-6">
        {/* Big display type — each word in its own overflow clip */}
        <div className="flex flex-wrap gap-x-[0.18em] leading-none">
          {["IVAN", "BONGIOVANNI"].map((word) => (
            <div key={word} className="overflow-hidden">
              <span
                data-cover-word
                className="block font-pixel-triangle text-[clamp(3.5rem,12vw,9rem)] font-bold tracking-tight"
              >
                {word}
              </span>
            </div>
          ))}
        </div>

        {/* Second row: role + year range */}
        <div className="mt-2 flex items-end justify-between gap-4">
          <div className="overflow-hidden">
            <span
              data-cover-word
              className="block font-pixel-triangle text-[clamp(1.25rem,4.5vw,3rem)] tracking-widest text-brand-green font-bold"
            >
              NEXT.JS&nbsp;DEVELOPER
            </span>
          </div>

          {/* Meta: right-aligned eyebrow */}
          <p
            data-cover-meta
            className="hidden sm:block font-mono text-[11px] uppercase tracking-[0.2em] text-background/50 whitespace-nowrap pb-1"
          >
            Full&nbsp;Stack&nbsp;·&nbsp;2020&nbsp;—&nbsp;present
          </p>
        </div>
      </div>

      {/* Bottom ticker strip */}
      <div
        data-cover-meta
        className="border-t border-background/10 px-4 py-2 lg:px-6 flex items-center gap-6 overflow-hidden"
      >
        <MarqueeStrip />
      </div>
    </div>
  );
}

const TICKER_ITEMS = [
  "Next.js",
  "·",
  "React",
  "·",
  "TypeScript",
  "·",
  "PostgreSQL",
  "·",
  "GSAP",
  "·",
  "Vercel",
  "·",
  "Drizzle",
  "·",
  "Better Auth",
  "·",
];

function MarqueeStrip() {
  // Duplicate for seamless loop
  const items = [...TICKER_ITEMS, ...TICKER_ITEMS];

  return (
    <div className="relative w-full overflow-hidden">
      <div
        className="flex gap-6 w-max"
        style={{
          animation: "marquee-scroll 22s linear infinite",
        }}
      >
        {items.map((item, i) => (
          <span
            key={i}
            className="font-mono text-[11px] uppercase tracking-[0.18em] text-background/50 whitespace-nowrap"
          >
            {item}
          </span>
        ))}
      </div>
    </div>
  );
}
