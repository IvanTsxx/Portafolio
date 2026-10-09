"use client";

import { cva } from "class-variance-authority";
import type { VariantProps } from "class-variance-authority";
import { useEffect, useRef } from "react";
import type { ComponentProps } from "react";

import { cn } from "@/lib/utils";
import { usePrefersReducedMotion } from "@/registry/ivan/hooks/use-prefers-reduced-motion";

const textScrambleVariants = cva(
  "relative inline-grid max-w-full [&_[data-resolved=false]]:text-(--ts-noise)",
  {
    defaultVariants: { tone: "default", variant: "label" },
    variants: {
      tone: {
        accent: "text-clay [--ts-noise:var(--foreground)]",
        default: "text-foreground [--ts-noise:var(--clay)]",
        muted: "text-muted-foreground [--ts-noise:var(--clay)]",
      },
      variant: {
        body: "font-mono text-sm leading-6",
        heading: "font-mono text-2xl leading-8 font-medium tracking-tight",
        label: "font-mono text-xs tracking-widest uppercase",
      },
    },
  }
);

const scrambleCharsets = {
  alpha: "ABCDEFGHIJKLMNOPQRSTUVWXYZ",
  binary: "01",
  blocks: "░▒▓█▌▐",
  hex: "0123456789ABCDEF",
  technical: "01/\\|+-_<>[]#",
} as const;

type ScrambleCharset = keyof typeof scrambleCharsets;
type ScrambleTrigger = "mount" | "visible" | "hover" | "manual";
type ScrambleElement = "span" | "p" | "div" | "h1" | "h2" | "h3" | "h4";

interface TextScrambleProps
  extends
    Omit<ComponentProps<"span">, "children" | "ref">,
    VariantProps<typeof textScrambleVariants> {
  as?: ScrambleElement;
  characters?: string;
  charset?: ScrambleCharset;
  duration?: number;
  once?: boolean;
  replayKey?: number | string;
  text: string;
  trigger?: ScrambleTrigger;
}

const shuffleInterval = 45;
const visibleThreshold = 0.5;
const resolveSpread = 0.7;

const isWhitespace = (character: string) => character.trim() === "";

const pickCharacter = (pool: readonly string[], fallback: string) =>
  pool[Math.floor(Math.random() * pool.length)] ?? fallback;

const renderGlyphs = (
  display: HTMLElement,
  characters: readonly string[],
  pool: readonly string[],
  scrambled: boolean
) => {
  const glyphs = characters.map((character) => {
    const glyph = document.createElement("span");
    const hidden = scrambled && !isWhitespace(character);
    glyph.dataset.resolved = hidden ? "false" : "true";
    glyph.textContent = hidden ? pickCharacter(pool, character) : character;
    return glyph;
  });
  display.replaceChildren(...glyphs);
  return glyphs;
};

const buildResolveTimes = (count: number, duration: number) =>
  Array.from({ length: count }, (_, index) => {
    const progress = count > 1 ? index / (count - 1) : 0;
    return (
      progress * duration * resolveSpread +
      Math.random() * duration * (1 - resolveSpread)
    );
  });

const runScramble = (
  display: HTMLElement,
  text: string,
  pool: readonly string[],
  duration: number
) => {
  const characters = [...text];
  const glyphs = renderGlyphs(display, characters, pool, true);
  const resolveTimes = buildResolveTimes(characters.length, duration);
  let frameId = 0;
  let startedAt = 0;
  let lastShuffle = Number.NEGATIVE_INFINITY;

  const step = (now: number) => {
    if (startedAt === 0) {
      startedAt = now;
    }
    const elapsed = now - startedAt;
    const shouldShuffle = now - lastShuffle >= shuffleInterval;
    if (shouldShuffle) {
      lastShuffle = now;
    }
    let pending = 0;

    for (const [index, glyph] of glyphs.entries()) {
      const character = characters[index] ?? "";
      if (isWhitespace(character) || glyph.dataset.resolved === "true") {
        continue;
      }
      if (elapsed >= (resolveTimes[index] ?? 0)) {
        glyph.textContent = character;
        glyph.dataset.resolved = "true";
        continue;
      }
      pending += 1;
      if (shouldShuffle) {
        glyph.textContent = pickCharacter(pool, character);
      }
    }

    if (pending > 0) {
      frameId = requestAnimationFrame(step);
    }
  };

  step(performance.now());

  return () => cancelAnimationFrame(frameId);
};

const TextScramble = ({
  as: Tag = "span",
  characters,
  charset = "technical",
  className,
  duration = 900,
  once = true,
  onFocus,
  onPointerEnter,
  replayKey,
  text,
  tone,
  trigger = "visible",
  variant,
  ...props
}: TextScrambleProps) => {
  const displayRef = useRef<HTMLSpanElement>(null);
  const playRef = useRef<(() => void) | null>(null);
  const lastReplayKeyRef = useRef(replayKey);
  const reducedMotion = usePrefersReducedMotion();
  const poolSource = characters ?? scrambleCharsets[charset];

  useEffect(() => {
    const display = displayRef.current;
    if (!display || reducedMotion) {
      return;
    }
    const pool = [...poolSource];
    const textCharacters = [...text];
    let cancel: (() => void) | null = null;
    let observer: IntersectionObserver | null = null;

    const play = () => {
      cancel?.();
      cancel = runScramble(display, text, pool, duration);
    };
    playRef.current = play;

    if (trigger === "mount") {
      play();
    } else if (trigger === "visible") {
      renderGlyphs(display, textCharacters, pool, true);
      observer = new IntersectionObserver(
        (entries) => {
          if (!entries.some((entry) => entry.isIntersecting)) {
            return;
          }
          play();
          if (once) {
            observer?.disconnect();
          }
        },
        { threshold: visibleThreshold }
      );
      observer.observe(display);
    } else if (trigger === "manual" && lastReplayKeyRef.current !== replayKey) {
      lastReplayKeyRef.current = replayKey;
      play();
    }

    return () => {
      cancel?.();
      observer?.disconnect();
      playRef.current = null;
      display.textContent = text;
    };
  }, [duration, once, poolSource, reducedMotion, replayKey, text, trigger]);

  const playOnHover = () => {
    if (trigger === "hover") {
      playRef.current?.();
    }
  };

  const handleFocus: ComponentProps<"span">["onFocus"] = (event) => {
    playOnHover();
    onFocus?.(event);
  };

  const handlePointerEnter: ComponentProps<"span">["onPointerEnter"] = (
    event
  ) => {
    playOnHover();
    onPointerEnter?.(event);
  };

  return (
    <Tag
      className={cn(textScrambleVariants({ tone, variant }), className)}
      data-slot="text-scramble"
      {...props}
      onFocus={handleFocus}
      onPointerEnter={handlePointerEnter}
    >
      <span className="col-start-1 row-start-1 opacity-0">{text}</span>
      <span
        aria-hidden="true"
        className="col-start-1 row-start-1"
        ref={displayRef}
      >
        {text}
      </span>
    </Tag>
  );
};

export { TextScramble };
export type {
  ScrambleCharset,
  ScrambleElement,
  ScrambleTrigger,
  TextScrambleProps,
};
