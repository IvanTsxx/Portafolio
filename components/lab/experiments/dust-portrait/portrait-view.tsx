"use client";

import Image from "next/image";
import { useId, useRef } from "react";

import { useThemeTones } from "@/components/lab/experiments/lunar-dither/use-theme-tones";
import { useViewSlot } from "@/components/scene/view-registry";
import { cn } from "@/lib/utils";
import { DustPortraitScene } from "@/registry/ivan/components/dust-portrait/dust-portrait-scene";
import { usePrefersReducedMotion } from "@/registry/ivan/hooks/use-prefers-reduced-motion";
import { useWebGLSupport } from "@/registry/ivan/hooks/use-webgl-support";

const avatar = {
  focus: { x: 0.5, y: 0.42 },
  path: "/profile/avatar.webp",
} as const;

interface DustPortraitViewProps {
  alt: string;
  className?: string;
  sizes?: string;
  priority?: boolean;
}

export const DustPortraitView = ({
  alt,
  className,
  sizes = "(min-width: 1024px) 30vw, 90vw",
  priority = false,
}: DustPortraitViewProps) => {
  const field = useRef<HTMLDivElement>(null);
  const slotId = useId();
  const tones = useThemeTones();
  const hasWebGL = useWebGLSupport();
  const isReduced = usePrefersReducedMotion();

  useViewSlot(
    slotId,
    field,
    <DustPortraitScene
      focus={avatar.focus}
      idle={2.2}
      ink={tones.ink}
      paper={tones.paper}
      paused={isReduced}
      pointerTarget={field}
      src={avatar.path}
    />,
    hasWebGL,
    undefined,
    "always"
  );

  return (
    <div className={cn("absolute inset-0 overflow-hidden", className)}>
      <Image
        alt={alt}
        className="object-portrait object-cover"
        fill
        priority={priority}
        sizes={sizes}
        src={avatar.path}
        style={{
          objectPosition: `${avatar.focus.x * 100}% ${avatar.focus.y * 100}%`,
        }}
      />
      <div
        aria-hidden
        className="pointer-events-auto absolute inset-0 touch-pan-y"
        ref={field}
      />
    </div>
  );
};
