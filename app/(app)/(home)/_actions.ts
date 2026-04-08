// app/_actions/track-visitor.ts
"use server";

import { Redis } from "@upstash/redis";
import { cookies } from "next/headers";

const redis = Redis.fromEnv();

export async function trackVisitor(): Promise<{
  visitorNumber: number;
  totalVisits: number;
}> {
  const cookieStore = await cookies();
  const existingVisitor = cookieStore.get("visitor_id");

  let visitorNumber: number;

  if (existingVisitor) {
    visitorNumber = Number(existingVisitor.value);
  } else {
    visitorNumber = await redis.incr("total_visits");

    cookieStore.set("visitor_id", String(visitorNumber), {
      httpOnly: true,
      maxAge: 60 * 60 * 24 * 365,
      sameSite: "lax",
    });
  }

  const totalVisits = await redis.get<number>("total_visits");

  return { totalVisits: totalVisits ?? 0, visitorNumber };
}
