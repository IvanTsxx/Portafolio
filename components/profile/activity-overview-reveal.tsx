"use client";

import { useRef } from "react";
import type { ReactNode } from "react";

import { RADAR_CENTER, RADAR_VERTEX } from "./radar";
import { countUp, selectAll, useEnterReveal } from "./use-enter-reveal";

const collapsedPoints = (polygon: SVGPolygonElement) =>
  Array.from(
    { length: polygon.points.numberOfItems },
    () => `${RADAR_CENTER},${RADAR_CENTER}`
  ).join(" ");

export const ActivityOverviewReveal = ({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) => {
  const revealRef = useRef<HTMLDivElement>(null);

  useEnterReveal(revealRef, (root, timeline) => {
    const area = root.querySelector<SVGPolygonElement>("[data-radar-area]");
    timeline
      .from(
        selectAll(root, "[data-radar-ring]"),
        { duration: 0.6, ease: "power2.out", opacity: 0, stagger: 0.08 },
        0
      )
      .from(
        selectAll(root, "[data-radar-axis='x']"),
        { attr: { x1: RADAR_CENTER, x2: RADAR_CENTER }, duration: 0.8 },
        0.1
      )
      .from(
        selectAll(root, "[data-radar-axis='y']"),
        { attr: { y1: RADAR_CENTER, y2: RADAR_CENTER }, duration: 0.8 },
        0.2
      )
      .from(
        selectAll(root, "[data-radar-tick]"),
        {
          duration: 0.3,
          ease: "power1.out",
          opacity: 0,
          stagger: { each: 0.04, from: "center" },
        },
        0.3
      )
      .from(
        selectAll(root, "[data-radar-vertex]"),
        {
          attr: {
            x: RADAR_CENTER - RADAR_VERTEX / 2,
            y: RADAR_CENTER - RADAR_VERTEX / 2,
          },
          duration: 1.1,
        },
        0.55
      )
      .from(
        selectAll(root, "[data-radar-label]"),
        { duration: 0.5, ease: "power2.out", opacity: 0, stagger: 0.06 },
        0.45
      )
      .fromTo(
        selectAll(root, "[data-ratio-bar]"),
        { clipPath: "inset(0% 100% 0% 0%)" },
        {
          clearProps: "clipPath",
          clipPath: "inset(0% 0% 0% 0%)",
          duration: 1.2,
          ease: "power3.inOut",
        },
        0.25
      )
      .from(
        selectAll(root, "[data-ratio-row]"),
        { duration: 0.5, ease: "power2.out", opacity: 0, stagger: 0.07 },
        0.35
      );
    if (area) {
      timeline.from(
        area,
        { attr: { points: collapsedPoints(area) }, duration: 1.1 },
        0.55
      );
    }
    return countUp(timeline, selectAll(root, "[data-count-to]"), {
      duration: 1.1,
      position: 0.55,
    });
  });

  return (
    <div className={className} ref={revealRef}>
      {children}
    </div>
  );
};
