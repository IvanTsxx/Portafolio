"use client";

import { useFrame, useThree } from "@react-three/fiber";
import { useLayoutEffect, useRef } from "react";
import { MathUtils, Vector3 } from "three";

export interface CameraRigProps {
  base: [number, number, number];
  target: [number, number, number];
  pointerSway?: number;
  trackX?: { current: number };
}

export const CameraRig = ({
  base,
  target,
  pointerSway = 0,
  trackX,
}: CameraRigProps) => {
  const getState = useThree((state) => state.get);
  const lookTarget = useRef<Vector3 | null>(null);

  useLayoutEffect(() => {
    const { camera, invalidate } = getState();
    camera.position.set(...base);
    lookTarget.current = new Vector3(...target);
    camera.lookAt(lookTarget.current);
    invalidate();
  }, [base, getState, target]);

  useFrame((state, delta) => {
    const { camera } = state;
    const look = lookTarget.current;
    if (!look) {
      return;
    }
    const offsetX = trackX?.current ?? 0;
    const desiredX = base[0] + offsetX + state.pointer.x * pointerSway;
    const desiredY = base[1] + state.pointer.y * pointerSway * 0.4;
    camera.position.x = MathUtils.damp(camera.position.x, desiredX, 4, delta);
    camera.position.y = MathUtils.damp(camera.position.y, desiredY, 4, delta);
    look.x = MathUtils.damp(look.x, target[0] + offsetX, 4, delta);
    camera.lookAt(look);
  });

  return null;
};
