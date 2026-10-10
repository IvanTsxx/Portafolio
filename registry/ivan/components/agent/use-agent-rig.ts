"use client";

import { useFrame } from "@react-three/fiber";
import { useRef } from "react";
import type { RefObject } from "react";
import type { Group } from "three";
import { MathUtils } from "three";

import type { AgentAction, AgentReaction } from "./types";

import type { HopPlan } from "./actions";
import {
  actionClips,
  applyHop,
  applyHopReduced,
  hopClip,
  reactionClips,
} from "./actions";
import { createHopPlanner, createReactionDeck } from "./reaction-deck";
import type { Pose } from "./rig";
import { blendPoses, createPose } from "./rig";

export type AgentMotion = "full" | "reduced";

export interface AgentPointer {
  hovered: boolean;
  presses: number;
  x: number;
  y: number;
}

export interface RigNodes {
  armLeft: Group | null;
  armRight: Group | null;
  body: Group | null;
  eyes: Group | null;
  legs: (Group | null)[];
  root: Group | null;
  shadow: Group | null;
}

interface RigOptions {
  action: AgentAction;
  actionRef?: RefObject<AgentAction>;
  pointer: RefObject<AgentPointer>;
  motion: AgentMotion;
  seed: number;
}

interface Playback {
  blendFrom: AgentAction;
  blendStart: number;
  current: AgentAction;
  dealReaction: (() => AgentReaction) | null;
  hop: HopPlan | null;
  hopStart: number;
  planHop: (() => HopPlan) | null;
  presses: number;
  reaction: AgentReaction | null;
  reactionStart: number;
  wasHovered: boolean;
}

const blendSeconds = 0.38;
const blinkSeconds = 0.13;
const reactionInSeconds = 0.16;
const reactionOutSeconds = 0.28;
const reactionRetrigger = 0.55;

const smoothstep = (value: number) => {
  const clamped = MathUtils.clamp(value, 0, 1);
  return clamped * clamped * (3 - 2 * clamped);
};

const applyPose = (nodes: RigNodes, pose: Pose, blink: number) => {
  const { armLeft, armRight, body, eyes, legs, root, shadow } = nodes;
  if (shadow) {
    shadow.scale.setScalar(MathUtils.clamp(1 - pose.rootY * 1.6, 0.45, 1));
    shadow.position.set(pose.rootX, 0, pose.rootZ);
  }
  if (root) {
    root.position.set(pose.rootX, pose.rootY, pose.rootZ);
    root.rotation.y = pose.bodyYaw;
  }
  if (body) {
    const spread = 1 + (1 - pose.bodySquash) * 0.5;
    body.scale.set(spread, pose.bodySquash, spread);
    body.rotation.set(pose.bodyTiltX, 0, pose.bodyTiltZ);
  }
  if (armRight) {
    armRight.rotation.set(0, -pose.armRightForward, pose.armRightRaise);
  }
  if (armLeft) {
    armLeft.rotation.set(0, pose.armLeftForward, -pose.armLeftRaise);
  }
  const legAngles = [pose.leg0, pose.leg1, pose.leg2, pose.leg3];
  for (const [index, leg] of legs.entries()) {
    if (leg) {
      leg.rotation.x = legAngles[index] ?? 0;
    }
  }
  if (eyes) {
    eyes.position.x = pose.gazeX;
    eyes.position.y = pose.gazeY;
    eyes.scale.set(Math.max(1, pose.eyeOpen), blink * pose.eyeOpen, 1);
  }
};

const blinkAmount = (time: number, seed: number) => {
  const period = 3.4 + seed * 2.2;
  const phase = (time + seed * 11) % period;
  const doubleBlink =
    seed > 0.7 && phase > blinkSeconds * 1.6 && phase < blinkSeconds * 2.6;
  const local = doubleBlink ? phase - blinkSeconds * 1.6 : phase;
  if (local > blinkSeconds) {
    return 1;
  }
  return 1 - Math.sin((local / blinkSeconds) * Math.PI) * 0.9;
};

