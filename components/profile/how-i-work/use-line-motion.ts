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

import type { Line } from "./line-model";
import {
  advance,
  carriedAlpha,
  DWELL_S,
  isSettled,
  jumpTo,
  nestView,
  pinShare,
  restLine,
  STATION_COUNT,
  tableTurns,
  travelAt,
  watchedStep,
} from "./line-model";
import {
  NEEDLE_REST,
  NEEDLE_SWING,
  needleAt,
  nestShift,
  pinShift,
  stationDegrees,
  tableMarks,
  TOOL_DROPS,
  toTransform,
  zShift,
} from "./line-view";

export const WATCHED = 0;

const REST_STEP = watchedStep(restLine, WATCHED);

const MOST_DT = 1 / 30;
const SEEN_SHARE = 0.3;
const STAGGER = 0.09;
const STIFFNESS = 64;
const DAMPING = 16;

const ASSEMBLIES = [
  { key: "table", lift: 46 },
  ...Array.from({ length: STATION_COUNT }, (_, index) => ({
    key: `station-${index}`,
    lift: 64,
  })),
  { key: "console", lift: 30 },
] as const;

interface Spring {
  at: number;
  rate: number;
}

interface Nodes {
  carried: Element | null;
  features: Element[][];
  marks: {
    major: Element | null;
    minor: Element | null;
    notches: Element | null;
  };
  needle: Element | null;
  nests: Element[];
  pin: Element | null;
  pucks: Element[];
  tools: Element[][];
}

const springTo = (spring: Spring, target: number, dt: number) => {
  const steps = Math.max(Math.ceil(dt * 240), 1);
  const slice = dt / steps;
  for (let step = 0; step < steps; step += 1) {
    spring.rate +=
      (target - spring.at) * STIFFNESS * slice - spring.rate * DAMPING * slice;
    spring.at += spring.rate * slice;
  }
  if (Math.abs(target - spring.at) < 5e-4 && Math.abs(spring.rate) < 5e-4) {
    spring.at = target;
    spring.rate = 0;
  }
};

const collect = (root: HTMLElement): Nodes => {
  const nests = [...root.querySelectorAll("[data-nest]")];
  return {
    carried: root.querySelector('[data-piece="carried"]'),
    features: nests.map((nest) => [
      ...nest.querySelectorAll('[data-piece="feature"]'),
    ]),
    marks: {
      major: root.querySelector('[data-piece="ticks-major"]'),
      minor: root.querySelector('[data-piece="ticks-minor"]'),
      notches: root.querySelector('[data-piece="notches"]'),
    },
    needle: root.querySelector('[data-piece="needle"]'),
    nests,
    pin: root.querySelector('[data-piece="pin"]'),
    pucks: nests
      .map((nest) => nest.querySelector('[data-piece="puck"]'))
      .filter((puck): puck is Element => puck !== null),
    tools: Array.from({ length: STATION_COUNT }, (_, index) => [
      ...root.querySelectorAll(`[data-tool="${index}"]`),
    ]),
  };
};

const write = (
  element: Element | null | undefined,
  name: string,
  value: string
) => {
  if (element && element.getAttribute(name) !== value) {
    element.setAttribute(name, value);
  }
};

const placeAssemblies = (
  root: HTMLElement | null,
  shares: readonly Spring[]
) => {
  for (const [index, assembly] of ASSEMBLIES.entries()) {
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
          toTransform(zShift(assembly.lift * left))
        );
        group.style.opacity = `${Math.min(1, share * 2.4)}`;
      }
    }
  }
};

export interface Solo {
  station: number;
  t: number;
}

const travelOf = (station: number, line: Line, solo: Solo | null) => {
  if (solo?.station === station) {
    return travelAt(station, solo.t);
  }
  return line.phase === "dwell" ? travelAt(station, line.t) : 0;
};

