"use client";

import { OrthographicCamera } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { useRef, useState } from "react";
import type { RefObject } from "react";
import type {
  Group,
  OrthographicCamera as OrthographicCameraImpl,
} from "three";
import { Vector3 } from "three";

import type { AgentPointer } from "@/components/agents/agent";
import { Agent } from "@/components/agents/agent";
import { useReducedMotion } from "@/hooks/use-reduced-motion";
import type { AgentAction, AgentRole } from "@/lib/agents/roles";

import type { BurstHandle, HatToss, TossHandle } from "./companion-effects";
import { FlyingHat, PaperPoof } from "./companion-effects";
import type { CompanionCue, CompanionMotion } from "./companion-motion";
import { createCompanionMotion, stepCompanion } from "./companion-motion";
import type { CompanionFrame, ScreenPoint, Viewport } from "./companion-path";
import {
  anchorFor,
  companionFrame,
  ownVisibleShare,
  pickWaypoint,
} from "./companion-path";
import { ViewLights } from "./view-lights";
import type { Waypoint, WaypointSide } from "./view-registry";
import { getAgentCasts, getWaypoints } from "./view-registry";

export interface CompanionContentProps {
  hit: RefObject<HTMLDivElement | null>;
  pointer: RefObject<AgentPointer>;
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

const swapOrigin = new Vector3();

const ClearDepth = () => {
  useFrame(({ gl }) => {
    gl.clearDepth();
  }, depthClearPriority);
  return null;
};

const CompanionContent = ({ hit, pointer }: CompanionContentProps) => {
  const isReduced = useReducedMotion();
  const camera = useRef<OrthographicCameraImpl>(null);
  const mover = useRef<Group>(null);
  const body = useRef<Group>(null);
  const poof = useRef<BurstHandle>(null);
  const hat = useRef<TossHandle>(null);
  const actionRef = useRef<AgentAction>("idle");
  const activeStop = useRef<Waypoint | null>(null);
  const tossCount = useRef(0);
  const [outfit, setOutfit] = useState<Outfit>(() => ({
    role: findActiveWaypoint(readViewport(), null)?.role ?? "orchestrator",
    toss: null,
  }));
  const motion = useRef<CompanionMotion | null>(null);

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
    const stop = findActiveWaypoint(viewport, activeStop.current);
    activeStop.current = stop;
    const state = motion.current ?? createCompanionMotion(outfit.role);
    motion.current = state;
    if (!stop) {
      spinner.visible = false;
      placeHitBox(hit.current, state.travel, frame, 0, false);
      return;
    }

    const pose = stepCompanion(state, {
      isHidden: isCastInView(viewport),
      isReduced,
      scrollY: window.scrollY,
      step: Math.min(delta, 0.1),
      stop,
      target: anchorFor(
        stop.element.getBoundingClientRect(),
        stop.side,
        viewport,
        frame
      ),
      time: frameState.clock.elapsedTime,
    });
    actionRef.current = pose.action;
    spinner.visible = state.scale > 0.01;
    spinner.scale.setScalar(Math.max(0.0001, state.scale));
    spinner.rotation.set(baseTilt, state.yaw + pose.spin, pose.lean);
    group.position.set(
      (state.travel.x - viewport.width / 2) / zoom,
      (viewport.height / 2 - state.travel.y + pose.lift) / zoom,
      0
    );
    playCue(pose.cue, stop.side, group.position);
    placeHitBox(hit.current, state.travel, frame, pose.lift, state.scale > 0.6);
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
