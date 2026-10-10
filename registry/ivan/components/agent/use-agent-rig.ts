"use client";

import { useFrame } from "@react-three/fiber";
import { useRef } from "react";
import type { RefObject } from "react";
import type { Group } from "three";
import { MathUtils, Vector3 } from "three";

import { actionClips } from "./actions";
import type { Pose } from "./rig";
import { blendPoses, createPose } from "./rig";
import type { AgentAction } from "./types";

export type AgentMotion = "full" | "reduced";

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
  focused: boolean;
  motion: AgentMotion;
  seed: number;
}

const blendSeconds = 0.38;
const hopSeconds = 0.42;
const blinkSeconds = 0.13;
const maxFocusYaw = 0.5;

const smoothstep = (value: number) => {
  const clamped = MathUtils.clamp(value, 0, 1);
  return clamped * clamped * (3 - 2 * clamped);
};

const cameraLocal = new Vector3();

const applyPose = (nodes: RigNodes, pose: Pose, blink: number) => {
  const { armLeft, armRight, body, eyes, legs, root, shadow } = nodes;
  if (shadow) {
    shadow.scale.setScalar(MathUtils.clamp(1 - pose.rootY * 1.6, 0.45, 1));
  }
  if (root) {
    root.position.y = pose.rootY;
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
    eyes.scale.y = blink;
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

export const useAgentRig = ({
  action: actionProp,
  actionRef,
  focused,
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
  const playback = useRef({
    blendFrom: actionProp,
    blendStart: Number.NEGATIVE_INFINITY,
    current: actionProp,
    focusStart: Number.NEGATIVE_INFINITY,
    focusWeight: 0,
    wasFocused: false,
  });
  const poses = useRef({
    from: createPose(),
    out: createPose(),
    to: createPose(),
  });

  useFrame((state, delta) => {
    const time = state.clock.elapsedTime;
    const step = Math.min(delta, 0.1);
    const track = playback.current;
    const { from, out, to } = poses.current;
    const action = actionRef?.current ?? actionProp;
    liveAction.current = action;

    if (motion === "reduced") {
      const clip = actionClips[action];
      clip.pose(clip.keyTime, out);
      out.bodyTiltX += focused ? 0.08 : 0;
      applyPose(nodes.current, out, 1);
      return;
    }

    if (action !== track.current) {
      track.blendFrom = track.current;
      track.current = action;
      track.blendStart = time;
    }
    if (focused && !track.wasFocused) {
      track.focusStart = time;
    }
    track.wasFocused = focused;

    actionClips[track.current].pose(time, to);
    const blend = smoothstep((time - track.blendStart) / blendSeconds);
    if (blend < 1) {
      actionClips[track.blendFrom].pose(time, from);
      blendPoses(from, to, blend, out);
    } else {
      blendPoses(to, to, 0, out);
    }

    track.focusWeight = MathUtils.damp(
      track.focusWeight,
      focused ? 1 : 0,
      7,
      step
    );
    const { root } = nodes.current;
    if (track.focusWeight > 0.001 && root?.parent) {
      cameraLocal.copy(state.camera.position);
      root.parent.worldToLocal(cameraLocal);
      const yawToCamera = MathUtils.clamp(
        Math.atan2(cameraLocal.x, cameraLocal.z),
        -maxFocusYaw,
        maxFocusYaw
      );
      out.bodyYaw += (yawToCamera - out.bodyYaw * 0.5) * track.focusWeight;
      out.bodyTiltX += 0.07 * track.focusWeight;
      out.gazeY += 0.012 * track.focusWeight;
    }
    const hopProgress = (time - track.focusStart) / hopSeconds;
    if (hopProgress >= 0 && hopProgress < 1) {
      out.rootY += Math.sin(hopProgress * Math.PI) * 0.12;
      out.bodySquash *= 1 - Math.sin(hopProgress * Math.PI * 2) * 0.04;
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
