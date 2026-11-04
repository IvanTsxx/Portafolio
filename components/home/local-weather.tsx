"use client";

import {
  CloudFogIcon,
  CloudIcon,
  CloudLightningIcon,
  CloudMoonIcon,
  CloudRainIcon,
  CloudSnowIcon,
  CloudSunIcon,
  MoonIcon,
  SunIcon,
} from "@phosphor-icons/react";
import { useSyncExternalStore } from "react";
import type { ReactNode } from "react";
import { z } from "zod";

const forecastUrl =
  "https://api.open-meteo.com/v1/forecast?latitude=-26.8083&longitude=-65.2176&current=temperature_2m,weather_code,is_day&timezone=America%2FArgentina%2FTucuman";
const refreshMs = 15 * 60_000;

const forecastSchema = z.object({
  current: z.object({
    is_day: z.number(),
    temperature_2m: z.number(),
    weather_code: z.number(),
  }),
});

type Sky = "clear" | "cloudy" | "fog" | "partly" | "rain" | "snow" | "storm";

interface Weather {
  isDay: boolean;
  sky: Sky;
  temperature: number;
}

const skyOf = (code: number): Sky => {
  if (code === 0) {
    return "clear";
  }
  if (code <= 2) {
    return "partly";
  }
  if (code === 3) {
    return "cloudy";
  }
  if (code <= 48) {
    return "fog";
  }
  if (code >= 95) {
    return "storm";
  }
  if ((code >= 71 && code <= 77) || code === 85 || code === 86) {
    return "snow";
  }
  return "rain";
};

const skyLabels = {
  clear: "Clear",
  cloudy: "Cloudy",
  fog: "Fog",
  partly: "Partly cloudy",
  rain: "Rain",
  snow: "Snow",
  storm: "Storm",
} as const satisfies Record<Sky, string>;

const glyphClassName = "size-4";

const skyGlyph = ({ isDay, sky }: Weather): ReactNode => {
  const glyphs = {
    clear: isDay ? (
      <SunIcon aria-hidden className={glyphClassName} />
    ) : (
      <MoonIcon aria-hidden className={glyphClassName} />
    ),
    cloudy: <CloudIcon aria-hidden className={glyphClassName} />,
    fog: <CloudFogIcon aria-hidden className={glyphClassName} />,
    partly: isDay ? (
      <CloudSunIcon aria-hidden className={glyphClassName} />
    ) : (
      <CloudMoonIcon aria-hidden className={glyphClassName} />
    ),
    rain: <CloudRainIcon aria-hidden className={glyphClassName} />,
    snow: <CloudSnowIcon aria-hidden className={glyphClassName} />,
    storm: <CloudLightningIcon aria-hidden className={glyphClassName} />,
  } as const satisfies Record<Sky, ReactNode>;
  return glyphs[sky];
};

const fetchWeather = async (): Promise<Weather | null> => {
  try {
    const response = await fetch(forecastUrl);
    if (!response.ok) {
      return null;
    }
    const parsed = forecastSchema.safeParse(await response.json());
    if (!parsed.success) {
      return null;
    }
    const { current } = parsed.data;
    return {
      isDay: current.is_day === 1,
      sky: skyOf(current.weather_code),
      temperature: Math.round(current.temperature_2m),
    };
  } catch {
    return null;
  }
};

let latest: Weather | null = null;
let timer = 0;
const listeners = new Set<() => void>();

const refresh = async () => {
  latest = await fetchWeather();
  for (const listener of listeners) {
    listener();
  }
};

const subscribe = (listener: () => void) => {
  listeners.add(listener);
  if (listeners.size === 1) {
    void refresh();
    timer = window.setInterval(refresh, refreshMs);
  }
  return () => {
    listeners.delete(listener);
    if (listeners.size === 0) {
      window.clearInterval(timer);
    }
  };
};

const getSnapshot = () => latest;
const getServerSnapshot = () => null;

export const LocalWeather = () => {
  const weather = useSyncExternalStore(
    subscribe,
    getSnapshot,
    getServerSnapshot
  );
  if (!weather) {
    return <span>--°</span>;
  }
  return (
    <span className="flex items-center gap-2">
      <span>
        {skyLabels[weather.sky]} ·{" "}
        <span className="tabular-nums">{weather.temperature}°C</span>
      </span>
      {skyGlyph(weather)}
    </span>
  );
};
