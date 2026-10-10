"use client";

import dynamic from "next/dynamic";
import { useState } from "react";

import { useHasViewSlots } from "./view-registry";
import { useWebGLSupport } from "./webgl-support";

const SharedCanvas = dynamic(() => import("./shared-canvas"), { ssr: false });

export const SceneLayer = () => {
  const hasSlots = useHasViewSlots();
  const hasWebGL = useWebGLSupport();
  const [isActivated, setIsActivated] = useState(false);

  if (hasSlots && hasWebGL && !isActivated) {
    setIsActivated(true);
  }

  return isActivated ? <SharedCanvas /> : null;
};
