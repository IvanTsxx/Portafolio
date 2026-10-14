"use client";

import { useEffect, useState } from "react";
import type { RefObject } from "react";

export interface ElementSize {
  width: number;
  height: number;
}

export const useElementSize = (element: RefObject<HTMLElement | null>) => {
  const [size, setSize] = useState<ElementSize | null>(null);

  useEffect(() => {
    const { current } = element;
    if (!current) {
      return;
    }
    const observer = new ResizeObserver(([entry]) => {
      if (entry) {
        setSize({
          height: entry.contentRect.height,
          width: entry.contentRect.width,
        });
      }
    });
    observer.observe(current);
    return () => observer.disconnect();
  }, [element]);

  return size;
};
