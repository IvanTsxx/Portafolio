"use client";

import { OrthographicCamera } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { useEffect, useRef, useState } from "react";
import type { RefObject } from "react";
import type {
  Group,
  OrthographicCamera as OrthographicCameraImpl,
} from "three";
import { Vector3 } from "three";

import { buildBeat } from "@/components/agents/actions";
import type { AgentPointer } from "@/components/agents/agent";
import { Agent } from "@/components/agents/agent";
import { useReducedMotion } from "@/hooks/use-reduced-motion";
import type { AgentAction, AgentRole } from "@/lib/agents/roles";

import type { BurstHandle, HatToss, TossHandle } from "./companion-effects";
import { FlyingHat, PaperPoof } from "./companion-effects";
import type {
  CompanionCue,
  CompanionMotion,
  CompanionPose,
} from "./companion-motion";
import {
  createCompanionMotion,
  isSwapActive,
  startLeap,
  stepCompanion,
} from "./companion-motion";
import type {
  CompanionFrame,
  Perch,
  ScreenPoint,
  ScreenRect,
  Viewport,
} from "./companion-path";
import {
  companionFrame,
  ownVisibleShare,
  perchBox,
  perchCandidates,
  perchPoint,
  pickWaypoint,
} from "./companion-path";
import {
  notifyCompanionBeat,
  sayCompanionLine,
  setCompanionStop,
} from "./companion-signals";
import { ViewLights } from "./view-lights";
import type { Waypoint, WaypointSide } from "./view-registry";
import { getAgentCasts, getWaypoints } from "./view-registry";

export interface CompanionContentProps {
  bubble: RefObject<HTMLDivElement | null>;
  hit: RefObject<HTMLDivElement | null>;
  pointer: RefObject<AgentPointer>;
  presses: RefObject<number>;
}

interface Outfit {
  role: AgentRole;
  toss: HatToss | null;
}

const modelHeight = 2.2;
const castHideShare = 0.5;
const baseTilt = 0.16;
const depthClearPriority = 2.5;

const readViewport = (): Viewport => ({
  height: window.innerHeight,
  width: window.innerWidth,
});

const findActiveWaypoint = (viewport: Viewport, current: Waypoint | null) =>
  pickWaypoint(
    Array.from(getWaypoints(), (waypoint) => ({
      key: waypoint,
      rect: waypoint.element.getBoundingClientRect(),
    })),
    viewport,
    current?.element.isConnected ? current : null
  );

const isCastInView = (viewport: Viewport) => {
  for (const cast of getAgentCasts()) {
    if (
      ownVisibleShare(cast.getBoundingClientRect(), viewport) >= castHideShare
    ) {
      return true;
    }
  }
  return false;
};

const placeHitBox = (
  hit: HTMLDivElement | null,
  point: ScreenPoint,
  frame: CompanionFrame,
  lift: number,
  isInteractive: boolean
) => {
  if (!hit) {
    return;
  }
  const left = point.x - frame.agentWidth / 2;
  const top = point.y - frame.agentHeight - lift;
  hit.style.transform = `translate3d(${left}px, ${top}px, 0)`;
  hit.style.width = `${frame.agentWidth}px`;
  hit.style.height = `${frame.agentHeight}px`;
  hit.style.pointerEvents = isInteractive ? "auto" : "none";
};

const speechSeconds = 7;
const speechGap = 12;

const placeBubble = (
  bubble: HTMLDivElement | null,
  point: ScreenPoint,
  frame: CompanionFrame,
  lift: number,
  viewport: Viewport,
  isShown: boolean
) => {
  if (!bubble) {
    return;
  }
  const top = point.y - frame.agentHeight - lift - speechGap;
  bubble.style.transform = `translate3d(${point.x}px, ${top}px, 0)`;
  bubble.dataset.side = point.x > viewport.width / 2 ? "left" : "right";
  bubble.dataset.shown = String(isShown);
};

const lineFor = (stop: Waypoint, visit: number) =>
  stop.lines.length > 0
    ? (stop.lines[visit % stop.lines.length] ?? null)
    : null;

const textSamples = 5;

const overlaps = (a: ScreenRect, b: ScreenRect) =>
  a.left < b.right && a.right > b.left && a.top < b.bottom && a.bottom > b.top;

