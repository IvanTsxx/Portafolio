import {
  activeSectionIndex,
  sectionLandingOffset,
  sectionStops,
} from "./companion-rail-math";
import { requestSceneFrame } from "./view-registry";

export interface SpokenSection {
  element: HTMLElement;
  id: string;
  lines: readonly string[];
}

type Listener = () => void;

const userScrollEvents = ["wheel", "touchstart", "keydown"] as const;

const registered = new Set<SpokenSection>();
const listeners = new Set<Listener>();
let ordered: readonly SpokenSection[] = [];
let stops: readonly number[] = [];
let pinnedId: string | null = null;
let frame = 0;
let resizeObserver: ResizeObserver | null = null;

const notify = () => {
  for (const listener of listeners) {
    listener();
  }
  requestSceneFrame();
};

const measure = () => {
  frame = 0;
  const { scrollY } = window;
  const maxScroll = Math.max(
    0,
    document.documentElement.scrollHeight - window.innerHeight
  );
  const placed = [...registered]
    .map((section) => ({
      section,
      top: section.element.getBoundingClientRect().top + scrollY,
    }))
    .toSorted((first, second) => first.top - second.top);
  ordered = placed.map(({ section }) => section);
  stops = sectionStops(
    placed.map(({ top }) => top),
    sectionLandingOffset,
    maxScroll
  );
  notify();
};

const scheduleMeasure = () => {
  if (frame === 0) {
    frame = requestAnimationFrame(measure);
  }
};

const releasePin = () => {
  if (pinnedId === null) {
    return;
  }
  pinnedId = null;
  notify();
};

const listen = () => {
  resizeObserver = new ResizeObserver(scheduleMeasure);
  resizeObserver.observe(document.documentElement);
  window.addEventListener("scrollend", scheduleMeasure);
  for (const type of userScrollEvents) {
    window.addEventListener(type, releasePin, { passive: true });
  }
};

const unlisten = () => {
  cancelAnimationFrame(frame);
  frame = 0;
  resizeObserver?.disconnect();
  resizeObserver = null;
  window.removeEventListener("scrollend", scheduleMeasure);
  for (const type of userScrollEvents) {
    window.removeEventListener(type, releasePin);
  }
  ordered = [];
  stops = [];
  pinnedId = null;
};

export const registerSpokenSection = (section: SpokenSection) => {
  registered.add(section);
  if (registered.size === 1) {
    listen();
  }
  scheduleMeasure();
  return () => {
    registered.delete(section);
    if (registered.size === 0) {
      unlisten();
      notify();
      return;
    }
    scheduleMeasure();
  };
};

export const activeSpokenSection = (
  scrollY: number,
  viewportHeight: number
): SpokenSection | null => {
  const pinned =
    pinnedId === null
      ? undefined
      : ordered.find((section) => section.id === pinnedId);
  return (
    pinned ??
    ordered[activeSectionIndex(scrollY, viewportHeight, stops)] ??
    null
  );
};

export const pinActiveSection = (id: string) => {
  pinnedId = id;
  notify();
};

export const subscribeActiveSection = (listener: Listener) => {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
};
