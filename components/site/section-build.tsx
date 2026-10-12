"use client";

import { useLayoutEffect, useRef } from "react";
import type { ReactNode } from "react";

const buildSeconds = 1.4;
const startLine = 0.85;
const reducedMotionQuery = "(prefers-reduced-motion: reduce)";

const scaffoldEdges = [
  "inset-x-0 top-0 h-px origin-left scale-x-0 group-data-[build=building]/build:scale-x-100",
  "inset-y-0 right-0 w-px origin-top scale-y-0 delay-150 group-data-[build=building]/build:scale-y-100",
  "inset-x-0 bottom-0 h-px origin-right scale-x-0 delay-300 group-data-[build=building]/build:scale-x-100",
  "inset-y-0 left-0 w-px origin-bottom scale-y-0 delay-150 group-data-[build=building]/build:scale-y-100",
] as const;

export const SectionBuild = ({
  children,
  code,
}: {
  children: ReactNode;
  code: string;
}) => {
  const site = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const element = site.current;
    if (
      !element ||
      window.matchMedia(reducedMotionQuery).matches ||
      element.getBoundingClientRect().top < window.innerHeight * startLine
    ) {
      return;
    }
    let finish = 0;
    element.dataset.build = "pending";
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry?.isIntersecting) {
          return;
        }
        observer.disconnect();
        element.dataset.build = "building";
        finish = window.setTimeout(() => {
          element.dataset.build = "built";
        }, buildSeconds * 1000);
      },
      { rootMargin: "0px 0px -15% 0px" }
    );
    observer.observe(element);
    return () => {
      observer.disconnect();
      window.clearTimeout(finish);
      delete element.dataset.build;
    };
  }, []);

  return (
    <div className="group/build relative" ref={site}>
      <div
        aria-hidden
        className="ease-out-quart pointer-events-none absolute -inset-2 hidden transition-opacity duration-300 select-none group-data-[build=building]/build:block group-data-[build=built]/build:block group-data-[build=built]/build:opacity-0 group-data-[build=pending]/build:block"
      >
        <span className="blueprint-dots absolute inset-0 opacity-0 transition-opacity delay-300 duration-500 group-data-[build=building]/build:opacity-100" />
        {scaffoldEdges.map((edge) => (
          <span
            className={`bg-rule-strong ease-out-quart absolute block transition-transform duration-500 ${edge}`}
            key={edge}
          />
        ))}
        <span className="label text-mist bg-paper absolute -top-2 left-4 px-2 tabular-nums">
          [ {code} ] Building <span className="jp">建設中</span>
        </span>
      </div>
      <div className="ease-out-quart flex flex-col gap-6 transition-[opacity,clip-path,translate] delay-300 duration-700 group-data-[build=building]/build:[clip-path:inset(0)] group-data-[build=pending]/build:translate-y-3 group-data-[build=pending]/build:opacity-0 group-data-[build=pending]/build:[clip-path:inset(0_0_100%_0)]">
        {children}
      </div>
    </div>
  );
};
