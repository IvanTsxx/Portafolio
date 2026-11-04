"use client";

import dynamic from "next/dynamic";
import { useState } from "react";

import { useWebGLSupport } from "@/registry/ivan/hooks/use-webgl-support";

import { useNearViewSlots } from "./view-registry";

const SharedCanvas = dynamic(() => import("./shared-canvas"), { ssr: false });

export const SceneLayer = () => {
  const nearSlots = useNearViewSlots();
  const hasWebGL = useWebGLSupport();
  const [isActivated, setIsActivated] = useState(false);

  if (nearSlots.length > 0 && hasWebGL && !isActivated) {
    setIsActivated(true);
  }

  return isActivated ? <SharedCanvas /> : null;
};
