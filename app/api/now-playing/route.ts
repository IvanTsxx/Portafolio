import { connection, NextResponse } from "next/server";

import { isSpotifyConfigured, readNowPlaying } from "@/lib/spotify/now-playing";

export const GET = async () => {
  await connection();
  if (!isSpotifyConfigured()) {
    return NextResponse.json(
      { error: "Spotify is not configured" },
      { status: 503 }
    );
  }
  const track = await readNowPlaying().catch(() => null);
  return NextResponse.json(
    { track },
    {
      headers: {
        "Cache-Control": "public, s-maxage=30, stale-while-revalidate=60",
      },
    }
  );
};