const hasTextIn = (box: ScreenRect) => {
  const touched = new Set<Element>();
  const width = box.right - box.left;
  const height = box.bottom - box.top;
  for (let column = 0; column < textSamples; column += 1) {
    for (let row = 0; row < textSamples; row += 1) {
      const element = document.elementFromPoint(
        box.left + (width * (column + 0.5)) / textSamples,
        box.top + (height * (row + 0.5)) / textSamples
      );
      if (element) {
        touched.add(element);
      }
    }
  }
  const range = document.createRange();
  for (const element of touched) {
    for (const node of element.childNodes) {
      if (node.nodeType !== Node.TEXT_NODE || !node.textContent?.trim()) {
        continue;
      }
      range.selectNodeContents(node);
      for (const line of range.getClientRects()) {
        if (overlaps(line, box)) {
          return true;
        }
      }
    }
  }
  return false;
};

const pickFreePerch = (
  hit: HTMLDivElement | null,
  rect: ScreenRect,
  current: Perch,
  from: ScreenPoint,
  viewport: Viewport,
  frame: CompanionFrame
) => {
  if (hit) {
    hit.style.pointerEvents = "none";
  }
  const free = perchCandidates(rect, current, from, viewport, frame).filter(
    (perch) =>
      !hasTextIn(perchBox(perchPoint(rect, perch, viewport, frame), frame))
  );
  return free[Math.floor(Math.random() * free.length)] ?? null;
};

const swapOrigin = new Vector3();

const hammerReach = 0.32;
const hammerHeight = 0.3;

const hammerPoint = (
  point: ScreenPoint,
  frame: CompanionFrame,
  lift: number,
  viewport: Viewport
) => {
  const facing = point.x > viewport.width / 2 ? -1 : 1;
  return {
    x: point.x + facing * frame.agentWidth * hammerReach,
    y: point.y - frame.agentHeight * hammerHeight - lift,
  };
};

interface BuildBeatInput {
  frame: CompanionFrame;
  isBeat: boolean;
  isVisible: boolean;
  pose: CompanionPose;
  state: CompanionMotion;
  stop: Waypoint;
  time: number;
  viewport: Viewport;
}

const reportBuildBeat = ({
  frame,
  isBeat,
  isVisible,
  pose,
  state,
  stop,
  time,
  viewport,
}: BuildBeatInput) => {
  setCompanionStop(isVisible ? stop.element : null);
  const isHammering =
    isBeat &&
    isVisible &&
    pose.action === "build" &&
    state.leap === null &&
    !state.travel.isTraveling &&
    !isSwapActive(state, time);
  if (isHammering) {
    notifyCompanionBeat({
      waypoint: stop.element,
      ...hammerPoint(state.travel, frame, pose.lift, viewport),
    });
  }
};

const ClearDepth = () => {
  useFrame(({ gl }) => {
    gl.clearDepth();
  }, depthClearPriority);
  return null;
};

