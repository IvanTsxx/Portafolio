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

import { translateBy } from "./catalog-geometry";
import type { CatalogRig } from "./catalog-geometry";
import {
  liftPose,
  poseAt,
  settle,
  springTo,
  STAGGER,
  startRead,
  stepRead,
} from "./catalog-motion";
import type { Axis, Read } from "./catalog-motion";

const MOST_DT = 1 / 30;
const SEEN_SHARE = 0.3;
const LIFT_SECONDS = 0.075;

export interface CatalogNodes {
  cards: (SVGGElement | null)[];
  overlay: SVGGElement | null;
}

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
  rig: CatalogRig,
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

const setAssembled = (node: HTMLElement | null, isAssembled: boolean) => {
  if (!node) {
    return;
  }
  if (isAssembled) {
    node.dataset.assembled = "";
  } else {
    delete node.dataset.assembled;
  }
};

const placeCards = (
  nodes: CatalogNodes,
  rig: CatalogRig,
  lifts: readonly Axis[],
  read: Read | null
) => {
  for (const [slot, node] of nodes.cards.entries()) {
    const route = rig.routes[slot];
    if (!(node && route)) {
      continue;
    }
    const share = lifts[slot]?.at ?? 0;
    const isRead = read?.slot === slot && read.phase !== "home";
    const pose = isRead ? poseAt(route, read.u, share) : liftPose(route, share);
    const isOver = isRead && read.u >= 1 && pose[1] > route.clearsFrom;
    const transform = translateBy(rig.axes, pose);
    if (pose[0] === 0 && pose[1] === 0 && pose[2] === 0) {
      node.removeAttribute("transform");
    } else {
      node.setAttribute("transform", transform);
    }
    node.setAttribute("visibility", isOver ? "hidden" : "visible");
    if (isRead && nodes.overlay) {
      nodes.overlay.setAttribute("transform", transform);
      nodes.overlay.setAttribute("visibility", isOver ? "visible" : "hidden");
    }
  }
  if (!read && nodes.overlay) {
    nodes.overlay.setAttribute("visibility", "hidden");
  }
};

export const useCatalogMotion = ({
  nodes,
  onDone,
  onSeated,
  rig,
  root,
  shown,
}: {
  nodes: RefObject<CatalogNodes>;
  onDone: () => void;
  onSeated: (read: Read) => void;
  rig: CatalogRig;
  root: RefObject<HTMLElement | null>;
  shown: number | null;
}) => {
  const isReduced = useReducedMotion();
  const isHeld = useBuildHeld(root);
  const { isSeen, isVisible } = useSight(root);
  const lifts = useRef<Axis[]>([]);
  const reading = useRef<Read | null>(null);
  const assembling = useRef<{ clock: number; shares: Axis[] } | null>(null);
  const frame = useRef(0);
  const last = useRef(0);
  const target = useRef(shown);
  const [request, setRequest] = useState<Read | null>(null);
  const taken = useRef<Read | null>(null);

  const canRun = isVisible && !isHeld && (isSeen || isReduced);

  const tick = useEffectEvent((dt: number) => {
    let isMoving = false;
    const node = root.current;
    const build = assembling.current;
    if (build) {
      build.clock += dt;
      for (const [index, share] of build.shares.entries()) {
        springTo(share, build.clock >= index * STAGGER ? 1 : 0, dt, isReduced);
      }
      placeAssemblies(node, rig, build.shares);
      if (build.shares.every((share) => share.at === 1)) {
        assembling.current = null;
        setAssembled(node, true);
      } else {
        isMoving = true;
      }
    }
    for (const slot of rig.routes.keys()) {
      const lift = lifts.current[slot] ?? { at: 0, rate: 0 };
      lifts.current[slot] = lift;
      const isLifted = target.current === slot;
      if (settle(lift, isLifted ? 1 : 0, dt, LIFT_SECONDS, isReduced)) {
        isMoving = true;
      }
    }
    const read = reading.current;
    if (read) {
      const event = stepRead(read, dt, isReduced);
      if (event === "seated") {
        onSeated(read);
      }
      if (event === "done") {
        reading.current = null;
        onDone();
      } else {
        isMoving = true;
      }
    }
    placeCards(nodes.current, rig, lifts.current, reading.current);
    return isMoving;
  });


  useLayoutEffect(() => {
    const node = root.current;
    if (isReduced) {
      setAssembled(node, true);
      return;
    }
    setAssembled(node, false);
    const shares = rig.assemblies.map(() => ({ at: 0, rate: 0 }));
    assembling.current = { clock: 0, shares };
    placeAssemblies(node, rig, shares);
    return () => {
      assembling.current = null;
      placeAssemblies(node, rig, []);
      setAssembled(node, true);
    };
  }, [isReduced, rig, root]);

  useEffect(() => {
    target.current = shown;
    if (request && taken.current !== request) {
      taken.current = request;
      reading.current = request;
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
  }, [canRun, request, shown]);

  useEffect(
    () => () => {
      cancelAnimationFrame(frame.current);
      frame.current = 0;
    },
    []
  );

  return {
    canAnimate: canRun && !isReduced,
    isReading: () =>
      reading.current !== null || (request !== null && taken.current !== request),
    isReduced,
    isVisible,
    read: (slot: number, opens: boolean) => {
      if (reading.current || (request && taken.current !== request)) {
        return false;
      }
      setRequest(startRead(slot, opens));
      return true;
    },
  };
};
