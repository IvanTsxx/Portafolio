"use client";

import { useEffect, useSyncExternalStore } from "react";

import { focusRingClassName } from "@/components/site/styles";
import { cn } from "@/lib/utils";

const detailLevels = [
  { id: "plain", label: "Plain" },
  { id: "guides", label: "Guides" },
  { id: "measure", label: "Measure" },
] as const;

type DetailLevel = (typeof detailLevels)[number]["id"];

const storageKey = "detail-level";
const defaultLevel: DetailLevel = "guides";

const isDetailLevel = (value: string | null): value is DetailLevel =>
  detailLevels.some((level) => level.id === value);

const readStoredLevel = () => {
  try {
    const stored = window.localStorage.getItem(storageKey);
    return isDetailLevel(stored) ? stored : defaultLevel;
  } catch {
    return defaultLevel;
  }
};

const applyLevel = (level: DetailLevel) => {
  document.documentElement.dataset.detail = level;
  try {
    window.localStorage.setItem(storageKey, level);
  } catch {
    document.documentElement.dataset.detailPersist = "off";
  }
};

const detailListeners = new Set<() => void>();

const subscribeToDetail = (listener: () => void) => {
  detailListeners.add(listener);
  return () => {
    detailListeners.delete(listener);
  };
};

const readDetail = (): DetailLevel => {
  const value = document.documentElement.dataset.detail ?? null;
  return isDetailLevel(value) ? value : defaultLevel;
};

const readServerDetail = () => defaultLevel;

const setDetail = (level: DetailLevel) => {
  applyLevel(level);
  for (const listener of detailListeners) {
    listener();
  }
};

const isTypingTarget = (target: EventTarget | null) =>
  target instanceof HTMLElement &&
  (target.isContentEditable ||
    ["INPUT", "SELECT", "TEXTAREA"].includes(target.tagName));

const LevelIcon = ({ level }: { level: DetailLevel }) => (
  <svg aria-hidden className="size-3.5" fill="none" viewBox="0 0 14 14">
    <rect height="13" stroke="currentColor" width="13" x="0.5" y="0.5" />
    {level === "plain" ? null : (
      <path d="M4.5 1v12M9.5 1v12" stroke="currentColor" />
    )}
    {level === "measure" ? (
      <path d="M2.5 4h2M2.5 7h2M2.5 10h2" stroke="currentColor" />
    ) : null}
  </svg>
);

export const DetailControl = () => {
  const level = useSyncExternalStore(
    subscribeToDetail,
    readDetail,
    readServerDetail
  );

  useEffect(() => {
    setDetail(readStoredLevel());
  }, []);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (
        event.key.toLowerCase() !== "d" ||
        event.metaKey ||
        event.ctrlKey ||
        event.altKey ||
        isTypingTarget(event.target)
      ) {
        return;
      }
      const position = detailLevels.findIndex(
        (entry) => entry.id === readDetail()
      );
      setDetail(
        detailLevels[(position + 1) % detailLevels.length]?.id ?? defaultLevel
      );
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <fieldset className="flex items-center border-0 p-0">
      <legend className="sr-only">Drawing detail, press D to cycle</legend>
      <span className="flex items-center gap-0.5">
        {detailLevels.map((entry) => (
          <button
            aria-label={`${entry.label} detail`}
            title={`${entry.label} · D`}
            aria-pressed={entry.id === level}
            className={cn(
              "text-faint hover:text-foreground aria-pressed:text-signal grid size-7 place-items-center transition-colors duration-200",
              focusRingClassName
            )}
            key={entry.id}
            onClick={() => setDetail(entry.id)}
            type="button"
          >
            <LevelIcon level={entry.id} />
          </button>
        ))}
      </span>
    </fieldset>
  );
};
