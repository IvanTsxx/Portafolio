import { useEffect } from "react";
import type { CSSProperties, RefObject } from "react";

const PEEK_REM = 0.5;
const DEEPEST_PEEK = 3;
const READ_START = 0.7;
const READ_SPAN = 0.55;

export const cardPose = (depth: number): CSSProperties => {
  if (depth < 0) {
    return {
      opacity: 0,
      transform: "translate3d(0, -1.25rem, 0) rotate(-1.5deg)",
      zIndex: 0,
    };
  }
  const peek = Math.min(depth, DEEPEST_PEEK) * PEEK_REM;
  return {
    opacity: depth > DEEPEST_PEEK ? 0 : 1,
    transform: `translate3d(${peek}rem, ${peek}rem, 0)`,
    zIndex: 10 - depth,
  };
};

export const stepKeys = new Map([
  ["ArrowLeft", -1],
  ["ArrowRight", 1],
]);

export const useScrollIndex = (
  root: RefObject<HTMLElement | null>,
  count: number,
  isEnabled: boolean,
  onIndex: (index: number) => void
) => {
  useEffect(() => {
    const element = root.current;
    if (!element || !isEnabled) {
      return;
    }
    let frame = 0;
    const read = () => {
      frame = 0;
      const box = element.getBoundingClientRect();
      const viewport = window.innerHeight;
      const progress =
        (viewport * READ_START - box.top) / (viewport * READ_SPAN);
      const clamped = Math.min(0.999, Math.max(0, progress));
      onIndex(Math.floor(clamped * count));
    };
    const schedule = () => {
      if (frame === 0) {
        frame = window.requestAnimationFrame(read);
      }
    };
    const sight = new IntersectionObserver((entries) => {
      if (entries.at(-1)?.isIntersecting) {
        window.addEventListener("scroll", schedule, { passive: true });
        schedule();
      } else {
        window.removeEventListener("scroll", schedule);
      }
    });
    sight.observe(element);
    return () => {
      sight.disconnect();
      window.removeEventListener("scroll", schedule);
      window.cancelAnimationFrame(frame);
    };
  }, [root, count, isEnabled, onIndex]);
};
