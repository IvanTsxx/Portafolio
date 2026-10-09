"use client";

import { useEffect, useRef, useState } from "react";

export interface ViewportPresence {
  hasNeared: boolean;
  isVisible: boolean;
}

export const useViewportPresence = <TElement extends Element>(
  nearMargin = "50%"
) => {
  const ref = useRef<TElement>(null);
  const [presence, setPresence] = useState<ViewportPresence>({
    hasNeared: false,
    isVisible: false,
  });

  useEffect(() => {
    const element = ref.current;
    if (!element) {
      return;
    }
    const nearObserver = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          setPresence((current) =>
            current.hasNeared ? current : { ...current, hasNeared: true }
          );
        }
      },
      { rootMargin: `${nearMargin} 0px` }
    );
    const visibleObserver = new IntersectionObserver(([entry]) => {
      const isVisible = entry?.isIntersecting ?? false;
      setPresence((current) =>
        current.isVisible === isVisible
          ? current
          : { hasNeared: current.hasNeared || isVisible, isVisible }
      );
    });
    nearObserver.observe(element);
    visibleObserver.observe(element);
    return () => {
      nearObserver.disconnect();
      visibleObserver.disconnect();
    };
  }, [nearMargin]);

  return { presence, ref };
};