const paint = (nodes: Nodes, line: Line, solo: Solo | null) => {
  const turns = tableTurns(line);
  const marks = tableMarks(turns);
  write(nodes.marks.minor, "d", marks.minor);
  write(nodes.marks.major, "d", marks.major);
  write(nodes.marks.notches, "d", marks.notches);
  for (const [index, nest] of nodes.nests.entries()) {
    const rest = stationDegrees(index);
    write(
      nest,
      "transform",
      toTransform(nestShift(rest, stationDegrees(index + turns)))
    );
    const view = nestView(index, line);
    const puck = nodes.pucks[index];
    write(puck, "opacity", String(Math.round(view.alpha * 1000) / 1000));
    write(puck, "transform", toTransform(zShift(view.lift)));
    for (const [stage, feature] of (nodes.features[index] ?? []).entries()) {
      write(feature, "opacity", stage <= view.stage ? "1" : "0");
    }
  }
  for (const [station, tools] of nodes.tools.entries()) {
    const drop = (TOOL_DROPS[station] ?? 0) * travelOf(station, line, solo);
    for (const tool of tools) {
      write(tool, "transform", toTransform(zShift(-drop)));
    }
  }
  write(
    nodes.needle,
    "d",
    needleAt(NEEDLE_REST + NEEDLE_SWING * travelOf(4, line, solo))
  );
  write(nodes.pin, "transform", toTransform(pinShift(pinShare(line))));
  write(
    nodes.carried,
    "opacity",
    String(Math.round(carriedAlpha(line) * 1000) / 1000)
  );
};

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

export const useLineMotion = ({
  onStep,
  root,
  soloStation,
  stopAt,
}: {
  onStep: (step: number) => void;
  root: RefObject<HTMLElement | null>;
  soloStation: number | null;
  stopAt: number | null;
}) => {
  const isReduced = useReducedMotion();
  const isBuildHeld = useBuildHeld(root);
  const { isSeen, isVisible } = useSight(root);
  const line = useRef<Line>(restLine);
  const solo = useRef<Solo | null>(null);
  const shares = useRef<Spring[] | null>(null);
  const assemblyClock = useRef(0);
  const nodes = useRef<Nodes | null>(null);
  const frame = useRef(0);
  const last = useRef(0);
  const step = useRef(REST_STEP);

  const report = useEffectEvent(() => {
    const now = watchedStep(line.current, WATCHED);
    if (now !== step.current) {
      step.current = now;
      onStep(now);
    }
  });

  const tick = useEffectEvent((dt: number) => {
    const node = root.current;
    let isMoving = false;
    const building = shares.current;
    if (building) {
      assemblyClock.current += dt;
      for (const [index, share] of building.entries()) {
        springTo(share, assemblyClock.current >= index * STAGGER ? 1 : 0, dt);
      }
      placeAssemblies(node, building);
      if (building.every((share) => share.at === 1)) {
        shares.current = null;
      } else {
        isMoving = true;
      }
    }
    if (!shares.current) {
      const drive = { stopAt, watched: WATCHED };
      line.current = advance(line.current, dt, drive);
      if (stopAt === null || !isSettled(line.current, WATCHED, stopAt)) {
        isMoving = true;
      }
    }
    if (soloStation === null) {
      solo.current = null;
    } else {
      const t = solo.current?.station === soloStation ? solo.current.t : 0;
      solo.current = { station: soloStation, t: (t + dt / DWELL_S) % 1 };
      isMoving = true;
    }
    if (nodes.current) {
      paint(nodes.current, line.current, solo.current);
    }
    report();
    return isMoving;
  });

  useLayoutEffect(() => {
    const node = root.current;
    if (!node) {
      return;
    }
    nodes.current = collect(node);
    if (isReduced) {
      shares.current = null;
      placeAssemblies(node, []);
      return;
    }
    shares.current = ASSEMBLIES.map(() => ({ at: 0, rate: 0 }));
    assemblyClock.current = 0;
    placeAssemblies(node, shares.current);
    return () => {
      shares.current = null;
      placeAssemblies(node, []);
    };
  }, [isReduced, root]);

  useEffect(() => {
    if (!isReduced || stopAt === null || !nodes.current) {
      return;
    }
    line.current = jumpTo(line.current, WATCHED, stopAt);
    step.current = watchedStep(line.current, WATCHED);
    paint(nodes.current, line.current, null);
  }, [isReduced, stopAt]);

  const canRun = isVisible && !isBuildHeld && isSeen && !isReduced;
  const demand = `${soloStation ?? "none"}:${stopAt ?? "flow"}`;

  useEffect(() => {
    if (!(canRun && demand)) {
      cancelAnimationFrame(frame.current);
      frame.current = 0;
      return;
    }
    if (frame.current) {
      return;
    }
    last.current = 0;
    const loop = (now: number) => {
      const dt = last.current
        ? Math.min((now - last.current) / 1000, MOST_DT)
        : 1 / 60;
      last.current = now;
      frame.current = tick(dt) ? requestAnimationFrame(loop) : 0;
    };
    frame.current = requestAnimationFrame(loop);
  }, [canRun, demand]);

  useEffect(
    () => () => {
      cancelAnimationFrame(frame.current);
      frame.current = 0;
    },
    []
  );

  return {
    isReduced,
    lineNow: () => line.current,
  };
};
