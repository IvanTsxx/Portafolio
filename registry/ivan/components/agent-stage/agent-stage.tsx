"use client";

import { Canvas } from "@react-three/fiber";
import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import type { ReactNode, RefObject } from "react";
import { NeutralToneMapping } from "three";

import { cn } from "@/lib/utils";
import { agentRoleLabels } from "@/registry/ivan/components/agent/types";
import type {
  AgentAction,
  AgentRole,
} from "@/registry/ivan/components/agent/types";
import type { AgentMotion } from "@/registry/ivan/components/agent/use-agent-rig";
import { usePrefersReducedMotion } from "@/registry/ivan/hooks/use-prefers-reduced-motion";

import { AgentPoster } from "./agent-poster";
import { AgentStageScene } from "./agent-stage-scene";

export interface AgentStageProps {
  role: AgentRole;
  action?: AgentAction;
  motion?: AgentMotion;
  shadow?: boolean;
  label?: string;
  fallback?: ReactNode;
  className?: string;
}

let cachedWebGLSupport: boolean | null = null;

const detectWebGL = () => {
  if (cachedWebGLSupport !== null) {
    return cachedWebGLSupport;
  }
  try {
    const probe = document.createElement("canvas");
    const context = probe.getContext("webgl2") ?? probe.getContext("webgl");
    context?.getExtension("WEBGL_lose_context")?.loseContext();
    cachedWebGLSupport = context !== null;
  } catch {
    cachedWebGLSupport = false;
  }
  return cachedWebGLSupport;
};

const subscribeToPageShow = (onChange: () => void) => {
  window.addEventListener("pageshow", onChange);
  return () => window.removeEventListener("pageshow", onChange);
};

const getServerWebGLSupport = () => true;

const useWebGLSupport = () =>
  useSyncExternalStore(subscribeToPageShow, detectWebGL, getServerWebGLSupport);

const useIsInView = (target: RefObject<Element | null>) => {
  const [isInView, setIsInView] = useState(false);

  useEffect(() => {
    const element = target.current;
    if (!element) {
      return;
    }
    const observer = new IntersectionObserver(
      ([entry]) => setIsInView(entry?.isIntersecting ?? false),
      { rootMargin: "10% 0px" }
    );
    observer.observe(element);
    return () => observer.disconnect();
  }, [target]);

  return isInView;
};

export const AgentStage = ({
  role,
  action,
  motion,
  shadow,
  label,
  fallback,
  className,
}: AgentStageProps) => {
  const frame = useRef<HTMLElement>(null);
  const hasWebGL = useWebGLSupport();
  const isInView = useIsInView(frame);
  const prefersReducedMotion = usePrefersReducedMotion();
  const resolvedMotion = motion ?? (prefersReducedMotion ? "reduced" : "full");

  let frameloop: "always" | "demand" | "never" = "never";
  if (isInView) {
    frameloop = resolvedMotion === "reduced" ? "demand" : "always";
  }

  return (
    <figure
      aria-label={label ?? agentRoleLabels[role]}
      className={cn("relative m-0 aspect-4/3 w-full", className)}
      ref={frame}
    >
      {hasWebGL ? (
        <Canvas
          dpr={[1, 2]}
          frameloop={frameloop}
          gl={{
            alpha: true,
            antialias: true,
            powerPreference: "high-performance",
            toneMapping: NeutralToneMapping,
          }}
        >
          <AgentStageScene
            action={action}
            motion={resolvedMotion}
            role={role}
            shadow={shadow}
          />
        </Canvas>
      ) : (
        (fallback ?? <AgentPoster className="size-full" role={role} />)
      )}
    </figure>
  );
};
