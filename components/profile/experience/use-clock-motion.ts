"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import type { RefObject } from "react";

import type { Point3, Projection, SolidPaths } from "@/components/iso/iso-kit";
import { useBuildHeld } from "@/components/scene/build-hold";
import { useReducedMotion } from "@/hooks/use-reduced-motion";

import {
  deskOf,
  feed,
  isAirborne,
  joltOf,
  leverAngle,
  release,
  springTo,
  STAGGER,
  stepDesk,
} from "./clock-motion";
import type { Axis, Desk } from "./clock-motion";
import { handsOf, leverOf } from "./clock-parts";
import { shiftOf } from "./prism";

const MOST_DT = 1 / 30;
const SEEN_SHARE = 0.3;
const SOLID_ORDER = 8;

export const ASSEMBLIES: readonly { key: string; move: Point3 }[] = [
  { key: "board", move: [0, 0, 46] },
  { key: "rack-out", move: [0, 34, 0] },
  { key: "rack-in", move: [0, 34, 0] },
  { key: "clock", move: [0, 0, 64] },
  { key: "lever", move: [26, 0, 0] },
  { key: "cards", move: [0, 0, 58] },
];

export type ClockNodes = Record<
  "flightCards" | "hands" | "lever" | "rackCards",
  (SVGElement | null)[]
>;

export type DeskPhase = "home" | "moving" | "held";

interface Report {
  job: number | null;
  phase: DeskPhase;
}

interface Latest {
  canRun: boolean;
  isReduced: boolean;
  onPhase: (phase: DeskPhase, job: number | null) => void;
  projection: Projection;
}

const secondsNow = () => {
  const now = new Date();
  return (
    now.getHours() * 3600 +
    now.getMinutes() * 60 +
    now.getSeconds() +
    now.getMilliseconds() / 1000
  );
};

const writeSolid = (group: SVGElement | null, paths: SolidPaths) => {
  const children = group?.firstElementChild?.children;
  if (!children || children.length < SOLID_ORDER) {
    return;
  }
  const values = [
    paths.fill,
    ...[0, 1, 2, 3].map((shade) => paths.shades[shade] ?? ""),
    paths.top,
    paths.crease,
    paths.outline,
  ];
  for (const [index, value] of values.entries()) {
    children.item(index)?.setAttribute("d", value);
  }
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

const placeAssemblies = (
  root: HTMLElement | null,
  P: Projection,
  shares: readonly Axis[]
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
        const [x, y, z] = assembly.move;
        group.setAttribute(
          "transform",
          shiftOf(P, [x * left, y * left, z * left])
        );
        group.style.opacity = `${Math.min(1, share * 2.4)}`;
      }
    }
  }
};

const placeRackCard = (
  node: SVGElement | null,
  lift: number,
  isHidden: boolean,
  isOn: boolean,
  P: Projection
) => {
  if (!node) {
    return;
  }
  node.style.display = isHidden ? "none" : "";
  if (lift === 0) {
    node.removeAttribute("transform");
  } else {
    node.setAttribute("transform", shiftOf(P, [0, 0, lift]));
  }
  if (isOn) {
    node.dataset.on = "";
  } else {
    delete node.dataset.on;
  }
};

const placeCards = (nodes: ClockNodes, desk: Desk, P: Projection) => {
  const { flight } = desk;
  const airborne = isAirborne(flight);
  for (const [job, rack] of nodes.rackCards.entries()) {
    const isMine = flight?.job === job;
    const lift = isMine ? (flight?.dz.at ?? 0) : 0;
    placeRackCard(rack, lift, isMine && airborne, isMine, P);
    const flying = nodes.flightCards[job];
    if (flying) {
      const isFlying = isMine && airborne;
      flying.style.display = isFlying ? "" : "none";
      if (isFlying && flight) {
        flying.setAttribute(
          "transform",
          shiftOf(P, [
            flight.dx.at,
            flight.dy.at,
            flight.dz.at + joltOf(flight),
          ])
        );
      }
    }
  }
};

const placeLever = (nodes: ClockNodes, angle: number, P: Projection) => {
  const lever = leverOf(angle, P);
  const [arm = null, cap = null, knob = null] = nodes.lever;
  writeSolid(arm, lever.arm);
  writeSolid(cap, lever.cap);
  writeSolid(knob, lever.knob);
  knob?.nextElementSibling?.setAttribute("d", lever.knobFace);
};

const placeHands = (nodes: ClockNodes, P: Projection) => {
  const hands = handsOf(secondsNow(), P);
  const [hour, minute, second] = nodes.hands;
  hour?.setAttribute("d", hands.hour);
  minute?.setAttribute("d", hands.minute);
  second?.setAttribute("d", hands.second);
};

const phaseOf = (desk: Desk): DeskPhase => {
  if (!desk.flight) {
    return "home";
  }
  return desk.flight.phase === "held" ? "held" : "moving";
};

const markAssembled = (node: HTMLElement | null, isOn: boolean) => {
  if (!node) {
    return;
  }
  if (isOn) {
    node.dataset.assembled = "";
  } else {
    delete node.dataset.assembled;
  }
};

