import { env } from "@/env/server";

const client_id = env.SPOTIFY_CLIENT_ID;
const client_secret = env.SPOTIFY_CLIENT_SECRET;
const refresh_token = env.SPOTIFY_REFRESH_TOKEN;

const basic = Buffer.from(`${client_id}:${client_secret}`).toString("base64");
const NOW_PLAYING_ENDPOINT = `https://api.spotify.com/v1/me/player/currently-playing`;
const TOKEN_ENDPOINT = `https://accounts.spotify.com/api/token`;

const getAccessToken = async () => {
  if (!refresh_token) return { access_token: "mock_token" }; // Mock mode support if envs missing

  const response = await fetch(TOKEN_ENDPOINT, {
    method: "POST",
    headers: {
      Authorization: `Basic ${basic}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({
      grant_type: "refresh_token",
      refresh_token,
    }),
  });

  return response.json();
};

export const getNowPlaying = async () => {
  /*  if (!client_id || !client_secret || !refresh_token) {
    // Mock data if keys are missing
    return {
      isPlaying: true,
      title: "Music for Programming",
      artist: "Mock Spotify",
      album: "Mock Album",
      albumImageUrl:
        "https://i.scdn.co/image/ab67616d0000b273b5247970ba7f09de814041e1",
      songUrl: "https://spotify.com",
    };
  } */

  try {
    /*     const { access_token } = await getAccessToken();
     */
    const response = await fetch(NOW_PLAYING_ENDPOINT, {
      headers: {
        Authorization: `Bearer BQCAoiKG9SW3Kn8HrZskjVdtJwHqEuJbeeuBLWPA81`,
      },
      next: { revalidate: 30 }, // Cache for 30s
    });

    if (response.status === 204 || response.status > 400) {
      return { isPlaying: false };
    }

    const song = await response.json();

    if (song.item === null) {
      return { isPlaying: false };
    }

    const isPlaying = song.is_playing;
    const title = song.item.name;
    const artist = song.item.artists
      .map((_artist: any) => _artist.name)
      .join(", ");
    const album = song.item.album.name;
    const albumImageUrl = song.item.album.images[0].url;
    const songUrl = song.item.external_urls.spotify;

    return {
      isPlaying,
      title,
      artist,
      album,
      albumImageUrl,
      songUrl,
    };
  } catch (error) {
    console.error("Error fetching Spotify data", error);
    return { isPlaying: false };
  }
};
