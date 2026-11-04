"use client";

import { Slider as SliderPrimitive } from "@base-ui/react/slider";
import {
  ArrowUpRightIcon,
  CircleNotchIcon,
  PauseIcon,
  PlayIcon,
} from "@phosphor-icons/react";
import Image from "next/image";
import { useState, useSyncExternalStore } from "react";
import { z } from "zod";

import {
  seekPlayback,
  togglePlayback,
  useSpotifyPlayer,
} from "@/components/home/spotify-player";
import type {
  PlayerState,
  PlayerStatus,
} from "@/components/home/spotify-player";
import { focusRingClassName } from "@/components/site/styles";
import { cn } from "@/lib/utils";

const nowPlayingSchema = z.object({
  track: z
    .object({
      album: z.string(),
      artist: z.string(),
      capturedAt: z.number(),
      cover: z.url().nullable(),
      durationMs: z.number(),
      id: z.string(),
      isPlaying: z.boolean(),
      playedAt: z.string().nullable(),
      progressMs: z.number().nullable(),
      title: z.string(),
      url: z.url(),
    })
    .nullable(),
});

type Track = NonNullable<z.infer<typeof nowPlayingSchema>["track"]>;

type PlayingState =
  | { status: "loading" }
  | { status: "hidden" }
  | { status: "ready"; track: Track };

const pollMs = 30_000;

const equalizerBars = ["wait-0", "wait-200", "wait-400"] as const;

const fetchNowPlaying = async (): Promise<PlayingState> => {
  try {
    const response = await fetch("/api/now-playing");
    if (!response.ok) {
      return { status: "hidden" };
    }
    const parsed = nowPlayingSchema.safeParse(await response.json());
    return parsed.success && parsed.data.track
      ? { status: "ready", track: parsed.data.track }
      : { status: "hidden" };
  } catch {
    return { status: "hidden" };
  }
};

let latest: PlayingState = { status: "loading" };
let timer = 0;
const listeners = new Set<() => void>();

const refresh = async () => {
  latest = await fetchNowPlaying();
  for (const listener of listeners) {
    listener();
  }
};

const subscribe = (listener: () => void) => {
  listeners.add(listener);
  if (listeners.size === 1) {
    refresh();
    timer = window.setInterval(refresh, pollMs);
  }
  return () => {
    listeners.delete(listener);
    if (listeners.size === 0) {
      window.clearInterval(timer);
    }
  };
};

const getSnapshot = () => latest;
const loadingState: PlayingState = { status: "loading" };
const getServerSnapshot = () => loadingState;

const relativeTime = new Intl.RelativeTimeFormat("en", { numeric: "auto" });

const relativeSteps = [
  { seconds: 86_400, unit: "day" },
  { seconds: 3600, unit: "hour" },
  { seconds: 60, unit: "minute" },
] as const;

const formatPlayedAt = (playedAt: string) => {
  const elapsed = (Date.now() - Date.parse(playedAt)) / 1000;
  const step = relativeSteps.find(({ seconds }) => elapsed >= seconds);
  return step
    ? relativeTime.format(-Math.floor(elapsed / step.seconds), step.unit)
    : "just now";
};

const Equalizer = () => (
  <span aria-hidden className="flex h-3 items-end gap-px">
    {equalizerBars.map((delay) => (
      <span
        className={cn("equalizer-bar bg-signal w-0.5", delay)}
        key={delay}
      />
    ))}
  </span>
);

const LiveBadge = () => (
  <span className="text-signal border-signal/40 rounded-pill flex items-center gap-1.5 border px-2 py-0.5">
    <span aria-hidden className="relative flex size-1.5">
      <span className="bg-signal absolute inset-0 rounded-full opacity-75 motion-safe:animate-ping" />
      <span className="bg-signal relative size-1.5 rounded-full" />
    </span>
    Live
  </span>
);

const playbackFraction = (track: Track) =>
  track.progressMs === null
    ? 0
    : Math.min(
        1,
        (track.progressMs + Date.now() - track.capturedAt) / track.durationMs
      );

const runProgress = (track: Track) => (bar: HTMLSpanElement | null) => {
  if (!bar) {
    return;
  }
  const from = playbackFraction(track);
  const animation = bar.animate([{ scale: `${from} 1` }, { scale: "1 1" }], {
    duration: Math.max(0, track.durationMs * (1 - from)),
    easing: "linear",
    fill: "forwards",
  });
  return () => animation.cancel();
};

const PlaybackProgress = ({ track }: { track: Track }) => (
  <span
    aria-hidden
    className="bg-border rounded-pill relative block h-0.5 w-full overflow-hidden"
  >
    <span
      className="bg-foreground absolute inset-0 origin-left scale-x-0"
      key={`${track.id}-${track.capturedAt}`}
      ref={runProgress(track)}
    />
  </span>
);

const CoverGlyph = ({ status }: { status: PlayerStatus }) => {
  if (status === "loading") {
    return <CircleNotchIcon className="size-4 animate-spin" weight="bold" />;
  }
  if (status === "playing") {
    return <PauseIcon className="size-4" weight="fill" />;
  }
  return <PlayIcon className="size-4" weight="fill" />;
};

