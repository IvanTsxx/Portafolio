"use client";

import { useEffect, useRef, useState } from "react";
import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

interface ScrollEdges {
  bottom: boolean;
  top: boolean;
}

const readEdges = (element: HTMLElement): ScrollEdges => ({
  bottom: element.scrollTop + element.clientHeight < element.scrollHeight - 1,
  top: element.scrollTop > 1,
});

const sameEdges = (first: ScrollEdges, second: ScrollEdges) =>
  first.top === second.top && first.bottom === second.bottom;

export const ScrollFade = ({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) => {
  const area = useRef<HTMLDivElement>(null);
  const [edges, setEdges] = useState<ScrollEdges>({
    bottom: false,
    top: false,
  });

  const measure = () => {
    const element = area.current;
    if (!element) {
      return;
    }
    const next = readEdges(element);
    setEdges((current) => (sameEdges(current, next) ? current : next));
  };

  useEffect(() => {
    const element = area.current;
    if (!element) {
      return;
    }
    const observer = new ResizeObserver(() => {
      const next = readEdges(element);
      setEdges((current) => (sameEdges(current, next) ? current : next));
    });
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      className={cn(
        "no-scrollbar overflow-y-auto overscroll-contain",
        edges.top && "mask-t-from-80%",
        edges.bottom && "mask-b-from-80%",
        className
      )}
      onScroll={measure}
      ref={area}
    >
      {children}
    </div>
  );
};
