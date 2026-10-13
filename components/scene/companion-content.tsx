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
import type { Outfit as AgentOutfit } from "@/components/agents/outfit";
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
  consoleClearance,
  operatorPlacement,
  pickStation,
  railMode,
  stationAct,
  stepOperator,
} from "./companion-operator";
import type {
  BubbleSlot,
  ColumnBounds,
  CompanionDock,
  DockGoal,
  Viewport,
} from "./companion-placement";
import {
  bubbleSide,
  companionDock,
  dockGoal,
  headBubbleSlot,
  headerClearance,
  watchYaw,
} from "./companion-placement";
import { getCompanionRail } from "./companion-rail";
import { railShare } from "./companion-rail-math";
import type { SpokenSection } from "./companion-signals";
import { getSpokenSection, sayCompanionLine } from "./companion-signals";
import { getCompanionStages } from "./companion-stages";
import {
  getFocusLine,
  getTrackedStations,
  isStationEngaged,
  toScreen,
} from "./station-tracking";
import { ViewLights } from "./view-lights";

export interface CompanionContentProps {
  bubble: RefObject<HTMLDivElement | null>;
  cast: CompanionCast;
  column: RefObject<ColumnBounds | null>;
  hit: RefObject<HTMLDivElement | null>;
  pointer: RefObject<AgentPointer>;
  presses: RefObject<number>;
  wardrobe: AgentOutfit | null;
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

interface Candidate {
  operate: ((controlId: string) => void) | null;
  target: OperatorTarget;
  view: StationView;
}

const modelHeight = 2.2;
const baseTilt = 0.16;
const depthClearPriority = 2.5;
const speechSeconds = 6;
const operatorSpeechSeconds = 3.2;
const speechGap = 10;
const tailInset = 8;
const shownScale = 0.85;

const readViewport = (): Viewport => ({
  height: window.innerHeight,
  width: document.documentElement.clientWidth,
});

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

const placeBubble = ({
  bubble,
  dock,
  isAway,
  isShown,
  lift,
  state,
  viewport,
}: {
  bubble: HTMLDivElement | null;
  dock: CompanionDock | null;
  isAway: boolean;
  isShown: boolean;
  lift: number;
  state: CompanionMotion;
  viewport: Viewport;
}) => {
  if (!bubble) {
    return;
  }
  const docked = dock && dock.kind !== "corner" ? dock.bubble : null;
  const slot: BubbleSlot | null =
    isAway || !docked ? headBubbleSlot(viewport, state.x) : docked;
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

const stationCandidates = (): Candidate[] =>
  getTrackedStations().map((entry) => {
    const console = toScreen(entry.console);
    return {
      operate: entry.station.operate,
      target: {
        act: stationAct,
        console: { x: (console.left + console.right) / 2, y: console.top },
        controls: entry.station.controls,
        id: entry.station.id,
      },
      view: {
        clearance: consoleClearance,
        console,
        figure: toScreen(entry.figure),
        id: entry.station.id,
      },
    };
  });

const stageCandidates = (dock: CompanionDock): Candidate[] => {
  const candidates: Candidate[] = [];
  for (const stage of getCompanionStages()) {
    const spot = stage.spot();
    if (!spot) {
      continue;
    }
    const height = spot.height ?? dock.frame.agentHeight;
    candidates.push({
      operate: null,
      target: {
        act: {
          action: spot.action,
          scale: height / dock.frame.agentHeight,
          yaw: spot.yaw,
        },
        console: { x: spot.x, y: spot.y },
        controls: [],
        id: stage.id,
      },
      view: {
        clearance: 0,
        console: {
          bottom: spot.y,
          left: spot.x - 1,
          right: spot.x + 1,
          top: spot.y - height,
        },
        figure: stage.figure.getBoundingClientRect(),
        id: stage.id,
      },
    });
  }
  return candidates;
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
  wardrobe,
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
    restGoal,
    state,
    time,
    viewport,
  }: {
    dock: CompanionDock;
    restGoal: DockGoal;
    state: CompanionMotion;
    time: number;
    viewport: Viewport;
  }): Steering => {
    const home: Point = { x: restGoal.x, y: restGoal.y };
    const candidates = isReduced
      ? []
      : [
          ...(dock.kind === "corner" ? [] : stationCandidates()),
          ...stageCandidates(dock),
        ];
    const targetId = pickStation(
      candidates.map((candidate) => candidate.view),
      viewport,
      modeStationId(operator.current),
      headerClearance
    );
    const chosen =
      candidates.find((candidate) => candidate.view.id === targetId) ?? null;
    const { effect, mode } = stepOperator(operator.current, {
      canOperate: !isReduced,
      home,
      isEngaged: targetId ? isStationEngaged(targetId) : false,
      position: state.isPlaced ? { x: state.x, y: state.y } : home,
      target: chosen?.target ?? null,
      time,
    });
    operator.current = mode;
    if (effect) {
      chosen?.operate?.(effect.control.id);
      operatorLine.current = { at: time, text: effect.control.label };
    }
    const placement = operatorPlacement(mode, {
      console: chosen?.target.console ?? null,
      home,
      time,
    });
    if (!placement.pose) {
      const isWatching = getFocusLine() !== null;
      return {
        goal: { ...restGoal, yaw: isWatching ? watchYaw : restGoal.yaw },
        pinned: null,
      };
    }
    return {
      goal: {
        scale: placement.scale,
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
      placeBubble({
        bubble: bubble.current,
        dock: null,
        isAway: false,
        isShown: false,
        lift: 0,
        state,
        viewport,
      });
      return;
    }
    const zoom = dock.frame.agentHeight / modelHeight;
    if (Math.abs(view.zoom - zoom) > 0.001) {
      view.zoom = zoom;
      view.updateProjectionMatrix();
    }

    const section = listenToSection(time);
    const { scrollY } = window;
    const restGoal = dockGoal(dock, {
      isTucked: !isReduced && state.scrollVelocity > tuckSpeed,
      railShare:
        rail && dock.kind === "rail" ? railShare(scrollY, rail.anchors) : 0,
    });
    const { goal, pinned } = steer({
      dock,
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
    const isPresent = goal.scale > 0.5 && state.scale > shownScale * goal.scale;
    placeHitBox(hit.current, state, dock, pose.lift, isPresent);
    const speech = chooseSpeech(time, section);
    sayCompanionLine(speech.text, speech.isQuiet);
    placeBubble({
      bubble: bubble.current,
      dock,
      isAway: pinned !== null,
      isShown: isPresent && speech.isShown && speech.text !== null,
      lift: pose.lift,
      state,
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
          <Agent
            actionRef={actionRef}
            animateOutfit={wardrobe !== null}
            outfit={wardrobe ?? undefined}
            pointer={pointer}
            role={outfit.role}
          />
        </group>
      </group>
      <PaperPoof ref={poof} />
      <FlyingHat ref={hat} toss={outfit.toss} />
    </>
  );
};

export default CompanionContent;
