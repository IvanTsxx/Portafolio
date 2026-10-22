"use client";

import { useFrame, useThree } from "@react-three/fiber";
import { useEffect, useMemo, useRef } from "react";
import { Color } from "three";

import { printColors } from "@/lib/site/print-colors";

export interface LanePulse {
  x: number;
  y: number;
}

export interface LaneRect {
  bottom: number;
  left: number;
  right: number;
  top: number;
}

export interface LanePointer {
  isInside: boolean;
  pulses: LanePulse[];
  sheet: LaneRect;
  x: number;
  y: number;
}

export interface LaneSceneProps {
  animate: boolean;
  pointer: LanePointer;
  sense: () => void;
}

export interface LaneSize {
  height: number;
  width: number;
}

export interface LaneTick {
  energy: number;
  pointer: LanePointer;
  pulses: readonly LanePulse[];
  step: number;
}

export interface LaneEngine<Target> {
  dispose?: () => void;
  draw: (target: Target) => void;
  simulate: (tick: LaneTick) => void;
}

interface LaneClock {
  carry: number;
  energy: number;
}

const fixedStep = 1 / 120;
const maxCarry = fixedStep * 8;
const energyRise = 5;
const energyFall = 1.6;
const noPulses: readonly LanePulse[] = [];

export const createLanePointer = (): LanePointer => ({
  isInside: false,
  pulses: [],
  sheet: { bottom: 0, left: 0, right: 0, top: 0 },
  x: 0,
  y: 0,
});

export const inkColor = new Color(printColors.ink);
export const clayColor = new Color(printColors.clay);

export const isInsideRect = (rect: LaneRect, x: number, y: number) =>
  x > rect.left && x < rect.right && y > rect.bottom && y < rect.top;

export const useLaneSize = (): LaneSize => {
  const width = useThree((state) => state.size.width);
  const height = useThree((state) => state.size.height);
  return useMemo(() => ({ height, width }), [height, width]);
};

const advanceLane = <Target>(
  clock: LaneClock,
  lane: LanePointer,
  engine: LaneEngine<Target>,
  delta: number
) => {
  clock.carry = Math.min(clock.carry + delta, maxCarry);
  let pulses: readonly LanePulse[] =
    lane.pulses.length > 0 ? lane.pulses.splice(0) : noPulses;
  while (clock.carry >= fixedStep) {
    const goal = lane.isInside ? 1 : 0;
    const rate = goal > clock.energy ? energyRise : energyFall;
    clock.energy += (goal - clock.energy) * (1 - Math.exp(-rate * fixedStep));
    engine.simulate({
      energy: clock.energy,
      pointer: lane,
      pulses,
      step: fixedStep,
    });
    pulses = noPulses;
    clock.carry -= fixedStep;
  }
};

const dropPulses = (lane: LanePointer) => {
  lane.pulses.length = 0;
};

export const useLaneEngine = <Target>(
  { animate, pointer, sense }: LaneSceneProps,
  engine: LaneEngine<Target>,
  target: () => Target | null
) => {
  const clock = useRef<LaneClock>({ carry: 0, energy: 0 });

  useEffect(() => () => engine.dispose?.(), [engine]);

  useFrame((_, delta) => {
    sense();
    if (animate) {
      advanceLane(clock.current, pointer, engine, delta);
    } else {
      dropPulses(pointer);
    }
    const drawn = target();
    if (drawn) {
      engine.draw(drawn);
    }
  });
};
