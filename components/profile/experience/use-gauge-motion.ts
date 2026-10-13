"use client";

import {
  useEffect,
  useEffectEvent,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import type { RefObject } from "react";

import { useBuildHeld } from "@/components/scene/build-hold";
import { useReducedMotion } from "@/hooks/use-reduced-motion";

import type { GaugeRig } from "./gauge-geometry";
import { translateBy } from "./gauge-geometry";
import {
  aimAt,
  restOf,
  springTo,
  STAGGER,
  stepMechanism,
} from "./gauge-motion";
import type { Axis, Mechanism } from "./gauge-motion";

const MOST_DT = 1 / 30;
const SEEN_SHARE = 0.3;

interface Assembling {
  clock: number;
  shares: Axis[];
}

export type GaugeNode =
  | "bridgeBack"
  | "bridgeFront"
  | "housing"
  | "ram"
  | "saddle";

export type GaugeNodes = Partial<Record<GaugeNode, SVGGElement | null>>;

const useSight = (root: RefObject<HTMLElement | null>) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isSeen, setIsSeen] = useState(false);
  useEffect(() => {
    const node = root.current;
    if (!node) {
      return;
    }
    const sight = new IntersectionObserver(
      (entries) => {
        const entry = entries.at(-1);
        setIsVisible(Boolean(entry?.isIntersecting));
        if (entry && entry.intersectionRatio >= SEEN_SHARE) {
          setIsSeen(true);
        }
      },
      { rootMargin: "120px 0px", threshold: [0, SEEN_SHARE] }
    );
    sight.observe(node);
    return () => sight.disconnect();
  }, [root]);
  return { isSeen, isVisible };
};

const placeAssemblies = (
  root: HTMLElement | null,
  rig: GaugeRig,
  shares: readonly Axis[]
) => {
  for (const [index, assembly] of rig.assemblies.entries()) {
    const share = shares[index]?.at ?? 1;
    const left = 1 - share;
    const groups =
      root?.querySelectorAll<SVGGElement>(`[data-part="${assembly.key}"]`) ??
      [];
    for (const group of groups) {
      if (left === 0) {
        group.removeAttribute("transform");
        group.style.removeProperty("opacity");
      } else {
        group.setAttribute(
          "transform",
          translateBy(rig.axes, [
            assembly.move[0] * left,
            assembly.move[1] * left,
            assembly.move[2] * left,
          ])
        );
        group.style.opacity = `${Math.min(1, share * 2.4)}`;
      }
    }
  }
};

const markAssembled = (node: HTMLElement | null) => {
  if (node) {
    node.dataset.assembled = "";
  }
};

const clearAssembled = (node: HTMLElement | null) => {
  if (node) {
    delete node.dataset.assembled;
  }
};

const placeMechanism = (nodes: GaugeNodes, rig: GaugeRig, mech: Mechanism) => {
  const bx = mech.bx.at;
  const cy = mech.cy.at;
  const bridge = translateBy(rig.axes, [bx, 0, 0]);
  const carriage = translateBy(rig.axes, [bx, cy, 0]);
  nodes.bridgeBack?.setAttribute("transform", bridge);
  nodes.bridgeFront?.setAttribute("transform", bridge);
  nodes.saddle?.setAttribute("transform", carriage);
  nodes.housing?.setAttribute("transform", carriage);
  nodes.ram?.setAttribute(
    "transform",
    translateBy(rig.axes, [bx, cy, -mech.ext.at])
  );
};

export const useGaugeMotion = ({
  nodes,
  rig,
  root,
  shown,
}: {
  nodes: RefObject<GaugeNodes>;
  rig: GaugeRig;
  root: RefObject<HTMLElement | null>;
  shown: number;
}) => {
  const isReduced = useReducedMotion();
  const isHeld = useBuildHeld(root);
  const { isSeen, isVisible } = useSight(root);
  const mechanism = useRef<Mechanism | null>(null);
  const assembling = useRef<Assembling | null>(null);
  const frame = useRef(0);
  const last = useRef(0);

  const tick = useEffectEvent((dt: number) => {
    let isMoving = false;
    const node = root.current;
    const build = assembling.current;
    if (build) {
      build.clock += dt;
      for (const [index, share] of build.shares.entries()) {
        const target = build.clock >= index * STAGGER ? 1 : 0;
        springTo(share, target, dt, isReduced);
      }
      placeAssemblies(node, rig, build.shares);
      if (build.shares.every((share) => share.at === 1)) {
        assembling.current = null;
        markAssembled(node);
      } else {
        isMoving = true;
      }
    }
    const mech = mechanism.current;
    if (mech && mech.phase !== "rest") {
      if (stepMechanism(mech, rig.lift, dt, isReduced)) {
        isMoving = true;
      }
      placeMechanism(nodes.current, rig, mech);
    }
    return isMoving;
  });

  const canRun = isVisible && !isHeld && (isSeen || isReduced);

  useLayoutEffect(() => {
    const node = root.current;
    if (isReduced) {
      markAssembled(node);
      return;
    }
    clearAssembled(node);
    const shares = rig.assemblies.map(() => ({ at: 0, rate: 0 }));
    assembling.current = { clock: 0, shares };
    placeAssemblies(node, rig, shares);
    return () => {
      assembling.current = null;
      placeAssemblies(node, rig, []);
      markAssembled(node);
    };
  }, [isReduced, rig, root]);

  useEffect(() => {
    const stop = rig.stops[shown];
    if (!stop) {
      return;
    }
    if (mechanism.current) {
      aimAt(mechanism.current, stop);
    } else {
      mechanism.current = restOf(stop);
    }
    if (!canRun) {
      cancelAnimationFrame(frame.current);
      frame.current = 0;
      return;
    }
    if (frame.current) {
      return;
    }
    last.current = 0;
    const step = (now: number) => {
      const dt = last.current
        ? Math.min((now - last.current) / 1000, MOST_DT)
        : 1 / 60;
      last.current = now;
      frame.current = tick(dt) ? requestAnimationFrame(step) : 0;
    };
    frame.current = requestAnimationFrame(step);
  }, [canRun, rig.stops, shown]);

  useEffect(
    () => () => {
      cancelAnimationFrame(frame.current);
      frame.current = 0;
    },
    []
  );

  return { isReduced, isVisible };
};
