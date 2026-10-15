"use client";

import { useLayoutEffect, useRef } from "react";
import type { RefObject } from "react";

import { registerCompanionStage } from "@/components/scene/companion-stages";
import { requestSceneFrame } from "@/components/scene/view-registry";

import { gazeYaw } from "./contribution-model";
import type { GraphPhase } from "./use-graph-motion";

const stageId = "contribution-graph";
const standInset = 32;
const restYaw = -0.5;

export const useGraphCompanion = ({
  figure,
  isReduced,
  phase,
}: {
  figure: RefObject<HTMLElement | null>;
  isReduced: boolean;
  phase: GraphPhase;
}) => {
  const gaze = useRef<HTMLElement | null>(null);
  const isTyping = useRef(false);
  const isOnStage = phase !== "waiting" && !isReduced;

  useLayoutEffect(() => {
    isTyping.current = phase === "typing";
    requestSceneFrame();
  }, [phase]);

  useLayoutEffect(() => {
    const element = figure.current;
    if (!(element && isOnStage)) {
      return;
    }
    return registerCompanionStage({
      figure: element,
      id: stageId,
      spot: () => {
        const box = element.getBoundingClientRect();
        const x = box.right - standInset;
        const target = gaze.current;
        if (target && !isTyping.current) {
          const cell = target.getBoundingClientRect();
          return {
            action: "point",
            height: null,
            x,
            y: box.top,
            yaw: gazeYaw(cell.left + cell.width / 2, x, box.width),
          };
        }
        return {
          action: isTyping.current ? "type" : "idle",
          height: null,
          x,
          y: box.top,
          yaw: restYaw,
        };
      },
    });
  }, [figure, isOnStage]);

  return (cell: HTMLElement | null) => {
    if (gaze.current !== cell) {
      gaze.current = cell;
      requestSceneFrame();
    }
  };
};
