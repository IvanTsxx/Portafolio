import { z } from "zod";

const tokenEndpoint = "https://accounts.spotify.com/api/token";
const currentlyPlayingEndpoint =
  "https://api.spotify.com/v1/me/player/currently-playing";
const recentlyPlayedEndpoint =
  "https://api.spotify.com/v1/me/player/recently-played?limit=1";

const trackSchema = z.object({
  album: z.object({
    images: z.array(z.object({ height: z.number().nullable(), url: z.url() })),
    name: z.string(),
  }),
  artists: z.array(z.object({ name: z.string() })).min(1),
  duration_ms: z.number(),
  external_urls: z.object({ spotify: z.url() }),
  id: z.string(),
  name: z.string(),
});

const currentlyPlayingSchema = z.object({
  currently_playing_type: z.string(),
  is_playing: z.boolean(),
  item: trackSchema.nullable(),
  progress_ms: z.number().nullable(),
});

const recentlyPlayedSchema = z.object({
  items: z.array(z.object({ played_at: z.string(), track: trackSchema })),
});

const tokenSchema = z.object({
  access_token: z.string(),
  expires_in: z.number(),
});

const tokenRefreshMarginMs = 60_000;

let cachedAccessToken: { expiresAt: number; value: string } | null = null;

export interface NowPlaying {
  album: string;
  capturedAt: number;
  artist: string;
  cover: string | null;
  durationMs: number;
  id: string;
  isPlaying: boolean;
  playedAt: string | null;
  progressMs: number | null;
  title: string;
  url: string;
}

const spotifyCredentials = () => {
  const clientId = process.env.SPOTIFY_CLIENT_ID;
  const clientSecret = process.env.SPOTIFY_CLIENT_SECRET;
  const refreshToken = process.env.SPOTIFY_REFRESH_TOKEN;
  return clientId && clientSecret && refreshToken
    ? { clientId, clientSecret, refreshToken }
    : null;
};

export const isSpotifyConfigured = () => spotifyCredentials() !== null;

const requestAccessToken = async () => {
  const credentials = spotifyCredentials();
  if (!credentials) {
    return null;
  }
  const response = await fetch(tokenEndpoint, {
    body: new URLSearchParams({
      grant_type: "refresh_token",
      refresh_token: credentials.refreshToken,
    }),
    cache: "no-store",
    headers: {
      Authorization: `Basic ${btoa(`${credentials.clientId}:${credentials.clientSecret}`)}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    method: "POST",
  });
  if (!response.ok) {
    return null;
  }
  const parsed = tokenSchema.safeParse(await response.json());
  if (!parsed.success) {
    return null;
  }
  cachedAccessToken = {
    expiresAt:
      Date.now() + parsed.data.expires_in * 1000 - tokenRefreshMarginMs,
    value: parsed.data.access_token,
  };
  return cachedAccessToken.value;
};

const readAccessToken = () =>
  cachedAccessToken && cachedAccessToken.expiresAt > Date.now()
    ? cachedAccessToken.value
    : requestAccessToken();

const coverTargetPx = 160;

const pickCover = (images: z.infer<typeof trackSchema>["album"]["images"]) => {
  const fitting = images
    .filter((image) => (image.height ?? 0) >= coverTargetPx)
    .toSorted((first, second) => (first.height ?? 0) - (second.height ?? 0));
  return (fitting[0] ?? images[0])?.url ?? null;
};

const toNowPlaying = (
  track: z.infer<typeof trackSchema>,
  isPlaying: boolean,
  playedAt: string | null,
  progressMs: number | null
): NowPlaying => ({
  album: track.album.name,
  artist: track.artists.map((artist) => artist.name).join(", "),
  capturedAt: Date.now(),
  cover: pickCover(track.album.images),
  durationMs: track.duration_ms,
  id: track.id,
  isPlaying,
  playedAt,
  progressMs,
  title: track.name,
  url: track.external_urls.spotify,
});

const readCurrentlyPlaying = async (token: string) => {
  const response = await fetch(currentlyPlayingEndpoint, {
    cache: "no-store",
    headers: { Authorization: `Bearer ${token}` },
  });
  if (response.status !== 200) {
    return null;
  }
  const parsed = currentlyPlayingSchema.safeParse(await response.json());
  if (!parsed.success || !parsed.data.item || !parsed.data.is_playing) {
    return null;
  }
  return toNowPlaying(parsed.data.item, true, null, parsed.data.progress_ms);
};

const readRecentlyPlayed = async (token: string) => {
  const response = await fetch(recentlyPlayedEndpoint, {
    cache: "no-store",
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!response.ok) {
    return null;
  }
  const parsed = recentlyPlayedSchema.safeParse(await response.json());
  const [latest] = parsed.success ? parsed.data.items : [];
  return latest
    ? toNowPlaying(latest.track, false, latest.played_at, null)
    : null;
};

export const readNowPlaying = async (): Promise<NowPlaying | null> => {
  const token = await readAccessToken();
  if (!token) {
    return null;
  }
  return (
    (await readCurrentlyPlaying(token)) ?? (await readRecentlyPlayed(token))
  );
};
