"use client";

import { useState } from "react";
import type { ReactNode } from "react";

import { useViewportPresence } from "@/components/home/scene/use-viewport-presence";
import { useReducedMotion } from "@/hooks/use-reduced-motion";
import { cn } from "@/lib/utils";

export type SceneFrameloop = "always" | "demand" | "never";

export interface SceneRenderProps {
  frameloop: SceneFrameloop;
  reducedMotion: boolean;
  onReady: () => void;
}

export interface SceneSlotProps {
  className?: string;
  fallback: ReactNode;
  children: (props: SceneRenderProps) => ReactNode;
}

export const SceneSlot = ({
  className,
  fallback,
  children,
}: SceneSlotProps) => {
  const { presence, ref } = useViewportPresence<HTMLDivElement>();
  const reducedMotion = useReducedMotion();
  const [isReady, setIsReady] = useState(false);

  const visibleFrameloop: SceneFrameloop = reducedMotion ? "demand" : "always";
  const frameloop: SceneFrameloop = presence.isVisible
    ? visibleFrameloop
    : "never";

  return (
    <div
      className={cn("relative", className)}
      data-ready={isReady}
      data-visible={presence.isVisible}
      ref={ref}
    >
      <div
        aria-hidden={isReady}
        className="ease-out-quart absolute inset-0 transition-opacity duration-700 data-[ready=true]:opacity-0"
        data-ready={isReady}
      >
        {fallback}
      </div>
      {presence.hasNeared ? (
        <div
          className="ease-out-quart absolute inset-0 opacity-0 transition-opacity duration-700 data-[ready=true]:opacity-100"
          data-ready={isReady}
        >
          {children({
            frameloop,
            onReady: () => setIsReady(true),
            reducedMotion,
          })}
        </div>
      ) : null}
    </div>
  );
};