const engineOf = ({
  homes,
  latest,
  nodes,
  root,
}: {
  homes: readonly number[];
  latest: RefObject<Latest>;
  nodes: RefObject<ClockNodes>;
  root: RefObject<HTMLElement | null>;
}) => {
  const desk = deskOf(homes);
  let frame = 0;
  let last = 0;
  let assembling: { clock: number; shares: Axis[] } | null = null;
  let reported: Report = { job: null, phase: "home" };
  let isDirty = true;
  let drawnAngle = Number.NaN;

  const report = () => {
    const phase = phaseOf(desk);
    const job = desk.flight?.job ?? null;
    const flightPhase = desk.flight?.phase ?? "home";
    if (root.current && root.current.dataset.phase !== flightPhase) {
      root.current.dataset.phase = flightPhase;
    }
    if (reported.phase !== phase || reported.job !== job) {
      reported = { job, phase };
      latest.current.onPhase(phase, job);
    }
  };

  const draw = (isMoving: boolean) => {
    const P = latest.current.projection;
    if (isMoving || isDirty) {
      placeCards(nodes.current, desk, P);
    }
    isDirty = isMoving;
    const angle = leverAngle(desk.flight);
    if (angle !== drawnAngle) {
      drawnAngle = angle;
      placeLever(nodes.current, angle, P);
    }
    placeHands(nodes.current, P);
    report();
  };

  const assemble = (dt: number, calm: boolean) => {
    if (!assembling) {
      return false;
    }
    assembling.clock += dt;
    for (const [index, share] of assembling.shares.entries()) {
      const target = assembling.clock >= index * STAGGER ? 1 : 0;
      springTo(share, target, dt, calm);
    }
    placeAssemblies(root.current, latest.current.projection, assembling.shares);
    if (assembling.shares.every((share) => share.at === 1)) {
      assembling = null;
      markAssembled(root.current, true);
      return false;
    }
    return true;
  };

  const tick = (dt: number) => {
    const calm = latest.current.isReduced;
    const isAssembling = assemble(dt, calm);
    const isMoving = stepDesk(desk, dt, calm);
    draw(isMoving);
    return isAssembling || isMoving || !calm;
  };

  const step = (now: number) => {
    const dt = last ? Math.min((now - last) / 1000, MOST_DT) : 1 / 60;
    last = now;
    frame = latest.current.canRun && tick(dt) ? requestAnimationFrame(step) : 0;
  };

  const run = () => {
    if (!latest.current.canRun || frame) {
      return;
    }
    last = 0;
    frame = requestAnimationFrame(step);
  };

  const kick = () => {
    isDirty = true;
    if (frame) {
      return;
    }
    if (latest.current.canRun) {
      run();
      return;
    }
    stepDesk(desk, 1, true);
    draw(true);
  };

  return {
    feed: (job: number) => {
      feed(desk, job);
      kick();
    },
    hands: () => placeHands(nodes.current, latest.current.projection),
    release: () => {
      release(desk);
      kick();
    },
    run,
    startAssembly: () => {
      assembling = {
        clock: 0,
        shares: ASSEMBLIES.map(() => ({ at: 0, rate: 0 })),
      };
      placeAssemblies(
        root.current,
        latest.current.projection,
        assembling.shares
      );
    },
    stop: () => {
      cancelAnimationFrame(frame);
      frame = 0;
    },
    stopAssembly: () => {
      assembling = null;
      placeAssemblies(root.current, latest.current.projection, []);
    },
  };
};

export const useClockMotion = ({
  homes,
  nodes,
  onPhase,
  projection,
  root,
}: {
  homes: readonly number[];
  nodes: RefObject<ClockNodes>;
  onPhase: (phase: DeskPhase, job: number | null) => void;
  projection: Projection;
  root: RefObject<HTMLElement | null>;
}) => {
  const isReduced = useReducedMotion();
  const isHeld = useBuildHeld(root);
  const { isSeen, isVisible } = useSight(root);
  const canRun = isVisible && !isHeld && (isSeen || isReduced);
  const latest = useRef<Latest>({ canRun, isReduced, onPhase, projection });
  const engine = useRef<Engine | null>(null);

  useLayoutEffect(() => {
    latest.current = { canRun, isReduced, onPhase, projection };
  });

  useLayoutEffect(() => {
    const made = engineOf({ homes, latest, nodes, root });
    engine.current = made;
    made.hands();
    return () => {
      made.stop();
      engine.current = null;
    };
  }, [homes, nodes, root]);

  useLayoutEffect(() => {
    const node = root.current;
    const made = engine.current;
    if (isReduced || !made) {
      markAssembled(node, true);
      return;
    }
    markAssembled(node, false);
    made.startAssembly();
    return () => {
      made.stopAssembly();
      markAssembled(node, true);
    };
  }, [isReduced, root]);

  useEffect(() => {
    if (canRun) {
      engine.current?.run();
      return;
    }
    engine.current?.stop();
  }, [canRun]);

  return {
    feed: (job: number) => engine.current?.feed(job),
    isReduced,
    isVisible,
    release: () => engine.current?.release(),
  };
};

type Engine = ReturnType<typeof engineOf>;
