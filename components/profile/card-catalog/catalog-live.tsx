"use client";

import { useEffect, useEffectEvent, useId, useRef, useState } from "react";
import type { KeyboardEvent, MouseEvent, PointerEvent, ReactNode } from "react";

import {
  setFigureFocus,
  useFigureStation,
} from "@/components/iso/figure-stations";
import { CornerMarks } from "@/components/site/corner-marks";

import type { Catalog, CatalogCard } from "./catalog";
import {
  cardDetail,
  catalogTitle,
  focusLine,
  languageText,
  spokenCard,
} from "./catalog";
import type { CatalogParts } from "./catalog-art";
import { CATALOG_HEIGHT, CATALOG_WIDTH } from "./catalog-geometry";
import type { CatalogRig, CounterArt } from "./catalog-geometry";
import type { Read } from "./catalog-motion";
import { useCatalogMotion } from "./use-catalog-motion";
import type { CatalogNodes } from "./use-catalog-motion";

const STATION_ID = "pinned";
const TOUR_FIRST_MS = 1400;
const TOUR_EVERY_MS = 3200;
const TOUR_READ_EVERY = 3;
const TOUR_READ_AFTER_MS = 900;
const QUIET_MS = 3600;
const KEY_TRAVEL = 1.6;

const controls = [
  { id: "next", label: "Lift the next card" },
  { id: "previous", label: "Lift the previous card" },
  { id: "read", label: "Feed the lifted card to the reader" },
] as const;

const isPlainClick = (event: MouseEvent) =>
  event.button === 0 &&
  !(event.metaKey || event.ctrlKey || event.shiftKey || event.altKey);

const stamp = (clock: { current: number }) => {
  clock.current = performance.now();
};

const slotAfterKey = (key: string, slot: number, count: number) => {
  switch (key) {
    case "ArrowDown":
    case "ArrowRight": {
      return Math.min(count - 1, slot + 1);
    }
    case "ArrowLeft":
    case "ArrowUp": {
      return Math.max(0, slot - 1);
    }
    case "End": {
      return count - 1;
    }
    case "Home": {
      return 0;
    }
    default: {
      return null;
    }
  }
};

const counterText = (card: CatalogCard | undefined) =>
  card ? String(Math.min(99, card.stars)).padStart(2, "0") : "--";

const Readout = ({
  card,
  catalog,
}: {
  card: CatalogCard | undefined;
  catalog: Catalog;
}) => (
  <span className="ml-auto flex flex-col items-end text-right" data-readout>
    <span className="text-ink text-sm leading-tight font-medium tracking-tight wrap-anywhere">
      {card ? card.name : catalogTitle(catalog)}
    </span>
    <span className="label text-graphite tabular-nums">
      {card ? cardDetail(card) : languageText(catalog)}
    </span>
  </span>
);

const CatalogCardFrame = ({
  card,
  catalog,
  children,
}: {
  card: CatalogCard | undefined;
  catalog: Catalog;
  children: ReactNode;
}) => (
  <div className="border-rule-strong bg-paper relative flex flex-col border">
    <CornerMarks />
    <div className="label text-graphite flex items-start justify-between gap-4 px-4 pt-3">
      <span className="tabular-nums">Fig 04</span>
      <span className="text-ink">Card catalog</span>
    </div>
    {children}
    <div className="flex flex-wrap items-end justify-between gap-x-4 gap-y-1 px-4">
      <span className="label text-mist">
        <span className="pointer-coarse:hidden">
          Hover a card, click to read it
        </span>
        <span className="hidden pointer-coarse:inline">
          Tap a card to read it
        </span>
      </span>
      <Readout card={card} catalog={catalog} />
    </div>
    <p className="text-graphite m-0 min-h-10 px-4 pt-1 pb-3 text-right text-sm leading-snug text-pretty">
      {card?.description ?? ""}
    </p>
  </div>
);

const Counter = ({ art, text }: { art: CounterArt; text: string }) => (
  <g transform={`translate(${art.origin[0]} ${art.origin[1]})`}>
    <g transform={art.matrix}>
      {[...text].map((digit, index) => {
        const at = art.digits[index];
        return at ? (
          <text
            className="fill-ink font-mono"
            fontSize={7.4}
            key={index}
            textAnchor="middle"
            x={at[0]}
            y={at[1]}
          >
            {digit}
          </text>
        ) : null;
      })}
    </g>
  </g>
);