const TrackRow = ({
  onToggle,
  status,
  track,
}: {
  onToggle: () => void;
  status: PlayerStatus;
  track: Track;
}) => {
  const isActive = status !== "idle";
  return (
    <div className="flex items-center gap-3">
      <button
        aria-label={`${status === "playing" ? "Pause" : "Play"} ${track.title} by ${track.artist}`}
        aria-pressed={status === "playing"}
        className={cn(
          "group/cover bg-surface relative size-12 shrink-0 overflow-hidden rounded-sm",
          (track.isPlaying || isActive) && "ring-signal ring-2 ring-inset",
          focusRingClassName
        )}
        onClick={onToggle}
        type="button"
      >
        {track.cover ? (
          <Image
            alt=""
            className={cn(
              "ease-out-expo size-full object-cover transition-transform duration-500 pointer-fine:group-hover/cover:scale-105",
              (track.isPlaying || isActive) && "scale-85 rounded-xs"
            )}
            height={48}
            src={track.cover}
            width={48}
          />
        ) : null}
        <span
          className={cn(
            "bg-background/60 text-foreground ease-mechanical pointer-coarse:bg-background/30 absolute inset-0 grid place-items-center backdrop-blur-xs transition-opacity duration-200 group-hover/cover:opacity-100 group-focus-visible/cover:opacity-100 pointer-coarse:opacity-100",
            isActive ? "opacity-100" : "opacity-0"
          )}
        >
          <CoverGlyph status={status} />
        </span>
        {track.isPlaying && !isActive ? (
          <span className="bg-background/80 absolute bottom-1.5 left-1.5 rounded-xs p-0.5 transition-opacity duration-200 group-hover/cover:opacity-0">
            <Equalizer />
          </span>
        ) : null}
      </button>
      <div className="flex min-w-0 flex-1 flex-col">
        <span className="text-foreground truncate text-sm">{track.title}</span>
        <span className="text-muted-foreground truncate text-xs">
          {track.artist}
        </span>
      </div>
      <a
        aria-label="Open in Spotify"
        className={cn(
          "text-faint hover:text-signal grid size-8 shrink-0 place-items-center transition-colors duration-200",
          focusRingClassName
        )}
        href={track.url}
        rel="noopener"
        target="_blank"
      >
        <ArrowUpRightIcon className="size-4" weight="light" />
      </a>
    </div>
  );
};

const formatClock = (milliseconds: number) => {
  const seconds = Math.max(0, Math.round(milliseconds / 1000));
  return `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, "0")}`;
};

const PreviewProgress = ({ player }: { player: PlayerState }) => {
  const [dragging, setDragging] = useState<number | null>(null);
  const position = dragging ?? player.position;
  const duration = Math.max(player.duration, 1);
  return (
    <div className="flex flex-col gap-1">
      <SliderPrimitive.Root
        aria-label="Seek preview"
        max={duration}
        min={0}
        onValueChange={(next) =>
          setDragging(Array.isArray(next) ? (next[0] ?? 0) : next)
        }
        onValueCommitted={(next) => {
          seekPlayback(Array.isArray(next) ? (next[0] ?? 0) : next);
          setDragging(null);
        }}
        step={250}
        value={Math.min(position, duration)}
      >
        <SliderPrimitive.Control className="group/seek relative flex h-4 w-full cursor-pointer touch-none items-center select-none">
          <SliderPrimitive.Track className="bg-border rounded-pill relative h-0.5 w-full transition-[height] duration-200 group-hover/seek:h-1">
            <SliderPrimitive.Indicator className="bg-signal rounded-pill h-full" />
            <SliderPrimitive.Thumb
              aria-valuetext={`${formatClock(position)} of ${formatClock(duration)}`}
              className="bg-foreground ease-out-expo focus-visible:outline-focus size-2.5 rounded-full opacity-0 transition-[opacity,scale] duration-200 group-hover/seek:opacity-100 focus-visible:opacity-100 focus-visible:outline-1 focus-visible:outline-offset-2 data-dragging:scale-125 data-dragging:opacity-100 pointer-coarse:opacity-100"
            />
          </SliderPrimitive.Track>
        </SliderPrimitive.Control>
      </SliderPrimitive.Root>
      <div className="label text-faint flex justify-between tabular-nums">
        <span>{formatClock(position)}</span>
        <span>{formatClock(duration)}</span>
      </div>
    </div>
  );
};

const statusCaption = (track: Track, status: PlayerStatus) => {
  if (status !== "idle") {
    return "Preview";
  }
  return track.playedAt ? formatPlayedAt(track.playedAt) : "Listening now";
};

const CardProgress = ({
  player,
  status,
  track,
}: {
  player: PlayerState;
  status: PlayerStatus;
  track: Track;
}) => {
  if (status !== "idle") {
    return <PreviewProgress player={player} />;
  }
  return track.isPlaying ? <PlaybackProgress track={track} /> : null;
};

export const NowPlaying = () => {
  const state = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  const player = useSpotifyPlayer();

  if (state.status !== "ready") {
    return null;
  }

  const { track } = state;
  const status: PlayerStatus =
    player.trackId === track.id ? player.status : "idle";

  return (
    <section aria-label="Spotify" className="flex flex-col gap-3">
      <div className="label text-faint flex items-center justify-between gap-4 whitespace-nowrap">
        {track.isPlaying ? <LiveBadge /> : <span>Last played</span>}
        <span>{statusCaption(track, status)}</span>
      </div>
      <TrackRow
        onToggle={() => togglePlayback(track.id)}
        status={status}
        track={track}
      />
      <CardProgress player={player} status={status} track={track} />
    </section>
  );
};
