import type { FigureStation } from "@/components/iso/figure-stations";

import type { ScreenRect } from "./companion-placement";
import { requestSceneFrame } from "./view-registry";

export interface TrackedStation {
  console: ScreenRect;
  figure: ScreenRect;
  station: FigureStation;
}

let tracked: readonly TrackedStation[] = [];
let focusLine: string | null = null;
const hovered = new Set<string>();
const focused = new Set<string>();

const toDocument = (rect: DOMRect): ScreenRect => ({
  bottom: rect.bottom + window.scrollY,
  left: rect.left + window.scrollX,
  right: rect.right + window.scrollX,
  top: rect.top + window.scrollY,
});

export const toScreen = (rect: ScreenRect): ScreenRect => ({
  bottom: rect.bottom - window.scrollY,
  left: rect.left - window.scrollX,
  right: rect.right - window.scrollX,
  top: rect.top - window.scrollY,
});

export const getTrackedStations = () => tracked;

export const getFocusLine = () => focusLine;

export const isStationEngaged = (id: string) =>
  hovered.has(id) || focused.has(id);

export const setFocusLine = (line: string | null) => {
  focusLine = line;
  requestSceneFrame();
};

export const measureStations = (stations: readonly FigureStation[]) => {
  tracked = stations.map((station) => ({
    console: toDocument(station.console.getBoundingClientRect()),
    figure: toDocument(station.figure.getBoundingClientRect()),
    station,
  }));
  requestSceneFrame();
};

export const forgetStations = () => {
  tracked = [];
};

const mark = (set: Set<string>, id: string, isOn: boolean) => {
  if (isOn) {
    set.add(id);
  } else {
    set.delete(id);
  }
  requestSceneFrame();
};

export const watchEngagement = ({ figure, id }: FigureStation) => {
  const hover = () => mark(hovered, id, true);
  const unhover = () => mark(hovered, id, false);
  const focus = (event: FocusEvent) =>
    mark(
      focused,
      id,
      event.target instanceof Element && event.target.matches(":focus-visible")
    );
  const blur = (event: FocusEvent) => {
    const next = event.relatedTarget;
    mark(focused, id, next instanceof Node && figure.contains(next));
  };
  figure.addEventListener("pointerenter", hover);
  figure.addEventListener("pointerleave", unhover);
  figure.addEventListener("focusin", focus);
  figure.addEventListener("focusout", blur);
  return () => {
    figure.removeEventListener("pointerenter", hover);
    figure.removeEventListener("pointerleave", unhover);
    figure.removeEventListener("focusin", focus);
    figure.removeEventListener("focusout", blur);
    hovered.delete(id);
    focused.delete(id);
  };
};
