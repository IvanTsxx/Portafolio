"use client";

import type { RefObject } from "react";
import {
  useEffect,
  useEffectEvent,
  useLayoutEffect,
  useSyncExternalStore,
} from "react";

export interface FigureControl {
  id: string;
  label: string;
}

export interface FigureFocus {
  line: string;
  stationId: string;
}

export interface FigureStation {
  console: Element;
  controls: readonly FigureControl[];
  figure: HTMLElement;
  id: string;
  operate: (controlId: string) => void;
  title: string;
}

type Listener = () => void;

const stations = new Map<string, FigureStation>();
const listeners = new Set<Listener>();
let stationSnapshot: readonly FigureStation[] = [];
let focus: FigureFocus | null = null;

const notify = () => {
  for (const listener of listeners) {
    listener();
  }
};

const subscribe = (listener: Listener) => {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
};

export const registerFigureStation = (station: FigureStation) => {
  stations.set(station.id, station);
  stationSnapshot = [...stations.values()];
  notify();
  return () => {
    if (stations.get(station.id) !== station) {
      return;
    }
    stations.delete(station.id);
    stationSnapshot = [...stations.values()];
    if (focus?.stationId === station.id) {
      focus = null;
    }
    notify();
  };
};

export const setFigureFocus = (stationId: string, line: string | null) => {
  const next = line === null ? null : { line, stationId };
  if (next === null && focus?.stationId !== stationId) {
    return;
  }
  if (focus?.line === next?.line && focus?.stationId === next?.stationId) {
    return;
  }
  focus = next;
  notify();
};

const getStations = () => stationSnapshot;
const getServerStations = (): readonly FigureStation[] => [];
const getFocus = () => focus;
const getServerFocus = () => null;

export const useFigureStations = () =>
  useSyncExternalStore(subscribe, getStations, getServerStations);

export const useFigureFocus = () =>
  useSyncExternalStore(subscribe, getFocus, getServerFocus);

export const useFigureStation = ({
  consoleRef,
  controls,
  figureRef,
  id,
  onOperate,
  title,
}: {
  consoleRef: RefObject<Element | null>;
  controls: readonly FigureControl[];
  figureRef: RefObject<HTMLElement | null>;
  id: string;
  onOperate: (controlId: string) => void;
  title: string;
}) => {
  const operate = useEffectEvent(onOperate);

  useLayoutEffect(() => {
    const consoleElement = consoleRef.current;
    const figure = figureRef.current;
    if (!(consoleElement && figure)) {
      return;
    }
    return registerFigureStation({
      console: consoleElement,
      controls,
      figure,
      id,
      operate: (controlId) => operate(controlId),
      title,
    });
  }, [consoleRef, controls, figureRef, id, title]);

  useEffect(() => () => setFigureFocus(id, null), [id]);
};
