"use client";

import { useEffect, useRef, useState } from "react";
import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

const reducedMotionQuery = "(prefers-reduced-motion: reduce)";

type PrintState = "printed" | "waiting";

export const PrintOnView = ({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) => {
  const root = useRef<HTMLDivElement>(null);
  const [state, setState] = useState<PrintState>("printed");

  useEffect(() => {
    const element = root.current;
    const isBelowFold =
      element !== null &&
      element.getBoundingClientRect().top > window.innerHeight;
    if (!isBelowFold || window.matchMedia(reducedMotionQuery).matches) {
      return;
    }
    setState("waiting");
    const sight = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          setState("printed");
          sight.disconnect();
        }
      },
      { rootMargin: "0px 0px -12% 0px" }
    );
    sight.observe(element);
    return () => sight.disconnect();
  }, []);

  return (
    <div
      className={cn("group/printer", className)}
      data-waiting={state === "waiting" ? "" : undefined}
      ref={root}
    >
      {children}
    </div>
  );
};
