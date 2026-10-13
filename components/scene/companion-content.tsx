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
  OperatorMode,
  OperatorPose,
  OperatorTarget,
  Point,
  StationView,
} from "./companion-operator";
import {
  operatorPlacement,
  pickStation,
  railMode,
  stepOperator,
} from "./companion-operator";
import type {
  ColumnBounds,
  CompanionDock,
  DockGoal,
  Viewport,
} from "./companion-placement";
import {
  bubbleSide,
  companionDock,
  dockGoal,
  headerClearance,
  shouldYield,
  stationScale,
  watchYaw,
} from "./companion-placement";
import { getCompanionRail } from "./companion-rail";
import { railShare } from "./companion-rail-math";
import type { SpokenSection } from "./companion-signals";
import { getSpokenSection, sayCompanionLine } from "./companion-signals";
import type { TrackedStation } from "./station-tracking";
import {
  getFocusLine,
  getTrackedStations,
  isStationEngaged,
  toScreen,
} from "./station-tracking";
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

interface Steering {
  goal: DockGoal;
  pinned: OperatorPose | null;
}

interface Speech {
  isQuiet: boolean;
  isShown: boolean;
  text: string | null;
}

const modelHeight = 2.2;
const baseTilt = 0.16;
const depthClearPriority = 2.5;
const speechSeconds = 7;
const operatorSpeechSeconds = 3.2;
const speechGap = 12;
const tailInset = 8;
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
  lift: number,
  isInteractive: boolean
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
  hit.style.pointerEvents = isInteractive ? "auto" : "none";
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
  const slot = dock && dock.kind !== "corner" ? dock.bubble : null;
  if (!(dock && slot)) {
    bubble.dataset.shown = "false";
    return;
  }
  const head = state.y - dock.frame.agentHeight * state.scale - lift;
  const side = bubbleSide(head);
  const top = side === "above" ? head - speechGap : state.y + speechGap;
  const tail = state.x - slot.left;
  bubble.style.transform = `translate3d(${slot.left}px, ${top}px, 0)`;
  bubble.style.setProperty("--speech-width", `${slot.maxWidth}px`);
  bubble.style.setProperty("--speech-tail", `${tail}px`);
  bubble.dataset.side = side;
  bubble.dataset.tail = String(
    tail >= tailInset && tail <= slot.maxWidth - tailInset
  );
  bubble.dataset.shown = String(isShown);
};

const lineFor = (section: SpokenSection, visit: number) =>
  section.lines[visit % section.lines.length] ?? null;

const stationViews = (tracked: readonly TrackedStation[]): StationView[] =>
  tracked.map((entry) => ({
    console: toScreen(entry.console),
    figure: toScreen(entry.figure),
    id: entry.station.id,
  }));

const targetFor = (
  views: readonly StationView[],
  tracked: readonly TrackedStation[],
  id: string | null
): OperatorTarget | null => {
  const view = views.find((candidate) => candidate.id === id);
  const entry = tracked.find((candidate) => candidate.station.id === id);
  if (!(view && entry)) {
    return null;
  }
  return {
    console: {
      x: (view.console.left + view.console.right) / 2,
      y: view.console.top,
    },
    controls: entry.station.controls,
    id: entry.station.id,
  };
};

