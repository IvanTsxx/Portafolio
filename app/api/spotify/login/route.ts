import { connection, NextResponse } from "next/server";

import { authorizeUrl, isDevelopment } from "@/lib/spotify/auth";

export const GET = async () => {
  await connection();
  const clientId = process.env.SPOTIFY_CLIENT_ID;
  if (!(isDevelopment() && clientId)) {
    return new NextResponse("Not found", { status: 404 });
  }
  return NextResponse.redirect(authorizeUrl(clientId));
};
