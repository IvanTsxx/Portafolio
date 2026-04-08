"use server";

import { Redis } from "@upstash/redis";
import { cookies } from "next/headers";

const redis = Redis.fromEnv();

export async function getVisitorData(): Promise<{
  visitorNumber: number | null;
  totalVisits: number;
}> {
  const cookieStore = await cookies();
  const existingVisitor = cookieStore.get("visitor_id");

  const totalVisits = (await redis.get<number>("total_visits")) ?? 0;

  if (existingVisitor) {
    return {
      totalVisits,
      visitorNumber: Number(existingVisitor.value),
    };
  }

  return { totalVisits, visitorNumber: null };
}

export async function registerNewVisitor(): Promise<{ visitorNumber: number }> {
  const cookieStore = await cookies();
  const visitorNumber = await redis.incr("total_visits");

  cookieStore.set("visitor_id", String(visitorNumber), {
    httpOnly: true,
    maxAge: 60 * 60 * 24 * 365,
    sameSite: "lax",
  });

  return { visitorNumber };
}
