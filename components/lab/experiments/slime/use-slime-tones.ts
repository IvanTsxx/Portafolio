"use client";

import { useSyncExternalStore } from "react";

import { slimeDefaults } from "@/registry/ivan/components/slime/slime-material";

export interface SlimeTones {
  glow: string;
  ink: string;
  night: boolean;
  paper: string;
}

const separator = "|";
const slimeGreen = { day: "#4fae2c", night: "#7ddc3c" } as const;
const defaultKey = [
  slimeDefaults.ink,
  slimeDefaults.paper,
  slimeDefaults.glow,
  "night",
].join(separator);

const subscribe = (onChange: () => void) => {
  const observer = new MutationObserver(onChange);
  observer.observe(document.documentElement, {
    attributeFilter: ["class", "style", "data-theme"],
    attributes: true,
  });
  return () => observer.disconnect();
};

const getSnapshot = () => {
  const styles = getComputedStyle(document.documentElement);
  const background = styles.getPropertyValue("--background").trim();
  const foreground = styles.getPropertyValue("--foreground").trim();
  if (!(background && foreground)) {
    return defaultKey;
  }
  const isNight = document.documentElement.classList.contains("dark");
  const [ink, paper] = isNight
    ? [background, foreground]
    : [foreground, background];
  return [
    ink,
    paper,
    isNight ? slimeGreen.night : slimeGreen.day,
    isNight ? "night" : "day",
  ].join(separator);
};

const getServerSnapshot = () => defaultKey;

export const useSlimeTones = (): SlimeTones => {
  const key = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  const [
    ink = slimeDefaults.ink,
    paper = slimeDefaults.paper,
    glow = slimeDefaults.glow,
    mode,
  ] = key.split(separator);
  return { glow, ink, night: mode === "night", paper };
};
