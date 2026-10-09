"use client";

import { useThree } from "@react-three/fiber";
import { useEffect } from "react";

export const SceneReady = ({ onReady }: { onReady: () => void }) => {
  const invalidate = useThree((state) => state.invalidate);
  useEffect(() => {
    invalidate();
    const frame = requestAnimationFrame(onReady);
    return () => cancelAnimationFrame(frame);
  }, [invalidate, onReady]);
  return null;
};
