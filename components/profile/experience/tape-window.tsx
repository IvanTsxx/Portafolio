"use client";

import { useEffect, useRef } from "react";
import type { ReactNode } from "react";

const settle = "transform 300ms cubic-bezier(0.25, 1, 0.5, 1)";

export const TapeWindow = ({ children }: { children: ReactNode }) => {
  const root = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const element = root.current;
    const track = element?.querySelector<HTMLElement>(".exp-tape-track");
    if (!element || !track) {
      return;
    }
    const onFocusIn = (event: FocusEvent) => {
      const stretch =
        event.target instanceof HTMLElement
          ? event.target.closest<HTMLElement>(".exp-stretch")
          : null;
      const isFed = getComputedStyle(element).overflowX === "clip";
      if (!stretch || !isFed) {
        return;
      }
      const room = element.clientWidth - track.offsetWidth;
      const box = stretch.getBoundingClientRect();
      const offset = box.left - track.getBoundingClientRect().left;
      const centered = element.clientWidth / 2 - (offset + box.width / 2);
      const shift = Math.min(0, Math.max(room, centered));
      track.style.animation = "none";
      track.style.transition = settle;
      track.style.transform = `translate3d(${shift}px, 0, 0)`;
    };
    const onFocusOut = (event: FocusEvent) => {
      const next = event.relatedTarget;
      if (next instanceof Node && element.contains(next)) {
        return;
      }
      track.style.removeProperty("animation");
      track.style.removeProperty("transition");
      track.style.removeProperty("transform");
    };
    element.addEventListener("focusin", onFocusIn);
    element.addEventListener("focusout", onFocusOut);
    return () => {
      element.removeEventListener("focusin", onFocusIn);
      element.removeEventListener("focusout", onFocusOut);
    };
  }, []);

  return (
    <div className="exp-tape" data-feed ref={root}>
      {children}
    </div>
  );
};