export interface CatalogLiveProps {
  caption: string;
  catalog: Catalog;
  counter: CounterArt;
  label: string;
  parts: CatalogParts;
  rig: CatalogRig;
}

export const CatalogLive = ({
  caption,
  catalog,
  counter,
  label,
  parts,
  rig,
}: CatalogLiveProps) => {
  const count = catalog.cards.length;
  const clipId = useId();
  const root = useRef<HTMLElement>(null);
  const key = useRef<SVGGElement>(null);
  const nodes = useRef<CatalogNodes>({ cards: [], overlay: null });
  const lastTouch = useRef(Number.NEGATIVE_INFINITY);
  const [hovered, setHovered] = useState<number | null>(null);
  const [toured, setToured] = useState<number | null>(null);
  const [isEngaged, setIsEngaged] = useState(false);
  const [readingSlot, setReadingSlot] = useState<number | null>(null);
  const [seatedSlot, setSeatedSlot] = useState<number | null>(null);
  const [spoken, setSpoken] = useState("");
  const shown = hovered ?? toured;
  const lifted = readingSlot ?? shown;

  const motion = useCatalogMotion({
    nodes,
    onDone: () => {
      setSeatedSlot(null);
      setReadingSlot(null);
    },
    onSeated: (read: Read) => {
      setSeatedSlot(read.slot);
      const card = catalog.cards[read.slot];
      if (read.opens && card) {
        window.open(card.url, "_blank", "noopener,noreferrer");
      }
    },
    rig,
    root,
    shown: lifted,
  });

  const touch = () => stamp(lastTouch);

  const feed = (slot: number, opens: boolean) => {
    const card = catalog.cards[slot];
    if (!(card && motion.read(slot, opens))) {
      return false;
    }
    setReadingSlot(slot);
    setSpoken(
      opens
        ? `Reading ${card.name}, opening it on GitHub.`
        : `Reading ${card.name}. ${cardDetail(card)}.`
    );
    return true;
  };

  const step = (by: number) => {
    setHovered(null);
    setToured(
      (current) => ((current ?? (by > 0 ? -1 : 0)) + by + count) % count
    );
  };

  useFigureStation({
    consoleRef: key,
    controls,
    figureRef: root,
    id: STATION_ID,
    onOperate: (controlId) => {
      touch();
      if (controlId === "next") {
        step(1);
      } else if (controlId === "previous") {
        step(-1);
      } else if (controlId === "read") {
        feed(shown ?? 0, false);
      }
    },
    title: "Card catalog",
  });

  const isTouring = motion.isVisible && !motion.isReduced && !isEngaged;
  const isBusy = useEffectEvent(
    () => root.current?.dataset.assembled === undefined || motion.isReading()
  );
  const tourStep = useEffectEvent((slot: number, reads: boolean) => {
    setToured(slot);
    return reads
      ? window.setTimeout(() => feed(slot, false), TOUR_READ_AFTER_MS)
      : 0;
  });

  useEffect(() => {
    if (!isTouring || count === 0) {
      return;
    }
    let timer = 0;
    let readTimer = 0;
    let steps = 0;
    const later = (delay: number) => {
      timer = window.setTimeout(() => {
        const quiet = performance.now() - lastTouch.current;
        if (quiet < QUIET_MS) {
          later(QUIET_MS - quiet);
          return;
        }
        if (isBusy()) {
          later(TOUR_FIRST_MS);
          return;
        }
        steps += 1;
        readTimer = tourStep(
          (steps - 1) % count,
          steps % TOUR_READ_EVERY === 0
        );
        later(TOUR_EVERY_MS);
      }, delay);
    };
    later(TOUR_FIRST_MS);
    return () => {
      window.clearTimeout(timer);
      window.clearTimeout(readTimer);
    };
  }, [count, isTouring, lastTouch]);

  const preview = (slot: number | null) => {
    touch();
    setHovered(slot);
    const card = slot === null ? undefined : catalog.cards[slot];
    setFigureFocus(STATION_ID, card ? focusLine(card) : null);
  };

  const onCardClick = (event: MouseEvent<Element>, slot: number) => {
    touch();
    if (!isPlainClick(event) || !motion.canAnimate || motion.isReading()) {
      return;
    }
    event.preventDefault();
    feed(slot, true);
  };

  const onCardKey = (event: KeyboardEvent<Element>, slot: number) => {
    const next = slotAfterKey(event.key, slot, count);
    if (next === null) {
      return;
    }
    event.preventDefault();
    root.current?.querySelector<SVGAElement>(`a[data-card="${next}"]`)?.focus();
  };

  const bindCard = (slot: number) => (node: SVGGElement | null) => {
    nodes.current.cards[slot] = node;
  };

  const shownCard = lifted === null ? undefined : catalog.cards[lifted];
  const seatedCard =
    seatedSlot === null ? undefined : catalog.cards[seatedSlot];

  return (
    <div
      className="flex flex-col gap-3"
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) {
          setIsEngaged(false);
          preview(null);
        }
      }}
      onFocus={() => {
        touch();
        setIsEngaged(true);
      }}
      onPointerEnter={(event: PointerEvent) => {
        if (event.pointerType === "mouse") {
          touch();
          setIsEngaged(true);
        }
      }}
      onPointerLeave={() => {
        touch();
        setIsEngaged(false);
      }}
    >
      <figure
        className="iso m-0 flex flex-col gap-2"
        data-build-block
        data-build-self
        data-figure={STATION_ID}
        ref={root}
      >
        <CatalogCardFrame card={shownCard} catalog={catalog}>
          <div className="-my-1 touch-pan-y overflow-hidden px-1 select-none sm:px-4">
            <p aria-live="polite" className="sr-only">
              {spoken}
            </p>
            <svg
              aria-label={label}
              className="iso-svg"
              viewBox={`0 0 ${CATALOG_WIDTH} ${CATALOG_HEIGHT}`}
            >
              <defs>
                <clipPath clipPathUnits="userSpaceOnUse" id={clipId}>
                  <path d={rig.clip} />
                </clipPath>
              </defs>
              {parts.base}
              <g data-part="tray">{parts.trayBack}</g>
              {catalog.cards.map((card, slot) => (
                <g data-part={`card-${slot}`} key={card.id}>
                  <a
                    aria-label={spokenCard(card)}
                    className="focus-visible:outline-ink cursor-pointer outline-none focus-visible:outline-1 focus-visible:outline-offset-2 focus-visible:outline-solid"
                    data-card={slot}
                    href={card.url}
                    onClick={(event) => onCardClick(event, slot)}
                    onFocus={() => preview(slot)}
                    onKeyDown={(event) => onCardKey(event, slot)}
                    onPointerEnter={(event) => {
                      if (event.pointerType === "mouse") {
                        preview(slot);
                      }
                    }}
                    onPointerLeave={() => preview(null)}
                    rel="noreferrer"
                    target="_blank"
                  >
                    <g
                      data-on={slot === lifted ? "" : undefined}
                      ref={bindCard(slot)}
                    >
                      {parts.cards[slot]}
                    </g>
                  </a>
                </g>
              ))}
              <g data-part="tray">{parts.trayFront}</g>
              <g data-part="reader">
                {parts.reader}
                <Counter art={counter} text={counterText(seatedCard)} />
              </g>
              <g aria-hidden clipPath={`url(#${clipId})`}>
                <g
                  data-on=""
                  ref={(node) => {
                    nodes.current.overlay = node;
                  }}
                  visibility="hidden"
                >
                  {readingSlot === null ? null : parts.cards[readingSlot]}
                </g>
              </g>
              <g data-part="reader">
                <g data-on={seatedCard ? "" : undefined}>{parts.lamp}</g>
                <g
                  className="transition-transform duration-150 ease-out motion-reduce:transition-none"
                  ref={key}
                  style={{
                    transform: seatedCard
                      ? `translateY(${KEY_TRAVEL}px)`
                      : undefined,
                  }}
                >
                  {parts.key}
                </g>
              </g>
            </svg>
          </div>
        </CatalogCardFrame>
        <figcaption className="text-graphite text-sm leading-relaxed text-pretty">
          {caption}
        </figcaption>
      </figure>
    </div>
  );
};
