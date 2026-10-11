"use client";

import { useEffect, useState } from "react";
import type { FocusEvent } from "react";

import { ShelfSlot } from "@/components/scene/shelf-slot";
import { useWebGLSupport } from "@/components/scene/webgl-support";
import { useReducedMotion } from "@/hooks/use-reduced-motion";
import { cn } from "@/lib/utils";

import { RepoCard, ToneSwatch } from "./repo-card";
import type { BookTone, ShelfBook } from "./shelf-model";

const cardId = "repo-shelf-card";

const legendOf = (books: readonly ShelfBook[]) => {
  const tones = new Map<string, BookTone>();
  for (const entry of books) {
    tones.set(entry.language ?? "Unknown", entry.tone);
  }
  return [...tones];
};

export const ShelfStage = ({ books }: { books: readonly ShelfBook[] }) => {
  const hasWebGL = useWebGLSupport();
  const isReduced = useReducedMotion();
  const [hoverId, setHoverId] = useState<string | null>(null);
  const [pinnedId, setPinnedId] = useState<string | null>(null);
  const activeId = hoverId ?? pinnedId;
  const active = books.find((entry) => entry.id === activeId);
  const isPinnedShown = active !== undefined && active.id === pinnedId;
  const togglePinned = (id: string) =>
    setPinnedId((current) => (current === id ? null : id));

  useEffect(() => {
    if (!pinnedId) {
      return;
    }
    const dismiss = (event: globalThis.KeyboardEvent) => {
      if (event.key === "Escape") {
        setPinnedId(null);
      }
    };
    window.addEventListener("keydown", dismiss);
    return () => window.removeEventListener("keydown", dismiss);
  }, [pinnedId]);

  return (
    <div className="flex flex-col gap-3">
      {hasWebGL ? (
        <div className="hidden flex-col gap-3 lg:flex">
          <ShelfSlot
            activeId={activeId}
            books={books}
            className="border-rule h-[min(26rem,60svh)] border"
            enabled={hasWebGL}
            isReduced={isReduced}
            label="Pinned repositories standing on a shelf, one spine per repository"
            onHover={setHoverId}
            onSelect={togglePinned}
          >
            <div
              aria-live="polite"
              className={cn(
                "absolute top-3 right-3 w-72",
                isPinnedShown ? "pointer-events-auto" : "pointer-events-none"
              )}
              id={cardId}
            >
              {active ? (
                <RepoCard
                  book={active}
                  className="motion-safe:animate-in motion-safe:fade-in motion-safe:slide-in-from-bottom-1"
                  key={active.id}
                  onClose={isPinnedShown ? () => setPinnedId(null) : undefined}
                />
              ) : null}
            </div>
          </ShelfSlot>
          <div className="flex items-start gap-3">
            <ol
              aria-label="Pinned repositories"
              className="m-0 flex list-none flex-wrap gap-1 p-0"
            >
              {books.map((entry) => {
                const isActive = entry.id === activeId;
                return (
                  <li key={entry.id}>
                    <button
                      aria-controls={cardId}
                      aria-pressed={entry.id === pinnedId}
                      className={cn(
                        "label border-rule-strong text-graphite hover:border-ink hover:text-ink flex items-center gap-1.5 border px-2 py-1 transition-colors duration-100",
                        isActive &&
                          "border-ink bg-ink text-paper hover:text-paper"
                      )}
                      onBlur={() => setHoverId(null)}
                      onClick={() => togglePinned(entry.id)}
                      onFocus={(event: FocusEvent<HTMLButtonElement>) => {
                        if (event.currentTarget.matches(":focus-visible")) {
                          setHoverId(entry.id);
                        }
                      }}
                      onPointerEnter={() => setHoverId(entry.id)}
                      onPointerLeave={() => setHoverId(null)}
                      type="button"
                    >
                      <ToneSwatch tone={entry.tone} />
                      <span className="whitespace-nowrap">{entry.name}</span>
                    </button>
                  </li>
                );
              })}
            </ol>
            <ul
              aria-label="Spine colors"
              className="label text-graphite m-0 ml-auto flex shrink-0 list-none items-center gap-3 p-0"
            >
              {legendOf(books).map(([language, tone]) => (
                <li className="flex items-center gap-2" key={language}>
                  <ToneSwatch tone={tone} />
                  {language}
                </li>
              ))}
            </ul>
          </div>
        </div>
      ) : null}
      <ol
        aria-label="Pinned repositories"
        className={cn(
          "m-0 flex snap-x snap-mandatory [scrollbar-width:none] list-none gap-2 overflow-x-auto p-0 pb-1",
          hasWebGL && "lg:hidden"
        )}
      >
        {books.map((entry) => (
          <li className="w-64 shrink-0 snap-start" key={entry.id}>
            <RepoCard book={entry} className="h-full" />
          </li>
        ))}
      </ol>
    </div>
  );
};
