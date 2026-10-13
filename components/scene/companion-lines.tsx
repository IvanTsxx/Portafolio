"use client";

import { useLayoutEffect, useRef } from "react";

import { registerSpokenSection } from "./active-section";

export const CompanionLines = ({ lines }: { lines: readonly string[] }) => {
  const marker = useRef<HTMLSpanElement>(null);

  useLayoutEffect(() => {
    const element = marker.current;
    const section = element?.parentElement;
    if (!(element && section)) {
      return;
    }
    return registerSpokenSection({ element, id: section.id, lines });
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