const CompanionContent = ({
  bubble,
  hit,
  pointer,
  presses,
}: CompanionContentProps) => {
  const isReduced = useReducedMotion();
  const camera = useRef<OrthographicCameraImpl>(null);
  const mover = useRef<Group>(null);
  const body = useRef<Group>(null);
  const poof = useRef<BurstHandle>(null);
  const hat = useRef<TossHandle>(null);
  const actionRef = useRef<AgentAction>("idle");
  const activeStop = useRef<Waypoint | null>(null);
  const perch = useRef<Perch>({ shift: 0, side: "right" });
  const handledPresses = useRef(0);
  const tossCount = useRef(0);
  const visits = useRef(new WeakMap<HTMLElement, number>());
  const spokenAt = useRef(Number.NEGATIVE_INFINITY);
  const lastBeat = useRef(0);
  const [outfit, setOutfit] = useState<Outfit>(() => ({
    role: findActiveWaypoint(readViewport(), null)?.role ?? "orchestrator",
    toss: null,
  }));
  const motion = useRef<CompanionMotion | null>(null);

  useEffect(() => () => setCompanionStop(null), []);

  const playCue = (cue: CompanionCue, side: WaypointSide, feet: Vector3) => {
    if (cue.kind === "none") {
      return;
    }
    tossCount.current += 1;
    if (cue.kind === "wear") {
      setOutfit({ role: cue.role, toss: null });
      return;
    }
    setOutfit({
      role: cue.role,
      toss: { id: tossCount.current, role: cue.tossed },
    });
    poof.current?.burst(
      swapOrigin.copy(feet).setY(feet.y + modelHeight * 0.55),
      1
    );
    hat.current?.launch(feet, side === "right" ? -1 : 1, 1);
  };

  useFrame((frameState, delta) => {
    const view = camera.current;
    const group = mover.current;
    const spinner = body.current;
    if (!(view && group && spinner)) {
      return;
    }
    const viewport = readViewport();
    const frame = companionFrame(viewport);
    const zoom = frame.agentHeight / modelHeight;
    if (Math.abs(view.zoom - zoom) > 0.001) {
      view.zoom = zoom;
      view.updateProjectionMatrix();
    }
    const time = frameState.clock.elapsedTime;
    const speak = (speaker: Waypoint) => {
      const visit = visits.current.get(speaker.element) ?? 0;
      visits.current.set(speaker.element, visit + 1);
      sayCompanionLine(lineFor(speaker, visit));
      spokenAt.current = time;
    };
    const stop = findActiveWaypoint(viewport, activeStop.current);
    if (stop && stop !== activeStop.current) {
      perch.current = { shift: 0, side: stop.side };
      speak(stop);
    }
    activeStop.current = stop;
    const state = motion.current ?? createCompanionMotion(outfit.role);
    motion.current = state;
    const beat = buildBeat(time);
    const isNewBeat = beat !== lastBeat.current;
    lastBeat.current = beat;
    if (!stop) {
      setCompanionStop(null);
      spinner.visible = false;
      placeHitBox(hit.current, state.travel, frame, 0, false);
      placeBubble(bubble.current, state.travel, frame, 0, viewport, false);
      return;
    }

    const rect = stop.element.getBoundingClientRect();
    if (presses.current !== handledPresses.current) {
      handledPresses.current = presses.current;
      speak(stop);
      if (state.isPlaced && !isSwapActive(state, time)) {
        const next = pickFreePerch(
          hit.current,
          rect,
          perch.current,
          state.travel,
          viewport,
          frame
        );
        if (next) {
          perch.current = next;
        }
        if (!isReduced) {
          startLeap(
            state,
            perchPoint(rect, perch.current, viewport, frame),
            time
          );
        }
      }
    }

    const pose = stepCompanion(state, {
      isHidden: isCastInView(viewport),
      isReduced,
      scrollY: window.scrollY,
      step: Math.min(delta, 0.1),
      stop,
      target: perchPoint(rect, perch.current, viewport, frame),
      time,
    });
    actionRef.current = pose.action;
    spinner.visible = state.scale > 0.01;
    const size = Math.max(0.0001, state.scale);
    const spread = size / Math.sqrt(pose.squash);
    spinner.scale.set(spread, size * pose.squash, spread);
    spinner.rotation.set(baseTilt, state.yaw + pose.spin, pose.lean);
    group.position.set(
      (state.travel.x - viewport.width / 2) / zoom,
      (viewport.height / 2 - state.travel.y + pose.lift) / zoom,
      0
    );
    playCue(pose.cue, stop.side, group.position);
    const isVisible = state.scale > 0.6;
    placeHitBox(hit.current, state.travel, frame, pose.lift, isVisible);
    placeBubble(
      bubble.current,
      state.travel,
      frame,
      pose.lift,
      viewport,
      isVisible &&
        stop.lines.length > 0 &&
        !state.travel.isTraveling &&
        time - spokenAt.current < speechSeconds
    );
    reportBuildBeat({
      frame,
      isBeat: isNewBeat && !isReduced,
      isVisible,
      pose,
      state,
      stop,
      time,
      viewport,
    });
  });

  return (
    <>
      <OrthographicCamera makeDefault position={[0, 0, 20]} ref={camera} />
      <ViewLights />
      <ClearDepth />
      <group ref={mover}>
        <group ref={body}>
          <Agent actionRef={actionRef} pointer={pointer} role={outfit.role} />
        </group>
      </group>
      <PaperPoof ref={poof} />
      <FlyingHat ref={hat} toss={outfit.toss} />
    </>
  );
};

export default CompanionContent;
