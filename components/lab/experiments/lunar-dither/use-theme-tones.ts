"use client";

import { useSyncExternalStore } from "react";
import { Color } from "three";

import { lunarDitherDefaults } from "@/registry/ivan/components/lunar-dither/lunar-dither-material";

export interface ThemeTones {
  ink: string;
  paper: string;
}

const hexColor = /^#[0-9a-f]{3,8}$/iu;
const separator = "|";
const defaultKey = `${lunarDitherDefaults.ink}${separator}${lunarDitherDefaults.paper}`;

const luminance = (value: string) => {
  const { r, g, b } = new Color(value);
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
};

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
  if (!(hexColor.test(background) && hexColor.test(foreground))) {
    return defaultKey;
  }
  const [ink, paper] =
    luminance(background) <= luminance(foreground)
      ? [background, foreground]
      : [foreground, background];
  return `${ink}${separator}${paper}`;
};

const getServerSnapshot = () => defaultKey;

export const useThemeTones = (): ThemeTones => {
  const key = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  const [ink = lunarDitherDefaults.ink, paper = lunarDitherDefaults.paper] =
    key.split(separator);
  return { ink, paper };
};

const getForegroundSnapshot = () => {
  const styles = getComputedStyle(document.documentElement);
  const background = styles.getPropertyValue("--background").trim();
  const foreground = styles.getPropertyValue("--foreground").trim();
  return hexColor.test(background) && hexColor.test(foreground)
    ? `${background}${separator}${foreground}`
    : defaultKey;
};

export const useForegroundLitTones = (): ThemeTones => {
  const key = useSyncExternalStore(
    subscribe,
    getForegroundSnapshot,
    getServerSnapshot
  );
  const [ink = lunarDitherDefaults.ink, paper = lunarDitherDefaults.paper] =
    key.split(separator);
  return { ink, paper };
};
