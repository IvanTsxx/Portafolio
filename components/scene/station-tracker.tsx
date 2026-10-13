"use client";

import { useEffect, useState } from "react";

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
  const [visibleIds, setVisibleIds] = useState<ReadonlySet<string>>(
    () => new Set()
  );

  useEffect(() => {
    const isVisible = focus ? visibleIds.has(focus.stationId) : false;
    setFocusLine(isVisible && focus ? focus.line : null);
  }, [focus, visibleIds]);

  useEffect(() => {
    const idOf = new Map<Element, string>(
      stations.map((station) => [station.figure, station.id])
    );
    const observer = new IntersectionObserver((entries) => {
      setVisibleIds((previous) => {
        const next = new Set(previous);
        for (const entry of entries) {
          const id = idOf.get(entry.target);
          if (!id) {
            continue;
          }
          if (entry.isIntersecting) {
            next.add(id);
          } else {
            next.delete(id);
          }
        }
        return next;
      });
    });
    for (const station of stations) {
      observer.observe(station.figure);
    }
    return () => {
      observer.disconnect();
      setVisibleIds(new Set());
    };
  }, [stations]);

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
