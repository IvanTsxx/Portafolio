import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

import { getExperiment } from "@/lib/lab/experiments";
import { toggleRequestSchema, visitorIdSchema } from "@/lib/reactions/kinds";
import { getReactionStore } from "@/lib/reactions/store";

const visitorCookie = "lab_visitor";
const oneYearSeconds = 60 * 60 * 24 * 365;

const readVisitor = (request: NextRequest) => {
  const parsed = visitorIdSchema.safeParse(
    request.cookies.get(visitorCookie)?.value
  );
  return parsed.success ? parsed.data : null;
};

const unavailable = () =>
  NextResponse.json({ error: "Reactions are not configured" }, { status: 503 });

const unknownExperiment = () =>
  NextResponse.json({ error: "Unknown experiment" }, { status: 404 });

export const GET = async (
  request: NextRequest,
  { params }: RouteContext<"/api/reactions/[slug]">
) => {
  const { slug } = await params;
  if (!getExperiment(slug)) {
    return unknownExperiment();
  }
  const store = getReactionStore();
  if (!store) {
    return unavailable();
  }
  return NextResponse.json(await store.read(slug, readVisitor(request)), {
    headers: { "Cache-Control": "no-store" },
  });
};

export const POST = async (
  request: NextRequest,
  { params }: RouteContext<"/api/reactions/[slug]">
) => {
  const { slug } = await params;
  if (!getExperiment(slug)) {
    return unknownExperiment();
  }
  const store = getReactionStore();
  if (!store) {
    return unavailable();
  }
  const body = toggleRequestSchema.safeParse(
    await request.json().catch(() => null)
  );
  if (!body.success) {
    return NextResponse.json({ error: "Invalid reaction" }, { status: 400 });
  }
  const visitor = readVisitor(request) ?? crypto.randomUUID();
  const snapshot = await store.toggle(
    slug,
    body.data.kind,
    visitor,
    body.data.active
  );
  const response = NextResponse.json(snapshot, {
    headers: { "Cache-Control": "no-store" },
  });
  response.cookies.set(visitorCookie, visitor, {
    httpOnly: true,
    maxAge: oneYearSeconds,
    path: "/",
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
  });
  return response;
};