const trackHop = (track: Playback, presses: number, time: number) => {
  if (presses !== track.presses) {
    track.presses = presses;
    const plan = track.planHop ?? createHopPlanner();
    track.planHop = plan;
    track.hop = plan();
    track.hopStart = time;
  }
  const hopTime = time - track.hopStart;
  if (track.hop && hopTime >= hopClip.duration) {
    track.hop = null;
  }
  return hopTime;
};

export const useAgentRig = ({
  action: actionProp,
  actionRef,
  pointer,
  motion,
  seed,
}: RigOptions) => {
  const liveAction = useRef<AgentAction>(actionProp);
  const nodes = useRef<RigNodes>({
    armLeft: null,
    armRight: null,
    body: null,
    eyes: null,
    legs: [null, null, null, null],
    root: null,
    shadow: null,
  });
  const playback = useRef<Playback>({
    blendFrom: actionProp,
    blendStart: Number.NEGATIVE_INFINITY,
    current: actionProp,
    dealReaction: null,
    hop: null,
    hopStart: Number.NEGATIVE_INFINITY,
    planHop: null,
    presses: 0,
    reaction: null,
    reactionStart: Number.NEGATIVE_INFINITY,
    wasHovered: false,
  });
  const poses = useRef({
    from: createPose(),
    out: createPose(),
    reaction: createPose(),
    to: createPose(),
  });

  useFrame((state) => {
    const time = state.clock.elapsedTime;
    const track = playback.current;
    const { from, out, reaction, to } = poses.current;
    const action = actionRef?.current ?? actionProp;
    const look = pointer.current;
    liveAction.current = action;

    if (look.hovered && !track.wasHovered) {
      const playing = track.reaction
        ? (time - track.reactionStart) / reactionClips[track.reaction].duration
        : 1;
      if (playing >= reactionRetrigger) {
        const deal = track.dealReaction ?? createReactionDeck();
        track.dealReaction = deal;
        track.reaction = deal();
        track.reactionStart = time;
      }
    }
    track.wasHovered = look.hovered;
    const hopTime = trackHop(track, look.presses, time);
    const reactionTime = time - track.reactionStart;
    if (
      track.reaction &&
      reactionTime >= reactionClips[track.reaction].duration
    ) {
      track.reaction = null;
    }

    if (motion === "reduced") {
      if (track.reaction) {
        const clip = reactionClips[track.reaction];
        clip.pose(clip.keyTime, out, look);
        state.invalidate();
      } else {
        const clip = actionClips[action];
        clip.pose(clip.keyTime, out);
      }
      if (track.hop) {
        applyHopReduced(hopTime, track.hop, out);
        state.invalidate();
      }
      applyPose(nodes.current, out, 1);
      return;
    }

    if (action !== track.current) {
      track.blendFrom = track.current;
      track.current = action;
      track.blendStart = time;
    }

    actionClips[track.current].pose(time, to);
    const blend = smoothstep((time - track.blendStart) / blendSeconds);
    if (blend < 1) {
      actionClips[track.blendFrom].pose(time, from);
      blendPoses(from, to, blend, out);
    } else {
      blendPoses(to, to, 0, out);
    }

    if (track.reaction) {
      const clip = reactionClips[track.reaction];
      clip.pose(reactionTime, reaction, look);
      const weight =
        smoothstep(reactionTime / reactionInSeconds) *
        smoothstep((clip.duration - reactionTime) / reactionOutSeconds);
      blendPoses(out, reaction, weight, out);
    }

    if (track.hop) {
      applyHop(hopTime, track.hop, out);
    }

    applyPose(nodes.current, out, blinkAmount(time, seed));
  });

  const attach =
    (part: Exclude<keyof RigNodes, "legs">) => (node: Group | null) => {
      nodes.current[part] = node;
    };
  const attachLeg = (index: number) => (node: Group | null) => {
    nodes.current.legs[index] = node;
  };

  return { attach, attachLeg, liveAction };
};
