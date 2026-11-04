"use client";

import { useSyncExternalStore } from "react";

interface PlaybackUpdate {
  data: {
    duration: number;
    isBuffering: boolean;
    isPaused: boolean;
    position: number;
  };
}

interface SpotifyController {
  addListener: (
    event: "playback_update" | "ready",
    listener: (update: PlaybackUpdate) => void
  ) => void;
  loadUri: (uri: string) => void;
  play: () => void;
  seek: (seconds: number) => void;
  togglePlay: () => void;
}

interface SpotifyIframeApi {
  createController: (
    host: HTMLElement,
    options: { height: number; uri: string; width: number },
    onCreated: (controller: SpotifyController) => void
  ) => void;
}

declare global {
  interface Window {
    onSpotifyIframeApiReady?: (api: SpotifyIframeApi) => void;
  }
}

export type PlayerStatus = "idle" | "loading" | "paused" | "playing";

export interface PlayerState {
  duration: number;
  position: number;
  status: PlayerStatus;
  trackId: string | null;
}

const apiSource = "https://open.spotify.com/embed/iframe-api/v1";
const idleState: PlayerState = {
  duration: 0,
  position: 0,
  status: "idle",
  trackId: null,
};

let state = idleState;
let controller: SpotifyController | null = null;
let apiRequest: Promise<SpotifyIframeApi> | null = null;
const listeners = new Set<() => void>();

const publish = (next: Partial<PlayerState>) => {
  state = { ...state, ...next };
  for (const listener of listeners) {
    listener();
  }
};

const trackUri = (trackId: string) => `spotify:track:${trackId}`;

const loadApi = () => {
  if (apiRequest) {
    return apiRequest;
  }
  const { promise, resolve } = Promise.withResolvers<SpotifyIframeApi>();
  window.onSpotifyIframeApiReady = resolve;
  const script = document.createElement("script");
  script.async = true;
  script.src = apiSource;
  document.body.append(script);
  apiRequest = promise;
  return promise;
};

const createHiddenHost = () => {
  const frame = document.createElement("div");
  frame.setAttribute("aria-hidden", "true");
  frame.style.cssText =
    "position:fixed;left:0;bottom:0;width:300px;height:80px;opacity:0;pointer-events:none;z-index:-1;";
  const host = document.createElement("div");
  frame.append(host);
  document.body.append(frame);
  return host;
};

const handlePlayback = ({ data }: PlaybackUpdate) => {
  publish({
    duration: data.duration,
    position: data.position,
    status: data.isPaused && !data.isBuffering ? "paused" : "playing",
  });
};

const startController = async (trackId: string) => {
  const api = await loadApi();
  api.createController(
    createHiddenHost(),
    { height: 80, uri: trackUri(trackId), width: 300 },
    (created) => {
      controller = created;
      created.addListener("ready", () => created.play());
      created.addListener("playback_update", handlePlayback);
    }
  );
};

export const togglePlayback = (trackId: string) => {
  if (state.trackId === trackId && controller) {
    controller.togglePlay();
    return;
  }
  publish({ duration: 0, position: 0, status: "loading", trackId });
  if (controller) {
    controller.loadUri(trackUri(trackId));
    controller.play();
    return;
  }
  void startController(trackId);
};

export const seekPlayback = (positionMs: number) => {
  if (!controller) {
    return;
  }
  publish({ position: positionMs });
  controller.seek(positionMs / 1000);
};

const subscribe = (listener: () => void) => {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
};

const getSnapshot = () => state;
const getServerSnapshot = () => idleState;

export const useSpotifyPlayer = () =>
  useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
