"use client";

import { useLayoutEffect, useRef } from "react";

import { registerSpokenSection } from "./companion-signals";

export const CompanionLines = ({ lines }: { lines: readonly string[] }) => {
  const marker = useRef<HTMLSpanElement>(null);

  useLayoutEffect(() => {
    const element = marker.current;
    if (!element || lines.length === 0) {
      return;
    }
    return registerSpokenSection(element, lines);
  }, [lines]);

  return (
    <span
      aria-hidden
      className="pointer-events-none absolute inset-0"
      data-companion-lines=""
      ref={marker}
    />
  );
};
