import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { z } from "zod";

import { isDevelopment, spotifyRedirectUri } from "@/lib/spotify/auth";

const tokenSchema = z.object({ refresh_token: z.string() });

const plain = (body: string, status = 200) =>
  new NextResponse(body, {
    headers: { "Cache-Control": "no-store", "Content-Type": "text/plain" },
    status,
  });

export const GET = async (request: NextRequest) => {
  const clientId = process.env.SPOTIFY_CLIENT_ID;
  const clientSecret = process.env.SPOTIFY_CLIENT_SECRET;
  if (!(isDevelopment() && clientId && clientSecret)) {
    return plain("Not found", 404);
  }
  const code = request.nextUrl.searchParams.get("code");
  if (!code) {
    return plain(
      `Spotify did not return a code: ${request.nextUrl.searchParams.get("error") ?? "unknown"}`,
      400
    );
  }
  const response = await fetch("https://accounts.spotify.com/api/token", {
    body: new URLSearchParams({
      code,
      grant_type: "authorization_code",
      redirect_uri: spotifyRedirectUri,
    }),
    cache: "no-store",
    headers: {
      Authorization: `Basic ${btoa(`${clientId}:${clientSecret}`)}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    method: "POST",
  });
  const parsed = tokenSchema.safeParse(await response.json());
  if (!(response.ok && parsed.success)) {
    return plain(
      "Spotify rejected the code. Start again at /api/spotify/login.",
      400
    );
  }
  return plain(
    `Add this line to .env.local and to the Vercel project env, then restart the dev server:\n\nSPOTIFY_REFRESH_TOKEN=${parsed.data.refresh_token}\n`
  );
};