const modeStationId = (mode: OperatorMode) =>
  mode.kind === "travelling" || mode.kind === "operating"
    ? mode.stationId
    : null;

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
  const sectionLine = useRef<string | null>(null);
  const handledPresses = useRef(0);
  const tossCount = useRef(0);
  const visits = useRef(new WeakMap<Element, number>());
  const spokenAt = useRef(Number.NEGATIVE_INFINITY);
  const operatorLine = useRef<{ at: number; text: string } | null>(null);
  const motion = useRef<CompanionMotion | null>(null);
  const operator = useRef<OperatorMode>(railMode);
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

  const listenToSection = (time: number) => {
    const section = getSpokenSection();
    const speak = () => {
      if (!section) {
        return;
      }
      const visit = visits.current.get(section.element) ?? 0;
      visits.current.set(section.element, visit + 1);
      sectionLine.current = lineFor(section, visit);
      spokenAt.current = time;
    };
    if ((section?.element ?? null) !== heardSection.current) {
      if (section) {
        speak();
      } else {
        sectionLine.current = null;
      }
    }
    heardSection.current = section?.element ?? null;
    if (presses.current !== handledPresses.current) {
      handledPresses.current = presses.current;
      speak();
    }
    return section;
  };

  const chooseSpeech = (
    time: number,
    section: SpokenSection | null
  ): Speech => {
    const focused = getFocusLine();
    if (focused) {
      return { isQuiet: false, isShown: true, text: focused };
    }
    const operated = operatorLine.current;
    if (operated && time - operated.at < operatorSpeechSeconds) {
      return { isQuiet: true, isShown: true, text: operated.text };
    }
    return {
      isQuiet: false,
      isShown: section !== null && time - spokenAt.current < speechSeconds,
      text: sectionLine.current,
    };
  };

  const steer = ({
    dock,
    isYielding,
    restGoal,
    state,
    time,
    viewport,
  }: {
    dock: CompanionDock;
    isYielding: boolean;
    restGoal: DockGoal;
    state: CompanionMotion;
    time: number;
    viewport: Viewport;
  }): Steering => {
    const home: Point = { x: restGoal.x, y: restGoal.y };
    const tracked = getTrackedStations();
    const views = stationViews(tracked);
    const canOperate = !isReduced && dock.kind !== "corner";
    const targetId = canOperate
      ? pickStation(
          views,
          viewport,
          modeStationId(operator.current),
          headerClearance
        )
      : null;
    const target = targetFor(views, tracked, targetId);
    const { effect, mode } = stepOperator(operator.current, {
      canOperate,
      home,
      isEngaged: targetId ? isStationEngaged(targetId) : false,
      isYielding,
      position: state.isPlaced ? { x: state.x, y: state.y } : home,
      target,
      time,
    });
    operator.current = mode;
    if (effect) {
      tracked
        .find((entry) => entry.station.id === effect.stationId)
        ?.station.operate(effect.control.id);
      operatorLine.current = { at: time, text: effect.control.label };
    }
    const placement = operatorPlacement(mode, {
      console: target?.console ?? null,
      home,
      time,
    });
    if (!placement.pose) {
      const isWatching = getFocusLine() !== null && !isYielding;
      return {
        goal: { ...restGoal, yaw: isWatching ? watchYaw : restGoal.yaw },
        pinned: null,
      };
    }
    return {
      goal: {
        scale: 1 + (stationScale(dock) - 1) * placement.stationShare,
        x: placement.goal.x,
        y: placement.goal.y,
        yaw: placement.pose.yaw,
      },
      pinned: placement.pose,
    };
  };

  useFrame((frameState, delta) => {
    const view = camera.current;
    const group = mover.current;
    const spinner = body.current;
    if (!(view && group && spinner)) {
      return;
    }
    const { elapsedTime: time } = frameState.clock;
    const viewport = readViewport();
    const bounds = column.current;
    const rail = getCompanionRail();
    const dock = bounds
      ? companionDock(viewport, bounds, rail?.track ?? null)
      : null;
    const state = motion.current ?? createCompanionMotion(cast.role);
    motion.current = state;
    if (!dock) {
      spinner.visible = false;
      placeHitBox(hit.current, state, null, 0, false);
      placeBubble(bubble.current, state, null, 0, false);
      return;
    }
    const zoom = dock.frame.agentHeight / modelHeight;
    if (Math.abs(view.zoom - zoom) > 0.001) {
      view.zoom = zoom;
      view.updateProjectionMatrix();
    }

    const section = listenToSection(time);
    const isYielding = shouldYield(
      castRects(),
      viewport,
      isYieldingRef.current
    );
    isYieldingRef.current = isYielding;
    const { scrollY } = window;
    const restGoal = dockGoal(dock, {
      isTucked: !isReduced && state.scrollVelocity > tuckSpeed,
      isYielding,
      railShare:
        rail && dock.kind === "rail" ? railShare(scrollY, rail.anchors) : 0,
    });
    const { goal, pinned } = steer({
      dock,
      isYielding,
      restGoal,
      state,
      time,
      viewport,
    });
    const pose = stepCompanion(state, {
      goal,
      isReduced,
      pinned,
      restAction: cast.action,
      role: cast.role,
      scrollY,
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
    const isPresent =
      !isYielding && goal.scale > 0.5 && state.scale > shownScale * goal.scale;
    placeHitBox(hit.current, state, dock, pose.lift, isPresent);
    const speech = chooseSpeech(time, section);
    sayCompanionLine(speech.text, speech.isQuiet);
    placeBubble(
      bubble.current,
      state,
      dock,
      pose.lift,
      isPresent && speech.isShown && speech.text !== null
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
