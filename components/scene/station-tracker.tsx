"use client";

import { useEffect } from "react";

import {
  useFigureFocus,
  useFigureStations,
} from "@/components/iso/figure-stations";

import {
  forgetStations,
  measureStations,
  setFocusLine,
  watchEngagement,
} from "./station-tracking";

export const StationTracker = () => {
  const stations = useFigureStations();
  const focus = useFigureFocus();

  useEffect(() => {
    setFocusLine(focus?.line ?? null);
  }, [focus]);

  useEffect(() => {
    const measure = () => measureStations(stations);
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(document.documentElement);
    for (const station of stations) {
      observer.observe(station.figure);
    }
    window.addEventListener("resize", measure);
    window.addEventListener("scrollend", measure);
    const stopWatching = stations.map((station) => watchEngagement(station));
    return () => {
      observer.disconnect();
      window.removeEventListener("resize", measure);
      window.removeEventListener("scrollend", measure);
      for (const stop of stopWatching) {
        stop();
      }
      forgetStations();
    };
  }, [stations]);

  return null;
};
