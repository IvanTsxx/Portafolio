"use client";

import { useEffect, useState } from "react";
import type { RefObject } from "react";

export const useInView = (
  target: RefObject<Element | null>,
  rootMargin = "10% 0px"
) => {
  const [isInView, setIsInView] = useState(false);

  useEffect(() => {
    const element = target.current;
    if (!element) {
      return;
    }
    const observer = new IntersectionObserver(
      ([entry]) => setIsInView(entry?.isIntersecting ?? false),
      { rootMargin }
    );
    observer.observe(element);
    return () => observer.disconnect();
  }, [rootMargin, target]);

  return isInView;
};
