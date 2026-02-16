import { cache } from "react";
import { env } from "@/env/server";

const LASTFM_ENDPOINT = "https://ws.audioscrobbler.com/2.0/";

interface LastFmResponse {
  recenttracks: {
    track: Array<{
      name: string;
      artist: { "#text": string };
      album: { "#text": string };
      image: { "#text": string; size: string }[];
      "@attr"?: { nowplaying: "true" };
      url: string;
    }>;
  };
}

export const getNowPlaying = cache(async () => {
  try {
    const url = new URL(LASTFM_ENDPOINT);
    url.searchParams.set("method", "user.getrecenttracks");
    url.searchParams.set("user", env.LASTFM_USERNAME);
    url.searchParams.set("api_key", env.LASTFM_API_KEY);
    url.searchParams.set("format", "json");
    url.searchParams.set("limit", "1");

    const res = await fetch(url.toString(), {
      next: { revalidate: 21_600 },
    });

    if (!res.ok) {
      return { isPlaying: false };
    }

    const data = (await res.json()) as LastFmResponse;
    const track = data.recenttracks.track[0];

    if (!track) {
      return { isPlaying: false };
    }

    const isPlaying = track["@attr"]?.nowplaying === "true";

    return {
      isPlaying,
      title: track.name,
      artist: track.artist["#text"],
      album: track.album["#text"],
      albumImageUrl:
        track.image.find((img) => img.size === "extralarge")?.["#text"] ??
        track.image.at(-1)?.["#text"],
      songUrl: track.url,
    };
  } catch (error) {
    console.error("Last.fm error", error);
    return { isPlaying: false };
  }
});
