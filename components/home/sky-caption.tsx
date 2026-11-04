"use client";

import { LocalTime } from "@/components/home/local-time";
import { LocalWeather } from "@/components/home/local-weather";

export const SkyCaption = () => (
  <dl className="label text-faint flex flex-col gap-2">
    <div className="flex items-center justify-between gap-4">
      <dt>Tucumán</dt>
      <dd className="text-foreground">
        <LocalTime />
      </dd>
    </div>
    <div className="flex items-center justify-between gap-4">
      <dt>Weather</dt>
      <dd className="text-foreground">
        <LocalWeather />
      </dd>
    </div>
  </dl>
);
