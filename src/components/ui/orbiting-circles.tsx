"use client";

import { cn } from "@/lib/cn";

export interface OrbitingCirclesProps {
  className?: string;
  children?: React.ReactNode;
  reverse?: boolean;
  duration?: number;
  delay?: number;
  radius?: number;
  path?: boolean;
}

export function OrbitingCircles({
  className,
  children,
  reverse,
  duration = 20,
  delay = 10,
  radius = 50,
  path = true,
}: OrbitingCirclesProps) {
  return (
    <>
      {path && (
        <svg
          className="pointer-events-none absolute inset-0 size-full"
          style={{
            zIndex: 0,
          }}
          version="1.1"
          xmlns="http://www.w3.org/2000/svg"
        >
          <title>Orbiting Circles</title>
          <circle
            className="stroke-1 stroke-black/5 dark:stroke-white/10"
            cx="50%"
            cy="50%"
            fill="none"
            r={radius}
          />
        </svg>
      )}

      <div
        className={cn(
          "absolute flex size-full transform-gpu animate-orbit items-center justify-center rounded-full border bg-black/5 [animation-delay:calc(var(--delay)*1000ms)] dark:bg-white/5",
          { "direction-[reverse]": reverse },
          className
        )}
        style={
          {
            "--duration": duration,
            "--radius": radius,
            "--delay": -delay,
          } as React.CSSProperties
        }
      >
        {children}
      </div>
    </>
  );
}
