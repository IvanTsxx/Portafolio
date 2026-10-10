"use client";

import { useSyncExternalStore } from "react";

let cachedSupport: boolean | null = null;

const detectWebGL = () => {
  if (cachedSupport !== null) {
    return cachedSupport;
  }
  try {
    const probe = document.createElement("canvas");
    const context = probe.getContext("webgl2") ?? probe.getContext("webgl");
    context?.getExtension("WEBGL_lose_context")?.loseContext();
    cachedSupport = context !== null;
  } catch {
    cachedSupport = false;
  }
  return cachedSupport;
};

const subscribe = (onChange: () => void) => {
  window.addEventListener("pageshow", onChange);
  return () => window.removeEventListener("pageshow", onChange);
};
const getServerSnapshot = () => true;

export const useWebGLSupport = () =>
  useSyncExternalStore(subscribe, detectWebGL, getServerSnapshot);
