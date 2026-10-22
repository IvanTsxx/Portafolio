"use client";

import { useCallback, useRef } from "react";
import type { Vector4 } from "three";

export interface StageReveal {
  split: number;
  handleWidth: number;
  handleHeight: number;
}

export const revealChunk = `
  uniform vec4 uReveal;

  void revealBefore() {
    vec2 pixel = gl_FragCoord.xy - uOrigin;
    if (pixel.x < uReveal.x) {
      discard;
    }
    vec2 fromHandle = abs(pixel - vec2(uReveal.x, uResolution.y * 0.5));
    if (fromHandle.x < uReveal.z && fromHandle.y < uReveal.w) {
      discard;
    }
  }
`;

const hiddenReveal: StageReveal = { handleHeight: 0, handleWidth: 0, split: 0 };

export const useStageReveal = () => {
  const reveal = useRef<StageReveal>(hiddenReveal);
  const onReveal = useCallback((next: StageReveal) => {
    reveal.current = next;
  }, []);
  return { onReveal, reveal };
};

export const syncReveal = (
  target: Vector4,
  reveal: StageReveal,
  stageWidth: number,
  pixelRatio: number
) => {
  target.set(
    reveal.split * stageWidth,
    0,
    (reveal.handleWidth / 2) * pixelRatio,
    (reveal.handleHeight / 2) * pixelRatio
  );
};
