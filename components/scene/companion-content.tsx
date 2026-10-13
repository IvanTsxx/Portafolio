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
import type { CompanionCast } from "@/lib/site/companion-roles";

import type { BurstHandle, HatToss, TossHandle } from "./companion-effects";
import { FlyingHat, PaperPoof } from "./companion-effects";
import type { CompanionCue, CompanionMotion } from "./companion-motion";
import {
  createCompanionMotion,
  stepCompanion,
  tuckSpeed,
} from "./companion-motion";
import type {
  ColumnBounds,
  CompanionDock,
  Viewport,
} from "./companion-placement";
import { companionDock, dockGoal, shouldYield } from "./companion-placement";
import type { SpokenSection } from "./companion-signals";
import { getSpokenSection, sayCompanionLine } from "./companion-signals";
import { ViewLights } from "./view-lights";
import { getAgentCasts } from "./view-registry";

export interface CompanionContentProps {
  bubble: RefObject<HTMLDivElement | null>;
  cast: CompanionCast;
  column: RefObject<ColumnBounds | null>;
  hit: RefObject<HTMLDivElement | null>;
  pointer: RefObject<AgentPointer>;
  presses: RefObject<number>;
}

interface Outfit {
  role: AgentRole;
  toss: HatToss | null;
}

const modelHeight = 2.2;
const baseTilt = 0.16;
const depthClearPriority = 2.5;
const speechSeconds = 7;
const speechGap = 12;
const shownScale = 0.85;

const readViewport = (): Viewport => ({
  height: window.innerHeight,
  width: document.documentElement.clientWidth,
});

const castRects = () =>
  Array.from(getAgentCasts(), (cast) => cast.getBoundingClientRect());

const placeHitBox = (
  hit: HTMLDivElement | null,
  state: CompanionMotion,
  dock: CompanionDock | null,
  lift: number
) => {
  if (!hit) {
    return;
  }
  if (!dock) {
    hit.style.pointerEvents = "none";
    return;
  }
  const width = dock.frame.agentWidth * state.scale;
  const height = dock.frame.agentHeight * state.scale;
  hit.style.transform = `translate3d(${state.x - width / 2}px, ${state.y - height - lift}px, 0)`;
  hit.style.width = `${width}px`;
  hit.style.height = `${height}px`;
  hit.style.pointerEvents = state.scale > shownScale ? "auto" : "none";
};

const placeBubble = (
  bubble: HTMLDivElement | null,
  state: CompanionMotion,
  dock: CompanionDock | null,
  lift: number,
  isShown: boolean
) => {
  if (!bubble) {
    return;
  }
  const slot = dock?.kind === "gutter" ? dock.bubble : null;
  if (!(dock && slot)) {
    bubble.dataset.shown = "false";
    return;
  }
  const top = state.y - dock.frame.agentHeight * state.scale - lift - speechGap;
  bubble.style.transform = `translate3d(${slot.left}px, ${top}px, 0)`;
  bubble.style.setProperty("--speech-width", `${slot.maxWidth}px`);
  bubble.style.setProperty("--speech-tail", `${state.x - slot.left}px`);
  bubble.dataset.shown = String(isShown);
};

const lineFor = (section: SpokenSection, visit: number) =>
  section.lines[visit % section.lines.length] ?? null;

const swapOrigin = new Vector3();

const ClearDepth = () => {
  useFrame(({ gl }) => {
    gl.clearDepth();
  }, depthClearPriority);
  return null;
};

const CompanionContent = ({
  bubble,
  cast,
  column,
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
  const actionRef = useRef<AgentAction>(cast.action);
  const heardSection = useRef<Element | null>(null);
  const handledPresses = useRef(0);
  const tossCount = useRef(0);
  const visits = useRef(new WeakMap<Element, number>());
  const spokenAt = useRef(Number.NEGATIVE_INFINITY);
  const motion = useRef<CompanionMotion | null>(null);
  const isYieldingRef = useRef(false);
  const [outfit, setOutfit] = useState<Outfit>({
    role: cast.role,
    toss: null,
  });

  const playCue = (cue: CompanionCue, feet: Vector3) => {
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
    hat.current?.launch(feet, -1, 1);
  };

  useFrame((frameState, delta) => {
    const view = camera.current;
    const group = mover.current;
    const spinner = body.current;
    if (!(view && group && spinner)) {
      return;
    }
    const time = frameState.clock.elapsedTime;
    const viewport = readViewport();
    const bounds = column.current;
    const dock = bounds ? companionDock(viewport, bounds) : null;
    const state = motion.current ?? createCompanionMotion(cast.role);
    motion.current = state;
    if (!dock) {
      spinner.visible = false;
      placeHitBox(hit.current, state, null, 0);
      placeBubble(bubble.current, state, null, 0, false);
      return;
    }
    const zoom = dock.frame.agentHeight / modelHeight;
    if (Math.abs(view.zoom - zoom) > 0.001) {
      view.zoom = zoom;
      view.updateProjectionMatrix();
    }

    const section = getSpokenSection();
    const speak = () => {
      if (!section) {
        return;
      }
      const visit = visits.current.get(section.element) ?? 0;
      visits.current.set(section.element, visit + 1);
      sayCompanionLine(lineFor(section, visit));
      spokenAt.current = time;
    };
    if ((section?.element ?? null) !== heardSection.current) {
      if (section) {
        speak();
      } else {
        sayCompanionLine(null);
      }
    }
    heardSection.current = section?.element ?? null;
    if (presses.current !== handledPresses.current) {
      handledPresses.current = presses.current;
      speak();
    }

    const isYielding = shouldYield(
      castRects(),
      viewport,
      isYieldingRef.current
    );
    isYieldingRef.current = isYielding;
    const goal = dockGoal(dock, {
      isTucked: !isReduced && state.scrollVelocity > tuckSpeed,
      isYielding,
    });
    const pose = stepCompanion(state, {
      goal,
      isReduced,
      restAction: cast.action,
      role: cast.role,
      scrollY: window.scrollY,
      step: Math.min(delta, 0.1),
      time,
    });
    actionRef.current = pose.action;
    spinner.visible = state.scale > 0.01;
    const size = Math.max(0.0001, state.scale);
    const spread = size / Math.sqrt(pose.squash);
    spinner.scale.set(spread, size * pose.squash, spread);
    spinner.rotation.set(baseTilt, state.yaw + pose.spin, pose.lean);
    group.position.set(
      (state.x - viewport.width / 2) / zoom,
      (viewport.height / 2 - state.y + pose.lift) / zoom,
      0
    );
    playCue(pose.cue, group.position);
    placeHitBox(hit.current, state, dock, pose.lift);
    placeBubble(
      bubble.current,
      state,
      dock,
      pose.lift,
      !isYielding &&
        state.scale > shownScale &&
        section !== null &&
        time - spokenAt.current < speechSeconds
    );
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
